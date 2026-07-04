/**
 * suscripcion.ts — la muralla del dinero en el SERVIDOR.
 *
 * Las rutas de NEGOCIO (expedientes, empleados, catálogo, entregables) exigen una
 * suscripción con acceso, no solo identidad. El portero del frontend es apenas la
 * primera puerta; la API es un contrato público y debe defenderse sola: un JWT
 * válido sin suscripción NO debe leer ni escribir datos de negocio.
 *
 * Tres niveles de acceso:
 *  - PLENO (demo/prueba/activa): lee y escribe.
 *  - LECTURA (gracia — renovación rebotada, Stripe reintenta): consulta su
 *    trabajo, pero NO puede crear/editar/borrar hasta regularizar el pago.
 *  - SIN ACCESO (ninguna/vencida/cancelada): nada de negocio.
 *
 * NO se monta en /yo ni /pago (se necesitan DURANTE el recibimiento, antes de
 * tener acceso) ni en /health o el webhook (públicos). El asesor demo del seed
 * tiene estado "demo", así que el modo demo local pasa sin fingir un pago.
 */
import type { Context, Next } from "hono";
import { prisma } from "@socrates/db";
import {
  SUSCRIPCION_CON_ACCESO,
  SUSCRIPCION_CON_ACCESO_LECTURA,
  type EstadoSuscripcion,
} from "@socrates/shared";
import type { AuthedVars } from "./auth.js";

// Métodos que solo LEEN (no mutan). Un asesor en "gracia" conserva estos; pierde
// la escritura hasta que su pago se regularice.
const METODOS_LECTURA = new Set(["GET", "HEAD", "OPTIONS"]);

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

  // Acceso PLENO: lee y escribe.
  if (SUSCRIPCION_CON_ACCESO.includes(estado)) {
    await next();
    return;
  }

  // Acceso de LECTURA (gracia): consulta sí, mutación no. El método de escritura
  // se rechaza con un código DISTINTO —"regulariza tu pago", no "suscríbete"—
  // para que la UI sepa que hay trabajo que sí puede ver.
  if (SUSCRIPCION_CON_ACCESO_LECTURA.includes(estado)) {
    if (METODOS_LECTURA.has(c.req.method)) {
      await next();
      return;
    }
    return c.json(
      {
        error: {
          codigo: "PAGO_PENDIENTE",
          mensaje:
            "Tu suscripción necesita atención. Puedes consultar tu trabajo, pero para crear o cambiar algo primero regulariza tu pago.",
        },
      },
      402,
    );
  }

  // Sin acceso: nada de negocio.
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
