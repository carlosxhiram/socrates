/**
 * glosario.ts — el vocabulario único de Socratia.
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
// CONVENCIÓN DUAL (no la "corrijas"): el valor "SOCRATES" es el VALOR REAL de
// filas en Postgres (Empleado.rol es PK y Tarea.empleadoRol es FK) y NO debe
// renombrarse aunque el nombre visible del gerente sea "Sócrates" — renombrarlo
// exigiría una migración de datos. Lo que ve el asesor sale de EMPLEADOS[rol].nombre.
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
  /** Nombre "de sistema": el gerente ("Sócrates") o el legado de puesto ("El Prospector"). */
  nombre: string;
  /** Una línea, en lenguaje de oficina, de qué hace. */
  descripcion: string;
  /** Ícono de rol (estilo organigrama, no avatar de robot) — clave lucide-react. */
  icono: string;
  /**
   * Nombre propio de fábrica del empleado del panel (Diego…). Fuente única que
   * comparten landing y producto. Ausente en SOCRATES (el gerente no se renombra).
   */
  nombrePorDefecto?: string;
  /** Puesto mostrado como cargo (subtítulo) bajo el nombre (Prospector…). Ausente en SOCRATES. */
  cargo?: string;
}

/** Identidad de oficina de cada empleado (UX C-1, P-4). */
export const EMPLEADOS: Record<RolEmpleado, PerfilEmpleado> = {
  // La clave/rol "SOCRATES" se queda (valor real en BD, ver ROLES_EMPLEADO);
  // el `nombre` es el del personaje gerente, que se llama "Sócrates" (la MARCA
  // del producto es "Socratia" — son cosas distintas a propósito).
  SOCRATES: {
    rol: "SOCRATES",
    nombre: "Sócrates",
    descripcion: "Tu gerente: entiende lo que necesitas, reparte el trabajo y te rinde cuentas.",
    icono: "turtle",
  },
  PROSPECTOR: {
    rol: "PROSPECTOR",
    nombre: "El Prospector",
    descripcion: "Califica y enriquece a los prospectos que le traes.",
    icono: "search",
    nombrePorDefecto: "Diego",
    cargo: "Prospector",
  },
  INVESTIGADOR: {
    rol: "INVESTIGADOR",
    nombre: "El Investigador",
    descripcion: "Arma el reporte de inteligencia financiera del prospecto, con todo y fuentes.",
    icono: "file-search",
    nombrePorDefecto: "Hiram",
    cargo: "Investigador",
  },
  ASESOR_PRODUCTO: {
    rol: "ASESOR_PRODUCTO",
    nombre: "El Asesor de producto",
    descripcion: "Identifica el mejor financiamiento del catálogo SOC para cada necesidad.",
    icono: "landmark",
    nombrePorDefecto: "Jair",
    cargo: "Asesor de Producto",
  },
  NEGOCIADOR: {
    rol: "NEGOCIADOR",
    nombre: "El Negociador",
    descripcion: "Prepara el guion de acercamiento, el pitch y el manejo de objeciones.",
    icono: "handshake",
    nombrePorDefecto: "Katya",
    cargo: "Negociadora",
  },
  TRAMITADOR: {
    rol: "TRAMITADOR",
    nombre: "El Tramitador",
    descripcion: "Reúne requisitos y arma la cotización estimada (no vinculante).",
    icono: "file-check",
    nombrePorDefecto: "María",
    cargo: "Trámites",
  },
  GESTOR: {
    rol: "GESTOR",
    nombre: "El Gestor",
    descripcion: "Da seguimiento, cierra y acompaña en la postventa.",
    icono: "briefcase",
    nombrePorDefecto: "Paula",
    cargo: "Gestora",
  },
};

/**
 * Nombre a mostrar de un empleado: override de la oficina > nombre de fábrica >
 * nombre de sistema (legado). Un rol desconocido en el mapa se ignora (defensa
 * ante datos viejos). Es la ÚNICA puerta para resolver un nombre — ningún
 * componente vuelve a leerlo "a mano".
 */
export function nombreEmpleado(
  rol: RolEmpleado,
  nombresEquipo?: Record<string, string> | null,
): string {
  const override = nombresEquipo?.[rol]?.trim();
  if (override) return override;
  return EMPLEADOS[rol].nombrePorDefecto ?? EMPLEADOS[rol].nombre;
}

/** Cargo (puesto) del empleado, para el subtítulo. Vacío para SOCRATES. */
export function cargoEmpleado(rol: RolEmpleado): string {
  return EMPLEADOS[rol].cargo ?? "";
}

