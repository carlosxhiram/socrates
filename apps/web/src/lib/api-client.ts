/**
 * api-client.ts — cliente tipado a apps/api (D-1).
 *
 * Adjunta el JWT de Clerk cuando hay sesión (await auth().getToken()). En Modo
 * asesor demo (sin Clerk), llama sin token y la api resuelve al asesor demo.
 *
 * Toda llamada trae un límite de espera (NFR-11: la oficina nunca se queda
 * congelada esperando indefinidamente) y, si la oficina responde con un error,
 * el mensaje en español que trae la respuesta se propaga tal cual para que la
 * página lo pueda mostrar sin inventar nada (D-10).
 *
 * Se usa SOLO desde el servidor (Server Components / route handlers de Next).
 */
import { auth } from "@clerk/nextjs/server";
import type {
  ExpedienteResumenDTO,
  ExpedienteDetalleDTO,
  EmpleadoEstadoDTO,
} from "@socrates/shared";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8787";
const clerkConfigurado = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

/** Límite de espera por llamada: mejor un aviso honesto que una carga eterna. */
const TIEMPO_LIMITE_MS = 8000;

/**
 * Error de la oficina. `status` trae el código HTTP SOLO cuando la oficina
 * alcanzó a responder; si es `undefined`, la llamada nunca llegó a buen puerto
 * (sin conexión, se cayó a media respuesta, o se agotó el tiempo de espera).
 * Esa distinción es la que le permite a cada página decir "no existe / no es
 * tuyo" en lugar de "no me pude conectar" (o viceversa).
 */
export class ErrorApi extends Error {
  status?: number;

  constructor(mensaje: string, status?: number) {
    super(mensaje);
    this.name = "ErrorApi";
    this.status = status;
  }
}

const MENSAJE_SIN_CONEXION =
  "No pude conectarme con tu oficina. Revisa tu conexión e inténtalo de nuevo.";

async function tokenDeSesion(): Promise<string | null> {
  if (!clerkConfigurado) return null;
  try {
    const { getToken } = await auth();
    return (await getToken()) ?? null;
  } catch {
    return null;
  }
}

async function pedir<T>(ruta: string): Promise<T> {
  const token = await tokenDeSesion();

  let resp: Response;
  try {
    resp = await fetch(`${API_URL}${ruta}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: "no-store",
      signal: AbortSignal.timeout(TIEMPO_LIMITE_MS),
    });
  } catch {
    // Sin respuesta: red caída, oficina apagada, o se agotó el tiempo. `status`
    // queda sin definir a propósito — así las páginas saben que no fue un 404/403.
    throw new ErrorApi(MENSAJE_SIN_CONEXION);
  }

  if (!resp.ok) {
    const cuerpo = (await resp.json().catch(() => null)) as
      | { error?: { mensaje?: string } }
      | null;
    const mensaje =
      cuerpo?.error?.mensaje ?? `La oficina respondió con un problema (${resp.status}).`;
    throw new ErrorApi(mensaje, resp.status);
  }

  return (await resp.json()) as T;
}

export async function obtenerExpedientes(): Promise<ExpedienteResumenDTO[]> {
  return pedir<ExpedienteResumenDTO[]>("/expedientes");
}

export async function obtenerExpediente(id: string): Promise<ExpedienteDetalleDTO> {
  return pedir<ExpedienteDetalleDTO>(`/expedientes/${id}`);
}

export async function obtenerEquipo(): Promise<EmpleadoEstadoDTO[]> {
  return pedir<EmpleadoEstadoDTO[]>("/empleados");
}

export interface EntregableDetalle {
  id: string;
  tipo: string;
  estado: string;
  empleadoRol: string | null;
  versionActual: number;
  empresa: string;
  expedienteId: string;
  contenido: unknown;
}

export async function obtenerEntregable(id: string): Promise<EntregableDetalle> {
  return pedir<EntregableDetalle>(`/entregables/${id}`);
}

/**
 * Qué tan disponible está la oficina, para mostrar un aviso honesto si no.
 *  - "viva"      → responde 200 y todo en orden.
 *  - "degradada" → responde pero algo interno no está bien (p.ej. el
 *                  archivero/base de datos no contesta): la oficina sigue
 *                  encendida, pero no puede atenderte del todo.
 *  - "caida"     → no hay forma de hablar con ella (sin red, apagada, tiempo
 *                  agotado).
 */
export type EstadoApi = "viva" | "degradada" | "caida";

export async function apiViva(): Promise<EstadoApi> {
  try {
    const resp = await fetch(`${API_URL}/health`, {
      cache: "no-store",
      signal: AbortSignal.timeout(TIEMPO_LIMITE_MS),
    });
    const cuerpo = (await resp.json().catch(() => null)) as { estado?: string; db?: string } | null;
    // La oficina alcanzó a contestar y se identificó como viva, pero con algo
    // interno mal (el archivero no responde): degradada. Se decide por el
    // CUERPO, no solo por el código HTTP — así funciona igual antes y después
    // de que /health reporte 503 en ese caso.
    if (cuerpo?.estado === "vivo") {
      return cuerpo.db === "ok" && resp.ok ? "viva" : "degradada";
    }
    // 200 pero el cuerpo no es el JSON esperado (o no trae estado="vivo"):
    // algo contestó, pero no es la oficina hablando su idioma — degradada, no
    // viva. "caida" queda reservado a cuando la oficina ni siquiera contestó.
    return resp.ok ? "degradada" : "caida";
  } catch {
    return "caida";
  }
}
