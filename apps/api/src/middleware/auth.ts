/**
 * auth.ts — verificación de identidad cross-service (D-1, E1-S3).
 *
 * web adjunta el JWT de Clerk (Authorization: Bearer). api lo verifica de forma
 * NETWORKLESS con @clerk/backend usando CLERK_JWT_KEY. De ahí saca el clerkUserId
 * y RESUELVE/CREA la fila Asesor; toda la tenencia se deriva de esa fila (NFR-8),
 * NUNCA del cuerpo de la petición.
 *
 * MODO ASESOR DEMO (E1-S6): en desarrollo sin claves de Clerk, la api acepta al
 * "asesor demo" sembrado para que La Oficina cargue. En PRODUCCIÓN el modo demo
 * requiere el opt-in explícito MODO_ASESOR_DEMO=1 — sin él, la api responde 503
 * en vez de abrirse en silencio (fail-closed, NFR-8).
 */
import type { Context, Next } from "hono";
import { prisma } from "@socrates/db";

export interface AuthedVars {
  asesorId: string;
  clerkUserId: string;
  esDemo: boolean;
}

const DEMO_CLERK_ID = "demo-asesor";

/** ¿Hay CUALQUIER señal de Clerk en el entorno? (incluida la del frontend) */
function clerkConfigurado(): boolean {
  return Boolean(
    process.env.CLERK_SECRET_KEY ||
      process.env.CLERK_JWT_KEY ||
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  );
}

/** ¿Tenemos con qué verificar tokens? (config completa del lado api) */
function clerkPuedeVerificar(): boolean {
  return Boolean(process.env.CLERK_SECRET_KEY || process.env.CLERK_JWT_KEY);
}

const RESPUESTA_SIN_CONFIGURAR = {
  error: {
    codigo: "SIN_CONFIGURAR",
    mensaje: "La oficina aún no está lista para recibirte. Avísale a tu administrador.",
  },
} as const;

/** Resuelve (o crea) la fila Asesor por clerkUserId. */
async function resolverAsesor(
  clerkUserId: string,
  datos?: { nombre?: string; email?: string },
): Promise<string> {
  const asesor = await prisma.asesor.upsert({
    where: { clerkUserId },
    update: {},
    create: {
      clerkUserId,
      nombre: datos?.nombre ?? null,
      email: datos?.email ?? null,
    },
  });
  return asesor.id;
}

/**
 * Middleware de autenticación. Inyecta `asesorId` en el contexto.
 * Rutas públicas (p.ej. GET /health) se montan ANTES de este middleware.
 */
export async function authMiddleware(c: Context, next: Next) {
  // ── Modo asesor demo: sin ninguna señal de Clerk ──────────────────────────
  if (!clerkConfigurado()) {
    // Candado de producción: el modo demo jamás se abre solo en producción.
    if (process.env.NODE_ENV === "production" && process.env.MODO_ASESOR_DEMO !== "1") {
      console.error(
        "[auth] producción sin Clerk y sin MODO_ASESOR_DEMO=1: la api no sirve datos (fail-closed).",
      );
      return c.json(RESPUESTA_SIN_CONFIGURAR, 503);
    }
    // Un token presente en modo demo delata una configuración partida (web con
    // Clerk, api sin llaves): jamás mapear a ese usuario al asesor demo.
    if (c.req.header("Authorization")) {
      console.error("[auth] llegó un token pero la api no tiene llaves de Clerk: revisa la configuración.");
      return c.json(
        { error: { codigo: "SIN_SESION", mensaje: "Tu sesión no se pudo validar. Vuelve a entrar." } },
        401,
      );
    }
    const asesorId = await resolverAsesor(DEMO_CLERK_ID, {
      nombre: "Carlos Hiram Chávez",
      email: "carloshiramchavez@icloud.com",
    });
    c.set("asesorId", asesorId);
    c.set("clerkUserId", DEMO_CLERK_ID);
    c.set("esDemo", true);
    await next();
    return;
  }

  // ── Clerk presente pero sin llaves de verificación: fail-closed ──────────
  if (!clerkPuedeVerificar()) {
    console.error(
      "[auth] Clerk configurado a medias (falta CLERK_JWT_KEY o CLERK_SECRET_KEY): la api no puede validar sesiones.",
    );
    return c.json(RESPUESTA_SIN_CONFIGURAR, 503);
  }

  // ── Verificación networkless del JWT de Clerk ─────────────────────────────
  const authHeader = c.req.header("Authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : undefined;

  if (!token) {
    return c.json(
      { error: { codigo: "SIN_SESION", mensaje: "Necesitas iniciar sesión." } },
      401,
    );
  }

  try {
    const { verifyToken } = await import("@clerk/backend");
    const payload = await verifyToken(token, {
      jwtKey: process.env.CLERK_JWT_KEY,
      secretKey: process.env.CLERK_SECRET_KEY,
      // El claim azp debe ser nuestro frontend (anti re-uso de tokens ajenos).
      authorizedParties: [process.env.WEB_ORIGIN ?? "http://localhost:3000"],
    });
    const clerkUserId = payload.sub;
    if (!clerkUserId) {
      return c.json(
        { error: { codigo: "SIN_SESION", mensaje: "Necesitas iniciar sesión." } },
        401,
      );
    }
    const asesorId = await resolverAsesor(clerkUserId, {
      email: typeof payload.email === "string" ? payload.email : undefined,
    });
    c.set("asesorId", asesorId);
    c.set("clerkUserId", clerkUserId);
    c.set("esDemo", false);
    await next();
  } catch (err) {
    console.warn("[auth] verificación de token falló:", err);
    return c.json(
      { error: { codigo: "SIN_SESION", mensaje: "Tu sesión expiró. Vuelve a entrar." } },
      401,
    );
  }
}
