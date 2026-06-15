/**
 * glosario.ts — el vocabulario único de Sócrates.
 *
 * Enums ESPEJO de los del esquema Prisma (packages/db/prisma/schema.prisma §7 de
 * la arquitectura). web y api los consumen de aquí para no duplicar literales.
 *
 * REGLA DE LENGUAJE (NFR-14, P-1 de UX): los VALORES de enum son técnicos
 * (mayúsculas estables); las ETIQUETAS de cara al Asesor viven en los mapas
 * `*_ETIQUETA` y SIEMPRE están en lenguaje de oficina, jamás jerga de IA.
 */

// ── Etapa del Expediente (espina del flujo del asesor) ──────────────────────
export const ETAPAS_EXPEDIENTE = [
  "PROSPECTO",
  "INVESTIGADO",
  "RECOMENDADO",
  "EN_ACERCAMIENTO",
  "EN_TRAMITE",
  "EN_CIERRE",
  "GANADO",
  "PERDIDO",
] as const;
export type EtapaExpediente = (typeof ETAPAS_EXPEDIENTE)[number];

/** Etiqueta de oficina para cada Etapa (lo que ve el Asesor). */
export const ETAPA_ETIQUETA: Record<EtapaExpediente, string> = {
  PROSPECTO: "Prospecto",
  INVESTIGADO: "Investigado",
  RECOMENDADO: "Recomendado",
  EN_ACERCAMIENTO: "En acercamiento",
  EN_TRAMITE: "En trámite",
  EN_CIERRE: "En cierre",
  GANADO: "Ganado",
  PERDIDO: "Perdido",
};

/**
 * Orden canónico de avance (decisiones-bloqueantes I-1).
 * GANADO/PERDIDO son terminales y se fijan manualmente (FR-7), no por avance lineal.
 */
export const ETAPAS_LINEALES: EtapaExpediente[] = [
  "PROSPECTO",
  "INVESTIGADO",
  "RECOMENDADO",
  "EN_ACERCAMIENTO",
  "EN_TRAMITE",
  "EN_CIERRE",
];

// ── Estado de Tarea ─────────────────────────────────────────────────────────
export const ESTADOS_TAREA = [
  "ENCARGADA",
  "EN_CURSO",
  "ENTREGADA",
  "BLOQUEADA",
] as const;
export type EstadoTarea = (typeof ESTADOS_TAREA)[number];

export const ESTADO_TAREA_ETIQUETA: Record<EstadoTarea, string> = {
  ENCARGADA: "Encargada",
  EN_CURSO: "En curso",
  ENTREGADA: "Entregada",
  BLOQUEADA: "Bloqueada",
};

// ── Estado de Entregable (Gate humano) ──────────────────────────────────────
export const ESTADOS_ENTREGABLE = ["BORRADOR", "APROBADO"] as const;
export type EstadoEntregable = (typeof ESTADOS_ENTREGABLE)[number];

export const ESTADO_ENTREGABLE_ETIQUETA: Record<EstadoEntregable, string> = {
  BORRADOR: "Borrador — esperando tu revisión",
  APROBADO: "Aprobado",
};

// ── Roles de Empleado ───────────────────────────────────────────────────────
export const ROLES_EMPLEADO = [
  "SOCRATES",
  "PROSPECTOR",
  "INVESTIGADOR",
  "ASESOR_PRODUCTO",
  "NEGOCIADOR",
  "TRAMITADOR",
  "GESTOR",
] as const;
export type RolEmpleado = (typeof ROLES_EMPLEADO)[number];

/** Los 6 empleados del panel "Tu equipo" (Sócrates es el gerente, no del panel). */
export const ROLES_PANEL: RolEmpleado[] = [
  "PROSPECTOR",
  "INVESTIGADOR",
  "ASESOR_PRODUCTO",
  "NEGOCIADOR",
  "TRAMITADOR",
  "GESTOR",
];

export interface PerfilEmpleado {
  rol: RolEmpleado;
  nombre: string;
  /** Una línea, en lenguaje de oficina, de qué hace. */
  descripcion: string;
  /** Ícono de rol (estilo organigrama, no avatar de robot) — clave lucide-react. */
  icono: string;
}

/** Identidad de oficina de cada empleado (UX C-1, P-4). */
export const EMPLEADOS: Record<RolEmpleado, PerfilEmpleado> = {
  SOCRATES: {
    rol: "SOCRATES",
    nombre: "Sócrates",
    descripcion: "Tu gerente: entiende lo que necesitas, reparte el trabajo y te rinde cuentas.",
    icono: "turtle",
  },
  PROSPECTOR: {
    rol: "PROSPECTOR",
    nombre: "Katya",
    descripcion: "Califica y enriquece a los prospectos que le traes.",
    icono: "search",
  },
  INVESTIGADOR: {
    rol: "INVESTIGADOR",
    nombre: "Hiram",
    descripcion: "Arma el reporte de inteligencia financiera del prospecto, con todo y fuentes.",
    icono: "file-search",
  },
  ASESOR_PRODUCTO: {
    rol: "ASESOR_PRODUCTO",
    nombre: "Alberto",
    descripcion: "Identifica el mejor financiamiento del catálogo SOC para cada necesidad.",
    icono: "landmark",
  },
  NEGOCIADOR: {
    rol: "NEGOCIADOR",
    nombre: "Carlos",
    descripcion: "Prepara el guion de acercamiento, el pitch y el manejo de objeciones.",
    icono: "handshake",
  },
  TRAMITADOR: {
    rol: "TRAMITADOR",
    nombre: "Alejandro",
    descripcion: "Reúne requisitos y arma la cotización estimada (no vinculante).",
    icono: "file-check",
  },
  GESTOR: {
    rol: "GESTOR",
    nombre: "Paula",
    descripcion: "Da seguimiento, cierra y acompaña en la postventa.",
    icono: "briefcase",
  },
};

// ── Estado de empleado de cara al Asesor (UX C-1) ───────────────────────────
// Nunca "Procesando"/"Generando" (P-1): solo Libre / Trabajando / Entregó.
export type EstadoEmpleadoUI = "LIBRE" | "TRABAJANDO" | "ENTREGO";

export const ESTADO_EMPLEADO_ETIQUETA: Record<EstadoEmpleadoUI, string> = {
  LIBRE: "Libre",
  TRABAJANDO: "Trabajando",
  ENTREGO: "Entregó",
};

// ── Tipos de Entregable ─────────────────────────────────────────────────────
export const TIPOS_ENTREGABLE = [
  "reporte_inteligencia",
  "recomendaciones_producto",
  "guion_acercamiento",
  "lista_requisitos",
  "seguimiento",
] as const;
export type TipoEntregable = (typeof TIPOS_ENTREGABLE)[number];

export const TIPO_ENTREGABLE_ETIQUETA: Record<TipoEntregable, string> = {
  reporte_inteligencia: "Reporte de Inteligencia",
  recomendaciones_producto: "Recomendaciones de producto",
  guion_acercamiento: "Guion de acercamiento",
  lista_requisitos: "Lista de requisitos",
  seguimiento: "Seguimiento",
};
