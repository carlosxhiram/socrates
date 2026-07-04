/**
 * paso.ts — la lógica PURA del onboarding (D-3: lógica testeable, sin I/O).
 *
 * Dos funciones puras:
 *   - derivarSiguientePaso: el "portero". De los hechos del asesor decide a qué
 *     paso mandarlo. Es la ÚNICA fuente de ruteo del onboarding; el cliente solo
 *     obedece lo que el servidor calcula con esto.
 *   - mapearEstadoStripe: traduce el `status` de una suscripción de Stripe a
 *     nuestro vocabulario (glosario), con degradación segura ante lo desconocido.
 */
import {
  type EtapaOnboarding,
  type EstadoSuscripcion,
  SUSCRIPCION_CON_ACCESO_LECTURA,
} from "../glosario";

/**
 * Decide el siguiente paso del recibimiento a partir de hechos verificables.
 * Orden no negociable: perfil → pago → bienvenida → completo. El pago va ANTES
 * que la bienvenida (no se abre nada sin acceso pagado/en prueba).
 */
export function derivarSiguientePaso(f: {
  perfilCompleto: boolean;
  estadoSuscripcion: EstadoSuscripcion;
  bienvenidaVista: boolean;
}): EtapaOnboarding {
  if (!f.perfilCompleto) return "perfil";
  // Basta acceso de LECTURA para entrar al recibimiento/oficina: un asesor en
  // "gracia" (renovación rebotada) NO se manda de vuelta al paso de pago —
  // conserva acceso a su trabajo; la restricción de escritura la aplica la
  // muralla del servidor, no el portero.
  if (!SUSCRIPCION_CON_ACCESO_LECTURA.includes(f.estadoSuscripcion)) return "pago";
  if (!f.bienvenidaVista) return "bienvenida";
  return "completo";
}

/**
 * Traduce el `status` de una suscripción de Stripe a nuestro EstadoSuscripcion.
 * Cualquier status no reconocido cae a "ninguna" (sin acceso) — degradación
 * segura: ante la duda con dinero, NO damos acceso. Nunca devuelve "demo": la
 * demo es un estado NUESTRO (sin Stripe), jamás algo que Stripe reporte.
 */
export function mapearEstadoStripe(status: string): EstadoSuscripcion {
  switch (status) {
    case "trialing":
      return "prueba";
    case "active":
      return "activa";
    case "past_due":
      // Renovación rebotada, Stripe aún reintenta: gracia (solo lectura), no
      // corte total — la mayoría de las tarjetas se recuperan en el dunning.
      return "gracia";
    case "unpaid":
    case "incomplete":
      // Stripe se rindió (dunning agotado) o el primer pago nunca cuajó: sin acceso.
      return "vencida";
    case "canceled":
    case "incomplete_expired":
      return "cancelada";
    default:
      return "ninguna";
  }
}
