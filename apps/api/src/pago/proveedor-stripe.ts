/**
 * proveedor-stripe.ts — wrapper ÚNICO de Stripe (la "caja registradora").
 *
 * Toda interacción con Stripe pasa por aquí (igual que ProveedorIA/Tavily/R2),
 * para que el fallback y la seguridad sean uniformes.
 *
 * MODO DEMO (sin STRIPE_SECRET_KEY): NO se llama a Stripe. `crearCheckoutSession`
 * devuelve una URL de demostración (vuelve al recibimiento marcando una prueba
 * ficticia) y `verificarWebhook` no aplica. Así la app corre completa sin llaves.
 *
 * SEGURIDAD (best-practices Stripe): la llave vive SOLO en env; jamás se registra
 * en logs ni en mensajes de error. El webhook SIEMPRE verifica firma.
 */
import type Stripe from "stripe";

/** ¿Hay llave de Stripe? Si no, corremos en modo demo (sin cobro). */
export function stripeHabilitado(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

let clienteCache: Stripe | null = null;

/** Instancia perezosa del SDK (solo cuando hay llave — no carga en el arranque demo). */
async function cliente(): Promise<Stripe> {
  if (clienteCache) return clienteCache;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Stripe no está configurado (falta STRIPE_SECRET_KEY).");
  const { default: StripeSDK } = await import("stripe");
  clienteCache = new StripeSDK(key);
  return clienteCache;
}

export interface ResultadoCheckout {
  modo: "stripe" | "demo";
  /** A dónde mandar al asesor para poner su tarjeta (o volver, en demo). */
  url: string;
  /** Customer de Stripe creado/usado, para amarrarlo a NUESTRA fila. null en demo. */
  customerId: string | null;
}

/**
 * Crea la sesión de Checkout (suscripción mensual + prueba gratis con tarjeta).
 * Reusa o crea el Customer de Stripe y lo amarra a nuestro asesor por metadata
 * y client_reference_id (la tenencia se resuelve por nuestra fila, no por el
 * payload del navegador).
 */
export async function crearCheckoutSession(opts: {
  asesorId: string;
  emailAsesor: string | null;
  stripeCustomerIdExistente: string | null;
  successUrl: string;
  cancelUrl: string;
}): Promise<ResultadoCheckout> {
  // ── Modo demo: sin llave, no cobramos. Volvemos al recibimiento con ?demo=1.
  if (!stripeHabilitado()) {
    const sep = opts.successUrl.includes("?") ? "&" : "?";
    return { modo: "demo", url: `${opts.successUrl}${sep}demo=1`, customerId: null };
  }

  const stripe = await cliente();
  const priceId = process.env.STRIPE_PRICE_ID;
  if (!priceId) throw new Error("Falta STRIPE_PRICE_ID.");
  const trialDias = Number(process.env.STRIPE_TRIAL_DIAS ?? 14);

  // Reusar el Customer si ya existe; si no, crearlo amarrado a nuestro asesor
  // (el email se fija AQUÍ, al crear el Customer — Stripe no permite mandar
  // customer_email en la Checkout Session cuando ya se pasa un customer).
  let customerId = opts.stripeCustomerIdExistente;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: opts.emailAsesor ?? undefined,
      metadata: { asesorId: opts.asesorId },
    });
    customerId = customer.id;
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    // Nuestro cliente es 100% mexicano: forzamos español, sin depender del
    // navegador del asesor (que puede traer el sistema en inglés).
    locale: "es-419",
    client_reference_id: opts.asesorId,
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: {
      trial_period_days: trialDias,
      metadata: { asesorId: opts.asesorId },
    },
    success_url: opts.successUrl,
    cancel_url: opts.cancelUrl,
  });

  if (!session.url) throw new Error("Stripe no devolvió URL de Checkout.");
  return { modo: "stripe", url: session.url, customerId };
}

export interface EventoStripeVerificado {
  id: string;
  tipo: string;
  /** El objeto del evento (Checkout.Session | Subscription), tal cual de Stripe. */
  objeto: unknown;
}

/**
 * Verifica la firma del webhook con STRIPE_WEBHOOK_SECRET y devuelve el evento.
 * Lanza si la firma no cuadra: JAMÁS se procesa un webhook sin verificar (un
 * webhook sin firma válida puede ser falsificado).
 */
export async function verificarWebhook(
  cuerpoCrudo: string,
  firma: string | undefined,
): Promise<EventoStripeVerificado> {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error("Falta STRIPE_WEBHOOK_SECRET.");
  if (!firma) throw new Error("Falta la cabecera stripe-signature.");
  const stripe = await cliente();
  const evento = await stripe.webhooks.constructEventAsync(cuerpoCrudo, firma, secret);
  return { id: evento.id, tipo: evento.type, objeto: evento.data.object };
}

export interface ResultadoCancelacion {
  modo: "stripe" | "demo";
  /** Cuántas suscripciones vigentes quedaron programadas para cancelar. */
  programadas: number;
}

/**
 * Programa la cancelación de la(s) suscripción(es) vigente(s) del Customer al
 * FINAL del periodo ya pagado (`cancel_at_period_end`). NO cancela de inmediato:
 * el asesor conserva lo que pagó y no se le hace un cargo nuevo.
 *
 * Igual que el checkout, NO escribe el estado aquí — el cambio lo aplica el
 * webhook: `customer.subscription.updated` mantiene el acceso hasta el cierre, y
 * `customer.subscription.deleted` al cierre lo baja a "cancelada".
 * Idempotente: re-programar la misma cancelación fija el mismo flag, sin efecto extra.
 */
export async function cancelarSuscripcion(opts: {
  stripeCustomerId: string;
}): Promise<ResultadoCancelacion> {
  if (!stripeHabilitado()) {
    return { modo: "demo", programadas: 0 };
  }
  const stripe = await cliente();
  const subs = await stripe.subscriptions.list({
    customer: opts.stripeCustomerId,
    status: "all",
    limit: 100,
  });
  const vigentes = subs.data.filter(
    (s) => s.status === "active" || s.status === "trialing" || s.status === "past_due",
  );
  for (const s of vigentes) {
    await stripe.subscriptions.update(s.id, { cancel_at_period_end: true });
  }
  return { modo: "stripe", programadas: vigentes.length };
}