// ── Estado de empleado de cara al Asesor (UX C-1) ───────────────────────────
// Nunca "Procesando"/"Generando" (P-1): solo Libre / Trabajando / Entregó.
export type EstadoEmpleadoUI = "LIBRE" | "TRABAJANDO" | "ENTREGO";

export const ESTADO_EMPLEADO_ETIQUETA: Record<EstadoEmpleadoUI, string> = {
  LIBRE: "Libre",
  TRABAJANDO: "Trabajando",
  ENTREGO: "Entregó",
};

// ── Onboarding: los pasos del recibimiento del asesor ──────────────────────
// perfil → pago → bienvenida → completo. El servidor deriva el "siguiente paso"
// (derivarSiguientePaso) y el cliente solo obedece.
export const ETAPAS_ONBOARDING = ["perfil", "pago", "bienvenida", "completo"] as const;
export type EtapaOnboarding = (typeof ETAPAS_ONBOARDING)[number];

export const ETAPA_ONBOARDING_ETIQUETA: Record<EtapaOnboarding, string> = {
  perfil: "Tu oficina",
  pago: "Tu prueba",
  bienvenida: "Conoce a tu equipo",
  completo: "Listo",
};

// ── Estado de suscripción (la VERDAD del acceso; la escribe SOLO el webhook) ──
// "prueba" y "activa" dan acceso (los abre el webhook firmado de Stripe).
// "demo" es un estado EXPLÍCITO del modo demostración (sin llaves de Stripe): da
// acceso para operar la oficina, pero NO finge un pago real — se distingue de
// "activa" a propósito, para que nadie confunda una demo con una suscripción
// pagada (doctrina del dinero: sin evento verificado, nada se hace pasar por
// cobrado). El resto de estados NO dan acceso.
// "gracia": la renovación rebotó (tarjeta vencida/sin fondos) y Stripe todavía
// reintenta cobrar (dunning, ~2 semanas). El asesor conserva acceso de SOLO
// LECTURA a su trabajo ya creado —no se le tira todo por un hipo de tarjeta—,
// pero no puede crear ni cambiar nada hasta regularizar el pago. Si Stripe se
// rinde, el estado pasa a "vencida"/"cancelada" (sin acceso).
export const ESTADOS_SUSCRIPCION = [
  "ninguna",
  "demo",
  "prueba",
  "activa",
  "gracia",
  "vencida",
  "cancelada",
] as const;
export type EstadoSuscripcion = (typeof ESTADOS_SUSCRIPCION)[number];

/** Estados con acceso PLENO a La Oficina —leer y escribir— (incluye la demo). */
export const SUSCRIPCION_CON_ACCESO: EstadoSuscripcion[] = ["demo", "prueba", "activa"];

/**
 * Estados con acceso de LECTURA a La Oficina: los plenos + "gracia". El asesor
 * en gracia entra a su oficina y consulta su trabajo, pero la muralla del
 * servidor le bloquea toda escritura (crear/editar/borrar) hasta que su pago se
 * regularice. Separar leer de escribir es lo que hace posible el periodo de
 * gracia sin regalar servicio no pagado.
 */
export const SUSCRIPCION_CON_ACCESO_LECTURA: EstadoSuscripcion[] = [
  ...SUSCRIPCION_CON_ACCESO,
  "gracia",
];

// ── Tipos de Entregable ─────────────────────────────────────────────────────
export const TIPOS_ENTREGABLE = [
  "reporte_inteligencia",
  "perfil_prospecto",
  "recomendaciones_producto",
  "guion_acercamiento",
  "lista_requisitos",
  "seguimiento",
] as const;
export type TipoEntregable = (typeof TIPOS_ENTREGABLE)[number];

export const TIPO_ENTREGABLE_ETIQUETA: Record<TipoEntregable, string> = {
  reporte_inteligencia: "Reporte de Inteligencia",
  perfil_prospecto: "Perfil del prospecto",
  recomendaciones_producto: "Recomendaciones de producto",
  guion_acercamiento: "Guion de acercamiento",
  lista_requisitos: "Lista de requisitos",
  seguimiento: "Seguimiento",
};

/** El `RolEmpleado` del panel que produce cada tipo de Entregable (1:1). */
export const ROL_POR_TIPO_ENTREGABLE: Record<TipoEntregable, RolEmpleado> = {
  reporte_inteligencia: "INVESTIGADOR",
  perfil_prospecto: "PROSPECTOR",
  recomendaciones_producto: "ASESOR_PRODUCTO",
  guion_acercamiento: "NEGOCIADOR",
  lista_requisitos: "TRAMITADOR",
  seguimiento: "GESTOR",
};
