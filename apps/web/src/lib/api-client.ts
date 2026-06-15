/**
 * api-client.ts — cliente tipado a apps/api (D-1).
 *
 * Adjunta el JWT de Clerk cuando hay sesión (await auth().getToken()). En Modo
 * asesor demo (sin Clerk), llama sin token y la api resuelve al asesor demo.
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
  const resp = await fetch(`${API_URL}${ruta}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    cache: "no-store",
  });
  if (!resp.ok) {
    throw new Error(`api ${ruta} respondió ${resp.status}`);
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
  contenido: unknown;
}

export async function obtenerEntregable(id: string): Promise<EntregableDetalle> {
  return pedir<EntregableDetalle>(`/entregables/${id}`);
}

/** ¿La api está viva? Para mostrar un aviso cálido si no. */
export async function apiViva(): Promise<boolean> {
  try {
    const resp = await fetch(`${API_URL}/health`, { cache: "no-store" });
    return resp.ok;
  } catch {
    return false;
  }
}
