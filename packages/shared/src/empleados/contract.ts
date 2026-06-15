/**
 * contract.ts — el contrato común de Empleado (D-3 de la arquitectura).
 *
 * TODOS los empleados implementan `ejecutar(entrada, ctx) → resultado`. Esto deja
 * que Sócrates enrute sin conocer los detalles de cada uno, que el worker los
 * ejecute igual, y que el Modo sin claves se maneje en un solo lugar
 * (`ctx.modoSinClaves`).
 *
 * NOTA: este archivo define SOLO la frontera (tipos). Las implementaciones viven
 * en apps/api/src/empleados/<rol>/. La profundidad vive DENTRO de `ejecutar`.
 */
import type { RolEmpleado, EtapaExpediente } from "../glosario";
import type { ReporteV1 } from "../reporte/ReporteV1";

/** Lo que el Asesor (o Sócrates) le pide a un Empleado. */
export interface EntradaEmpleado {
  expedienteId: string;
  /** Texto libre del Asesor, si lo hubo. */
  instruccion?: string;
  parametros?: Record<string, unknown>;
}

/** Vista mínima del Expediente que un Empleado necesita para trabajar. */
export interface ExpedienteConDatos {
  id: string;
  asesorId: string;
  empresa: string;
  ciudad: string;
  industria: string;
  sitioWeb?: string | null;
  rfc?: string | null;
  sucursales?: number | null;
  notas?: string | null;
  etapa: EtapaExpediente;
}

/** Acceso de SOLO LECTURA al Catálogo SOC (la verdad del foso, C-1). */
export interface CatalogoLector {
  /** Resuelve un productoId; devuelve null si NO existe (C-1: nunca alucina). */
  buscarProducto(productoId: string): Promise<ProductoCatalogo | null>;
  /** Resuelve una institucionId; null si no existe. */
  buscarInstitucion(institucionId: string): Promise<InstitucionCatalogo | null>;
  /** Lista todos los productos (para matching). */
  listarProductos(): Promise<ProductoCatalogo[]>;
}

export interface InstitucionCatalogo {
  id: string;
  nombre: string;
  tipo: string;
}

export interface ProductoCatalogo {
  id: string;
  institucionId: string;
  institucionNombre: string;
  nombre: string;
  tipo: string;
  paraQueSirve: string;
  cuandoRecomendar: string[];
  condiciones: string;
}

/**
 * Mensaje de historial para el chat con Sócrates.
 * Duplicado intencionalmente en shared para que las Server Actions lo usen.
 */
export interface MensajeChatIA {
  rol: "USUARIO" | "ASISTENTE";
  contenido: string;
}

/**
 * Wrapper de IA (D-6). En Modo sin claves, `disponible` es false y los empleados
 * caen a su ruta de seed. Toda llamada a IA pasa por aquí (regla §5.5 #4).
 */
export interface ProveedorIA {
  readonly disponible: boolean;
  /** Genera texto libre. En modo sin claves lanza o el empleado ni lo llama. */
  generarTexto(opts: { sistema?: string; prompt: string; modelo?: string }): Promise<string>;
  /** Chat con historial para las sesiones de Sócrates. Fallback cálido si no hay clave. */
  chatear(historial: MensajeChatIA[], modelo?: string): Promise<string>;
}

/** Contexto de ejecución que el worker arma para cada Empleado. */
export interface ContextoEjecucion {
  /** Tenencia YA resuelta del token (D-1). Nunca del payload. */
  asesorId: string;
  expediente: ExpedienteConDatos;
  catalogo: CatalogoLector;
  ia: ProveedorIA;
  /** Reporta avance honesto por fase (UX P-3). */
  registrarProgreso: (pct: number, nota: string) => Promise<void>;
  /** true → ruta de seed/fallback (NFR-11). */
  modoSinClaves: boolean;
}

/** Un entregable recién producido (siempre nace en Borrador, NFR-4). */
export interface BorradorEntregable {
  tipo: string;
  /** Contenido tipado. Para el Investigador, un ReporteV1. */
  contenido: ReporteV1 | Record<string, unknown>;
}

export interface BrechaInfo {
  campo: string;
  motivo: string;
}

export interface ResultadoEmpleado {
  /** 0..n; siempre estado "Borrador". */
  entregables: BorradorEntregable[];
  brechas?: BrechaInfo[];
  /** Si no pudo completar (progreso honesto, P-3). */
  bloqueo?: { motivo: string };
}

/** El contrato. Todo Empleado lo implementa. */
export interface Empleado {
  readonly rol: RolEmpleado;
  ejecutar(entrada: EntradaEmpleado, ctx: ContextoEjecucion): Promise<ResultadoEmpleado>;
}
