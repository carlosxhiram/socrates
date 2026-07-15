/**
 * consentimiento.ts — la verdad ÚNICA del consentimiento legal en el api.
 *
 * `consentimientoOk` lo consumen la muralla (requiereSuscripcion), el cobro
 * (POST /pago/checkout) y el recibimiento (GET /yo y PATCH /yo/perfil), para
 * que la regla viva UNA sola vez y no se pueda brincar por ninguna puerta.
 */
import { LEGAL } from "@socrates/shared";

/** Los 4 campos de constancia de la fila Asesor (subset estructural). */
export interface ConstanciaConsentimiento {
  consentimientoTerminosEn: Date | null;
  consentimientoTerminosVersion: string | null;
  consentimientoAvisoEn: Date | null;
  consentimientoAvisoVersion: string | null;
}

/**
 * Constancia de consentimiento VIGENTE: ambas firmas presentes (la fecha es la
 * firma) Y de la versión actual de cada documento (LEGAL). Política: subir la
 * versión de un documento re-pide la firma a todos — una constancia de una
 * versión anterior cuenta como pendiente, el asesor vuelve al Paso 1 a
 * re-aceptar y su firma nueva se guarda con fecha y versión nuevas.
 */
export function consentimientoOk(a: ConstanciaConsentimiento): boolean {
  return Boolean(
    a.consentimientoTerminosEn &&
      a.consentimientoAvisoEn &&
      a.consentimientoTerminosVersion === LEGAL.terminosVersion &&
      a.consentimientoAvisoVersion === LEGAL.avisoVersion,
  );
}

/**
 * Respuesta 409 estándar cuando falta el consentimiento. Mismo cuerpo en todas
 * las puertas (muralla, checkout, perfil) para que la UI reaccione igual.
 */
export const RESPUESTA_FALTA_CONSENTIMIENTO = {
  error: {
    codigo: "FALTA_CONSENTIMIENTO",
    mensaje:
      "Para continuar necesitas aceptar los Términos y Condiciones y confirmar que leíste el Aviso de Privacidad.",
  },
} as const;
