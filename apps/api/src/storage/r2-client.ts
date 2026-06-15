/**
 * r2-client.ts — almacenamiento en Cloudflare R2 (S3-compatible) (D-8, E1-S5).
 *
 * Subida server-side (PutObject) + descarga por presigned GET (vencimiento corto).
 * R2 es cero-egreso (NFR-5).
 *
 * MODO SIN CLAVES: si faltan las variables de R2, `disponible = false` y las
 * operaciones de export degradan con mensaje honesto en vez de tronar (E1-S5).
 */
import type { S3Client } from "@aws-sdk/client-s3";

interface ConfigR2 {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  endpoint: string;
}

function leerConfig(): ConfigR2 | null {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET;
  const endpoint =
    process.env.R2_ENDPOINT ??
    (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : undefined);

  if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !endpoint) {
    return null;
  }
  return { accountId, accessKeyId, secretAccessKey, bucket, endpoint };
}

export interface AlmacenR2 {
  readonly disponible: boolean;
  /** Sube un objeto privado. Devuelve la key. Lanza solo si está disponible y falla. */
  subir(key: string, cuerpo: Uint8Array | Buffer, contentType: string): Promise<string>;
  /** Genera una presigned GET URL de vencimiento corto. */
  urlDescarga(key: string, segundos?: number): Promise<string>;
}

class AlmacenR2NoDisponible implements AlmacenR2 {
  readonly disponible = false;
  async subir(): Promise<string> {
    throw new Error(
      "Almacenamiento no configurado: por ahora no puedo guardar el PDF. El reporte sigue disponible en pantalla.",
    );
  }
  async urlDescarga(): Promise<string> {
    throw new Error("Almacenamiento no configurado.");
  }
}

class AlmacenR2Activo implements AlmacenR2 {
  readonly disponible = true;
  private clientePromise: Promise<S3Client> | null = null;

  constructor(private readonly cfg: ConfigR2) {}

  private async cliente(): Promise<S3Client> {
    if (!this.clientePromise) {
      this.clientePromise = (async () => {
        const { S3Client } = await import("@aws-sdk/client-s3");
        return new S3Client({
          region: "auto",
          endpoint: this.cfg.endpoint,
          credentials: {
            accessKeyId: this.cfg.accessKeyId,
            secretAccessKey: this.cfg.secretAccessKey,
          },
        });
      })();
    }
    return this.clientePromise;
  }

  async subir(key: string, cuerpo: Uint8Array | Buffer, contentType: string): Promise<string> {
    const { PutObjectCommand } = await import("@aws-sdk/client-s3");
    const c = await this.cliente();
    await c.send(
      new PutObjectCommand({
        Bucket: this.cfg.bucket,
        Key: key,
        Body: cuerpo,
        ContentType: contentType,
      }),
    );
    return key;
  }

  async urlDescarga(key: string, segundos = 300): Promise<string> {
    const { GetObjectCommand } = await import("@aws-sdk/client-s3");
    const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");
    const c = await this.cliente();
    return getSignedUrl(
      c,
      new GetObjectCommand({ Bucket: this.cfg.bucket, Key: key }),
      { expiresIn: segundos },
    );
  }
}

export function crearAlmacenR2(): AlmacenR2 {
  const cfg = leerConfig();
  if (!cfg) return new AlmacenR2NoDisponible();
  return new AlmacenR2Activo(cfg);
}
