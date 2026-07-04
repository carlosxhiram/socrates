/**
 * pago.ts — inicio del cobro (Paso 2 del recibimiento).
 *
 * `POST /pago/checkout` crea la sesión de Checkout de Stripe y devuelve la URL a
 * donde mandar al asesor a poner su tarjeta.
 * `POST /pago/cancelar` programa la cancelación de la suscripción al cierre del
 * periodo ya pagado.
 *
 * REGLA DEL DINERO: en modo Stripe NO tocamos el estado de suscripción aquí — la
 * verdad la abre/baja el webhook firmado. Solo amarramos el Customer a nuestra
 * fila (para que el webhook resuelva por aquí). En modo DEMO marcamos el estado
 * "demo" (acceso de demostración explícito, NO un pago fingido), porque no hay
 * webhook que lo abra.
 */
import { Hono } from "hono";
import { prisma } from "@socrates/db";
import {
  crearCheckoutSession,
  cancelarSuscripcion,
  stripeHabilitado,
} from "../pago/proveedor-stripe.js";
import type { AuthedVars } from "../middleware/auth.js";

export const pagoRouter = new Hono<{ Variables: AuthedVars }>();

const DIAS_PRUEBA_DEMO = 14;

pagoRouter.post("/checkout", async (c) => {
  const asesorId = c.get("asesorId");
  const asesor = await prisma.asesor.findUnique({ where: { id: asesorId } });
  if (!asesor) {
    return c.json({ error: { codigo: "NO_EXISTE", mensaje: "No encontré tu cuenta." } }, 404);
  }

  const webOrigin = process.env.WEB_ORIGIN ?? "http://localhost:3000";
  const resultado = await crearCheckoutSession({
    asesorId,
    emailAsesor: asesor.email,
    stripeCustomerIdExistente: asesor.stripeCustomerId,
    successUrl: `${webOrigin}/bienvenida?paso=confirmando`,
    cancelUrl: `${webOrigin}/bienvenida?paso=pago`,
  });

  if (resultado.modo === "demo") {
    // Sin Stripe: damos acceso de DEMOSTRACIÓN (estado "demo", nunca "prueba"/pago
    // fingido) para que el recibimiento siga su curso. pruebaTermina es meramente
    // informativo aquí.
    await prisma.asesor.update({
      where: { id: asesorId },
      data: {
        estadoSuscripcion: "demo",
        pruebaTermina: new Date(Date.now() + DIAS_PRUEBA_DEMO * 24 * 60 * 60 * 1000),
        ...(asesor.onboardingEtapa === "perfil" ? { onboardingEtapa: "pago" } : {}),
      },
    });
  } else if (resultado.customerId && resultado.customerId !== asesor.stripeCustomerId) {
    // Amarrar el Customer a nuestra fila ya (el webhook lo necesita para resolver).
    await prisma.asesor.update({
      where: { id: asesorId },
      data: { stripeCustomerId: resultado.customerId },
    });
  }

  return c.json({ url: resultado.url, modo: resultado.modo });
});

// ── POST /pago/cancelar — programar la cancelación de la suscripción ──────────
// Mismo principio que el checkout: NO bajamos estadoSuscripcion aquí; el webhook
// (customer.subscription.updated/deleted) lo hace. El asesor conserva el acceso
// hasta el cierre del periodo que ya pagó.
pagoRouter.post("/cancelar", async (c) => {
  const asesorId = c.get("asesorId");
  const asesor = await prisma.asesor.findUnique({ where: { id: asesorId } });
  if (!asesor) {
    return c.json({ error: { codigo: "NO_EXISTE", mensaje: "No encontré tu cuenta." } }, 404);
  }

  // Modo demo: no hay suscripción real que cancelar (honesto).
  if (!stripeHabilitado()) {
    return c.json({
      modo: "demo",
      mensaje: "Estás en modo demostración: no hay una suscripción real que cancelar.",
    });
  }

  if (!asesor.stripeCustomerId) {
    return c.json(
      {
        error: {
          codigo: "SIN_SUSCRIPCION",
          mensaje: "No encontré una suscripción a tu nombre para cancelar.",
        },
      },
      404,
    );
  }

  const resultado = await cancelarSuscripcion({ stripeCustomerId: asesor.stripeCustomerId });

  if (resultado.programadas === 0) {
    return c.json({
      modo: "stripe",
      mensaje: "No tienes una suscripción activa que cancelar en este momento.",
    });
  }

  return c.json({
    modo: "stripe",
    mensaje:
      "Tu cancelación quedó en proceso. Conservas el acceso hasta el final del periodo que ya pagaste y no se te hará un nuevo cargo.",
  });
});
