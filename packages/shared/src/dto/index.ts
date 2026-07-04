/**
 * dto/index.ts — los esquemas Zod que cruzan web ↔ api (D-9/D-10).
 *
 * Viven UNA vez aquí y los consumen ambos lados. El formato de respuesta es
 * cuerpo-directo (sin envoltorio {data}); los errores: { error: { codigo, mensaje } }
 * con `mensaje` SIEMPRE en español de oficina cuando puede llegar al Asesor.
 */
import { z } from "zod";
import {
  ETAPAS_EXPEDIENTE,
  ESTADOS_TAREA,
  ESTADOS_ENTREGABLE,
  ROLES_EMPLEADO,
} from "../glosario";

export const EtapaSchema = z.enum(ETAPAS_EXPEDIENTE);
export const EstadoTareaSchema = z.enum(ESTADOS_TAREA);
export const EstadoEntregableSchema = z.enum(ESTADOS_ENTREGABLE);
export const RolEmpleadoSchema = z.enum(ROLES_EMPLEADO);

// ── Error estándar de la API ────────────────────────────────────────────────
export const ErrorApiSchema = z.object({
  error: z.object({
    codigo: z.string(),
    mensaje: z.string(),
  }),
});
export type ErrorApi = z.infer<typeof ErrorApiSchema>;

// ── Crear Expediente (FR-4) ─────────────────────────────────────────────────
export const CrearExpedienteSchema = z.object({
  empresa: z.string().min(1, "Falta el nombre de la empresa."),
  ciudad: z.string().min(1, "Falta la ciudad."),
  industria: z.string().min(1, "Falta la industria."),
  sitioWeb: z.string().url().startsWith("http", "El sitio web debe empezar con http:// o https://.").optional().or(z.literal("")),
  rfc: z.string().optional(),
  sucursales: z.number().int().nonnegative().optional(),
  notas: z.string().optional(),
});
export type CrearExpediente = z.infer<typeof CrearExpedienteSchema>;

// ── Editar Expediente / avanzar Etapa (FR-4, FR-7) ──────────────────────────
export const EditarExpedienteSchema = z
  .object({
    empresa: z.string().min(1, "El expediente no puede quedarse sin empresa.").optional(),
    ciudad: z.string().min(1, "El expediente no puede quedarse sin ciudad.").optional(),
    industria: z.string().min(1, "El expediente no puede quedarse sin giro.").optional(),
    // Paridad con CrearExpedienteSchema: URL válida o vacío (que limpia el dato).
    sitioWeb: z.string().url("Escribe el sitio web completo (con https://).").startsWith("http", "El sitio web debe empezar con http:// o https://.").optional().or(z.literal("")),
    rfc: z.string().optional(),
    sucursales: z.number().int().nonnegative().optional(),
    notas: z.string().optional(),
    etapa: EtapaSchema.optional(),
    motivoCierre: z.string().optional(),
  })
  .refine((datos) => Object.keys(datos).length > 0, {
    message: "No hay nada que guardar: manda al menos un dato.",
  });
export type EditarExpediente = z.infer<typeof EditarExpedienteSchema>;

// ── DTOs de salida (lo que la api devuelve a web) ───────────────────────────
export const TareaDTOSchema = z.object({
  id: z.string(),
  empleadoRol: RolEmpleadoSchema,
  descripcion: z.string(),
  estado: EstadoTareaSchema,
  motivo: z.string().nullable().optional(),
  creadoEn: z.string(),
});
export type TareaDTO = z.infer<typeof TareaDTOSchema>;

export const EntregableDTOSchema = z.object({
  id: z.string(),
  tipo: z.string(),
  estado: EstadoEntregableSchema,
  empleadoRol: RolEmpleadoSchema.nullable().optional(),
  versionActual: z.number().int(),
  creadoEn: z.string(),
});
export type EntregableDTO = z.infer<typeof EntregableDTOSchema>;

export const ExpedienteResumenDTOSchema = z.object({
  id: z.string(),
  empresa: z.string(),
  ciudad: z.string(),
  industria: z.string(),
  etapa: EtapaSchema,
  progreso: z.number().int(),
  empleadosActivos: z.array(RolEmpleadoSchema),
  entregablesEsperandoRevision: z.number().int(),
  tieneBloqueo: z.boolean(),
  creadoEn: z.string(),
  actualizadoEn: z.string(),
});
export type ExpedienteResumenDTO = z.infer<typeof ExpedienteResumenDTOSchema>;

export const ExpedienteDetalleDTOSchema = ExpedienteResumenDTOSchema.extend({
  sitioWeb: z.string().nullable().optional(),
  rfc: z.string().nullable().optional(),
  sucursales: z.number().int().nullable().optional(),
  notas: z.string().nullable().optional(),
  motivoCierre: z.string().nullable().optional(),
  tareas: z.array(TareaDTOSchema),
  entregables: z.array(EntregableDTOSchema),
});
export type ExpedienteDetalleDTO = z.infer<typeof ExpedienteDetalleDTOSchema>;

export const EmpleadoEstadoDTOSchema = z.object({
  rol: RolEmpleadoSchema,
  nombre: z.string(),
  descripcion: z.string(),
  icono: z.string(),
  estado: z.enum(["LIBRE", "TRABAJANDO", "ENTREGO"]),
  expedienteActual: z
    .object({ id: z.string(), empresa: z.string() })
    .nullable()
    .optional(),
});
export type EmpleadoEstadoDTO = z.infer<typeof EmpleadoEstadoDTOSchema>;

// ── Sesiones de chat con Sócrates ────────────────────────────────────────────

export const RolMensajeSchema = z.enum(["USUARIO", "ASISTENTE"]);
export type RolMensaje = z.infer<typeof RolMensajeSchema>;

export const MensajeDTOSchema = z.object({
  id: z.string(),
  rol: RolMensajeSchema,
  contenido: z.string(),
  creadoEn: z.string(), // ISO
});
export type MensajeDTO = z.infer<typeof MensajeDTOSchema>;

export const SesionResumenDTOSchema = z.object({
  id: z.string(),
  titulo: z.string(),
  actualizadoEn: z.string(), // ISO
  cantidadMensajes: z.number().int(),
  resumen: z.string().optional(), // vista previa del último mensaje
});
export type SesionResumenDTO = z.infer<typeof SesionResumenDTOSchema>;

export const SesionDetalleDTOSchema = z.object({
  id: z.string(),
  titulo: z.string(),
  creadoEn: z.string(), // ISO
  actualizadoEn: z.string(), // ISO
  mensajes: z.array(MensajeDTOSchema),
});
export type SesionDetalleDTO = z.infer<typeof SesionDetalleDTOSchema>;

// ── Schemas de entrada para la ruta de sesiones ──────────────────────────────
export const CrearSesionSchema = z.object({
  titulo: z.string().trim().max(100, "El título es demasiado largo.").optional(),
});
export type CrearSesion = z.infer<typeof CrearSesionSchema>;

export const EnviarMensajeSchema = z.object({
  // `trim()` ANTES de medir: un texto de puros espacios no cuenta como mensaje
  // (si no, colaría un contenido vacío). Tope alto para no aceptar entradas sin
  // límite, pero holgado para un mensaje de oficina normal.
  texto: z
    .string()
    .trim()
    .min(1, "El mensaje no puede estar vacío.")
    .max(4000, "El mensaje es demasiado largo."),
});
export type EnviarMensaje = z.infer<typeof EnviarMensajeSchema>;
