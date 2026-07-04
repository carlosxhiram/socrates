/**
 * suscripcion.ts — la muralla del dinero en el SERVIDOR.
 *
 * Las rutas de NEGOCIO (expedientes, empleados, catálogo, entregables) exigen una
 * suscripción con acceso (demo/prueba/activa), no solo identidad. El portero del
 * frontend es apenas la primera puerta; la API es un contrato público y debe
 * defenderse sola: un JWT válido sin suscripción NO debe leer datos de negocio.
 *
 * NO se monta en /yo ni /pago (se necesitan DURANTE el recibimiento, antes de
 * tener acceso) ni en /health o el webhook (públicos). El asesor demo del seed
 * tiene estado "demo", así que el modo demo local pasa sin fingir un pago.
 */
import type { Context, Next } from "hono";
import { prisma } from "@socrates/db";
import { SUSCRIPCION_CON_ACCESO, type EstadoSuscripcion } from "@socrates/shared";
import type { AuthedVars } from "./auth.js";

export async function requiereSuscripcion(
  c: Context<{ Variables: AuthedVars }>,
  next: Next,
) {
  const asesorId = c.get("asesorId");
  const asesor = await prisma.asesor.findUnique({
    where: { id: asesorId },
    select: { estadoSuscripcion: true },
  });
  const estado = (asesor?.estadoSuscripcion ?? "ninguna") as EstadoSuscripcion;

  if (!SUSCRIPCION_CON_ACCESO.includes(estado)) {
    return c.json(
      {
        error: {
          codigo: "SIN_SUSCRIPCION",
          mensaje:
            "Tu prueba o suscripción no está activa. Completa tu recibimiento para entrar a tu oficina.",
        },
      },
      402,
    );
  }

  await next();
}
