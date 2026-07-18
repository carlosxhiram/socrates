/**
 * EntregableGenericoV1.ts — el CUERPO de los entregables de los 5 empleados que
 * NO son el Investigador (Prospector, Asesor de producto, Negociador,
 * Tramitador, Gestor). El Investigador sigue emitiendo `ReporteV1` (tipo
 * `reporte_inteligencia`) — ese prerrequisito de Etapa ya lo espera.
 *
 * Reusa DELIBERADAMENTE los bloques visuales y las compuertas de ReporteV1
 * (Bloque, Tabla, Fuente, Respaldo, RecomendacionFinanciamiento, Brecha) para
 * que el visor de la web pinte ambos tipos con el mismo vocabulario visual
 * (§2.13 de la especificación de la misión).
 */
import { z } from "zod";
import { BloqueSchema, RecomendacionFinanciamientoSchema, BrechaSchema, FuenteSchema } from "../reporte/ReporteV1";

export const TIPOS_ENTREGABLE_GENERICO = [
  "perfil_prospecto",
  "recomendaciones_producto",
  "guion_acercamiento",
  "lista_requisitos",
  "seguimiento",
] as const;
export type TipoEntregableGenerico = (typeof TIPOS_ENTREGABLE_GENERICO)[number];

export const SeccionGenericaSchema = z.object({
  titulo: z.string().min(1),
  bloques: z.array(BloqueSchema).min(1),
});
export type SeccionGenerica = z.infer<typeof SeccionGenericaSchema>;

export const EntregableGenericoV1Schema = z.object({
  esquema: z.literal("entregable-generico"),
  version: z.literal(1),
  tipo: z.enum(TIPOS_ENTREGABLE_GENERICO),
  titulo: z.string().min(1),
  subtitulo: z.string().optional(),
  /** Párrafos ejecutivos (2-4 líneas) — lo primero que ve el Asesor. */
  resumen: z.array(z.string().min(1)).min(1),
  secciones: z.array(SeccionGenericaSchema).min(1),
  /** SOLO el Asesor de producto la llena; los demás roles la dejan vacía. */
  recomendacionesFinanciamiento: z.array(RecomendacionFinanciamientoSchema).default([]),
  brechas: z.array(BrechaSchema).default([]),
  fuentes: z.array(FuenteSchema).default([]),
});
export type EntregableGenericoV1 = z.infer<typeof EntregableGenericoV1Schema>;
export type EntregableGenericoV1Entrada = z.input<typeof EntregableGenericoV1Schema>;

/**
 * Parsea y valida el JSON de un `EntregableVersion.contenido` cuando su
 * `esquema` es "entregable-generico". Espejo de `parsearReporteV1`.
 */
export function parsearEntregableGenericoV1(entrada: unknown): EntregableGenericoV1 {
  return EntregableGenericoV1Schema.parse(entrada);
}
