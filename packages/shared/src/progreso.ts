/**
 * progreso.ts — derivación DETERMINÍSTICA del progreso del Expediente.
 *
 * Función pura y testeable (arquitectura §5.4, UX P-3): el progreso se deriva de
 * la Etapa, NUNCA se infla. Un fallo no sube el porcentaje; aparece como bloqueo.
 *
 * Mapa de Etapa → % (decisiones-bloqueantes I-1, afinable con Carlos, R-8).
 */
import type { EtapaExpediente } from "./glosario";

const PROGRESO_POR_ETAPA: Record<EtapaExpediente, number> = {
  PROSPECTO: 5,
  INVESTIGADO: 30,
  RECOMENDADO: 50,
  EN_ACERCAMIENTO: 65,
  EN_TRAMITE: 80,
  EN_CIERRE: 92,
  GANADO: 100,
  PERDIDO: 0,
};

export interface EntradaProgreso {
  etapa: EtapaExpediente;
  /** Cuántas Tareas hay en total y cuántas entregadas (para el avance fino dentro de etapa). */
  tareasTotales?: number;
  tareasEntregadas?: number;
}

/**
 * Devuelve el progreso 0..100 del Expediente.
 * Base por Etapa + un pequeño aporte por Tareas entregadas dentro de la etapa
 * actual (sin pasar al umbral de la siguiente etapa).
 */
export function derivarProgreso(entrada: EntradaProgreso): number {
  const base = PROGRESO_POR_ETAPA[entrada.etapa];
  if (entrada.etapa === "GANADO") return 100;
  if (entrada.etapa === "PERDIDO") return 0;

  const totales = entrada.tareasTotales ?? 0;
  const entregadas = entrada.tareasEntregadas ?? 0;
  if (totales <= 0) return base;

  // Aporte fino: hasta +8 puntos por tareas entregadas, sin invadir la siguiente etapa.
  const fraccion = Math.min(1, entregadas / totales);
  const aporte = Math.round(fraccion * 8);
  return Math.min(99, base + aporte);
}

/** Etiqueta de oficina del estado general del Expediente para la tarjeta. */
export function etiquetaEtapaActual(etapa: EtapaExpediente): string {
  switch (etapa) {
    case "PROSPECTO":
      return "Prospecto nuevo";
    case "INVESTIGADO":
      return "En investigación";
    case "RECOMENDADO":
      return "Con recomendación";
    case "EN_ACERCAMIENTO":
      return "En acercamiento";
    case "EN_TRAMITE":
      return "En trámite";
    case "EN_CIERRE":
      return "En cierre";
    case "GANADO":
      return "Ganado";
    case "PERDIDO":
      return "Perdido";
  }
}
