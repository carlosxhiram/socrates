/**
 * auth.ts — verificación de identidad cross-service (D-1, E1-S3).
 *
 * web adjunta el JWT de Clerk (Authorization: Bearer). api lo verifica de forma
 * NETWORKLESS con @clerk/backend usando CLERK_JWT_KEY. De ahí saca el clerkUserId
 * y RESUELVE/CREA la fila Asesor; toda la tenencia se deriva de esa fila (NFR-8),
 * NUNCA del cuerpo de la petición.
 *
 * MODO ASESOR DEMO (E1-S6): en desarrollo sin claves de Clerk, la api acepta al
 * "asesor demo" sembrado para que La Oficina cargue. Nunca en producción.
 */
import type { Context, Next } from "hono";
import { prisma } from "@socrates/db";

export interface AuthedVars {
  asesorId: string;
  clerkUserId: string;
  esDemo: boolean;
}

const DEMO_CLERK_ID = "demo-asesor";

function clerkConfigurado(): boolean {
  return Boolean(process.env.CLERK_SECRET_KEY || process.env.CLERK_JWT_KEY);
}

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
  // ── Modo asesor demo: sin Clerk configurado, en desarrollo ────────────────
  if (!clerkConfigurado()) {
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
