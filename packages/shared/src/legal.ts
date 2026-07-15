/**
 * legal.ts — la fuente ÚNICA de verdad de las versiones legales.
 *
 * Las páginas (/terminos, /aviso-de-privacidad) muestran la versión desde aquí,
 * y el api la usa para la constancia de consentimiento (fecha + versión que el
 * asesor aceptó). Al publicar una versión nueva de un documento legal, se sube
 * el número aquí y el resto del sistema lo refleja sin tocar más código.
 */
export const LEGAL = {
  terminosVersion: "1.0",
  avisoVersion: "1.0",
  vigenciaDesde: "2026-07-14",
} as const;

const MESES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

/**
 * Convierte una fecha ISO (YYYY-MM-DD) a texto de oficina en español de México
 * ("14 de julio de 2026"). Parsea las partes a mano para no depender de la zona
 * horaria del runtime (new Date("2026-07-14") es UTC y se corre de día).
 */
export function fechaLegalTexto(iso: string): string {
  const [anio, mes, dia] = iso.split("-").map((n) => Number(n));
  const nombreMes = MESES[(mes ?? 1) - 1] ?? "";
  return `${dia} de ${nombreMes} de ${anio}`;
}
