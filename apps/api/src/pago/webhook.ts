/**
 * webhook.ts — el cartero firmado de Stripe (ruta PÚBLICA, antes del auth).
 *
 * Doctrina del dinero, hecha código:
 *  1. SIEMPRE verifica la firma (verificarWebhook) — un webhook sin firma válida
 *     se rechaza con 400, jamás se procesa.
 *  2. Idempotente: se aplica el efecto (un `update` de estado, idempotente por
 *     naturaleza) y SOLO ENTONCES se registra el evento. Si aplicar falla, NO se
 *     registra → Stripe reintenta y se vuelve a aplicar. Si llega un duplicado,
 *     el registro previo lo salta. Jamás doble efecto, jamás efecto perdido.
 *  3. Tenencia: el asesor se resuelve por NUESTRA fila (metadata.asesorId o
 *     stripeCustomerId), nunca por datos sueltos del navegador.
 */
import type { Context } from "hono";
import type Stripe from "stripe";
import { prisma } from "@socrates/db";
import { mapearEstadoStripe } from "@socrates/shared";
import { verificarWebhook } from "./proveedor-stripe.js";

export async function manejarWebhookStripe(c: Context) {
  const cuerpoCrudo = await c.req.text();
  const firma = c.req.header("stripe-signature");

  let evento;
  try {
    evento = await verificarWebhook(cuerpoCrudo, firma);
  } catch {
    // Firma inválida o secreto faltante: NO procesar (puede ser falsificado).
    return c.json({ error: "firma no verificable" }, 400);
  }

  // ¿Ya lo procesamos? (dedup best-effort; la corrección la da el apply idempotente)
  const yaVisto = await prisma.eventoStripe.findUnique({ where: { id: evento.id } });
  if (yaVisto) return c.json({ recibido: true, duplicado: true });

  try {
    await aplicarEvento(evento.tipo, evento.objeto);
  } catch (err) {
    console.error(`[webhook] falló aplicar ${evento.tipo}:`, err);
    // 500 → Stripe reintenta. No registramos el evento, así el reintento aplica.
    return c.json({ error: "no se pudo aplicar" }, 500);
  }

  // Registrar DESPUÉS de aplicar (best-effort; ignora carrera de duplicados).
  await prisma.eventoStripe
    .create({ data: { id: evento.id, tipo: evento.tipo } })
    .catch(() => undefined);

  return c.json({ recibido: true });
}

/** Aplica el efecto del evento. Cada rama es idempotente (escribe estado, no incrementa). */
async function aplicarEvento(tipo: string, objeto: unknown): Promise<void> {
  switch (tipo) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await actualizarDesdeSuscripcion(objeto as Stripe.Subscription);
      return;
    case "checkout.session.completed":
      await vincularCustomer(objeto as Stripe.Checkout.Session);
      return;
    default:
      // Otros eventos no nos interesan: 200 silencioso.
      return;
  }
}

/** Traduce el estado de la suscripción a nuestra fila (la verdad del acceso). */
async function actualizarDesdeSuscripcion(sub: Stripe.Subscription): Promise<void> {
  const estado = mapearEstadoStripe(sub.status);
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const asesorIdMeta = sub.metadata?.asesorId || null;
  const pruebaTermina = sub.trial_end ? new Date(sub.trial_end * 1000) : null;

  // Resolver por metadata (lo que sembramos al crear el checkout) o por Customer.
  const asesor = asesorIdMeta
    ? await prisma.asesor.findUnique({ where: { id: asesorIdMeta } })
    : await prisma.asesor.findUnique({ where: { stripeCustomerId: customerId } });

  if (!asesor) {
    console.warn("[webhook] suscripción sin asesor resoluble; se ignora");
    return;
  }

  await prisma.asesor.update({
    where: { id: asesor.id },
    data: { estadoSuscripcion: estado, pruebaTermina, stripeCustomerId: customerId },
  });
}

/** Amarra el Customer de Stripe a nuestra fila (por client_reference_id = asesorId). */
async function vincularCustomer(session: Stripe.Checkout.Session): Promise<void> {
  const asesorId = session.client_reference_id;
  const customerId =
    typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;
  if (!asesorId || !customerId) return;
  await prisma.asesor
    .update({ where: { id: asesorId }, data: { stripeCustomerId: customerId } })
    .catch(() => undefined);
}
