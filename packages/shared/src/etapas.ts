/**
 * etapas.ts — la máquina de Etapas del Expediente (FR-7, E2-S7).
 *
 * Reglas (default afinable con Carlos, PRD §8 Q-2):
 *   - Avance lineal de UNA Etapa a la vez (no se salta hacia adelante).
 *   - Retroceder a una Etapa anterior es válido: corregir es honesto, inflar no.
 *   - GANADO / PERDIDO se marcan manualmente desde cualquier Etapa abierta.
 *   - Los terminales no se reabren ni se cambian entre sí.
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
 * el único prerrequisito que el producto ya sabe producir. Los demás llegan
 * con E4/E5 (el mapa completo Etapa↔Entregable lo afina Carlos, PRD Q-2).
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
