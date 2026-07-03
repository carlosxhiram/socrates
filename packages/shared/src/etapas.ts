/**
 * etapas.ts — la máquina de Etapas del Expediente (FR-7, E2-S7).
 *
 * Reglas (default afinable con Carlos; el mapa completo propuesto vive en
 * decisiones-bloqueantes.md I-1 — aquí se implementa un subconjunto deliberado):
 *   - Avance lineal de UNA Etapa a la vez (no se salta hacia adelante).
 *   - Retroceder a una Etapa anterior es válido: corregir es honesto, inflar no.
 *     LIMITACIÓN CONOCIDA (piloto): si retrocedes por debajo de una Etapa con
 *     prerrequisito y el Entregable no existe (p. ej. expedientes sembrados sin
 *     Entregable), re-avanzar queda bloqueado hasta que exista — la UI no ofrece
 *     retroceso, así que solo se alcanza por API directa.
 *   - GANADO / PERDIDO se marcan manualmente desde cualquier Etapa abierta.
 *   - Los terminales no se reabren ni se cambian entre sí (decisión nueva,
 *     anotada en decisiones-bloqueantes.md para confirmación de Carlos).
 *   - Entrar a una Etapa puede exigir un Entregable APROBADO (PRERREQUISITO_ETAPA);
 *     esa verificación la hace la api contra la base — aquí vive el mapa.
 *
 * Función pura y testeada: la misma entrada da el mismo veredicto.
 */
import { ETAPAS_LINEALES, ETAPA_ETIQUETA, type EtapaExpediente, type TipoEntregable } from "./glosario";

export const ETAPAS_TERMINALES: EtapaExpediente[] = ["GANADO", "PERDIDO"];

/**
 * Mapa Etapa → tipo de Entregable APROBADO requerido para ENTRAR (avanzando).
 * Hoy solo el paso a INVESTIGADO exige el Reporte de Inteligencia aprobado —
 * el único prerrequisito que el producto ya sabe producir. El default completo
 * de decisiones-bloqueantes.md I-1 también gatea Recomendado y En acercamiento;
 * esos Entregables llegan con E4/E5 y el mapa crece entonces (divergencia
 * deliberada, confirmable con Carlos junto con I-1).
 */
export const PRERREQUISITO_ETAPA: Partial<Record<EtapaExpediente, TipoEntregable>> = {
  INVESTIGADO: "reporte_inteligencia",
};

export type ResultadoTransicion = { valida: true } | { valida: false; motivo: string };

/** ¿La transición de → a es válida? (Sin mirar la base; el prerrequisito es aparte.) */
export function evaluarTransicionEtapa(de: EtapaExpediente, a: EtapaExpediente): ResultadoTransicion {
  if (de === a) return { valida: true }; // reenviar el estado actual no es un cambio

  if (ETAPAS_TERMINALES.includes(de)) {
    return {
      valida: false,
      motivo: `Este expediente ya está cerrado como ${ETAPA_ETIQUETA[de]}; no se puede reabrir.`,
    };
  }

  if (ETAPAS_TERMINALES.includes(a)) return { valida: true }; // Ganado/Perdido manual (FR-7)

  const desde = ETAPAS_LINEALES.indexOf(de);
  const hacia = ETAPAS_LINEALES.indexOf(a);

  // Valor fuera del glosario (solo alcanzable por un write manual a la base):
  // rechazo honesto en vez de degradar raro.
  if (desde === -1 || hacia === -1) {
    return { valida: false, motivo: "No reconozco esa etapa del expediente; recarga la página e inténtalo de nuevo." };
  }

  if (hacia <= desde) return { valida: true }; // retroceder es honesto

  if (hacia === desde + 1) return { valida: true }; // avance de una etapa

  return {
    valida: false,
    motivo: `No se puede pasar de ${ETAPA_ETIQUETA[de]} directo a ${ETAPA_ETIQUETA[a]}; la etapa siguiente es ${ETAPA_ETIQUETA[ETAPAS_LINEALES[desde + 1]!]}.`,
  };
}

/** ¿Avanza hacia adelante en la cadena lineal? (para saber si aplica prerrequisito) */
export function esAvanceLineal(de: EtapaExpediente, a: EtapaExpediente): boolean {
  const desde = ETAPAS_LINEALES.indexOf(de);
  const hacia = ETAPAS_LINEALES.indexOf(a);
  return desde !== -1 && hacia !== -1 && hacia > desde;
}
