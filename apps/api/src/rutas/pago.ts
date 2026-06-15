/**
 * pago.ts — inicio del cobro (Paso 2 del recibimiento).
 *
 * `POST /pago/checkout` crea la sesión de Checkout de Stripe y devuelve la URL a
 * donde mandar al asesor a poner su tarjeta.
 *
 * REGLA DEL DINERO: en modo Stripe NO tocamos el estado de suscripción aquí — la
 * verdad la abre el webhook firmado. Solo amarramos el Customer a nuestra fila
 * (para que el webhook resuelva por aquí). En modo DEMO sí marcamos una prueba
 * ficticia, porque no hay webhook que la abra.
 */
import { Hono } from "hono";
import { prisma } from "@socrates/db";
import { crearCheckoutSession } from "../pago/proveedor-stripe.js";
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
    // Sin Stripe: simulamos la prueba para que el recibimiento siga su curso.
    await prisma.asesor.update({
      where: { id: asesorId },
      data: {
        estadoSuscripcion: "prueba",
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
