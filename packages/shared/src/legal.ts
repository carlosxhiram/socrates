/**
 * legal.ts — la fuente ÚNICA de verdad de las versiones legales.
 *
 * Las páginas (/terminos, /aviso-de-privacidad) muestran la versión desde aquí,
 * y el api la usa para la constancia de consentimiento (fecha + versión que el
 * asesor aceptó). Al publicar una versión nueva de un documento legal, se suben
 * aquí el número y la vigencia — el resto del sistema lo refleja sin tocar más
 * código (y la muralla re-pide la firma a todos automáticamente).
 */
export const LEGAL = {
  terminosVersion: "1.0",
  avisoVersion: "1.0",
  vigenciaDesde: "2026-07-14",
  /** La vigencia en texto de oficina; fija por versión (no se formatea en runtime). */
  vigenciaTexto: "14 de julio de 2026",
} as const;
