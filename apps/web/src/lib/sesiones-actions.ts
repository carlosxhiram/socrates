"use server";
/**
 * sesiones-actions.ts — Server Actions para el chat de Sócrates (D-1).
 *
 * Adjunta el JWT de Clerk cuando hay sesión. En Modo asesor demo (sin Clerk),
 * llama sin token y la api resuelve al asesor demo (NFR-11).
 *
 * Se pueden llamar tanto desde Server Components como desde Client Components.
 */
import { auth } from "@clerk/nextjs/server";
import type {
  SesionResumenDTO,
  SesionDetalleDTO,
  MensajeDTO,
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

async function pedir<T>(
  ruta: string,
  opciones?: RequestInit,
): Promise<T> {
  const token = await tokenDeSesion();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const resp = await fetch(`${API_URL}${ruta}`, {
    ...opciones,
    headers,
    cache: "no-store",
  });
  if (!resp.ok) {
    const cuerpo = await resp.json().catch(() => ({}));
    const mensaje =
      (cuerpo as { error?: { mensaje?: string } })?.error?.mensaje ??
      `Error ${resp.status} en ${ruta}`;
    throw new Error(mensaje);
  }
  return (await resp.json()) as T;
}

/** Lista todas las conversaciones del Asesor (más reciente primero). */
export async function listarSesiones(): Promise<SesionResumenDTO[]> {
  return pedir<SesionResumenDTO[]>("/sesiones");
}

/**
 * Crea una sesión vacía. Si no se pasa título usa el default "Nueva conversación".
 */
export async function crearSesion(titulo?: string): Promise<SesionResumenDTO> {
  return pedir<SesionResumenDTO>("/sesiones", {
    method: "POST",
    body: JSON.stringify(titulo ? { titulo } : {}),
  });
}

/** Obtiene el detalle de una sesión con todos sus mensajes. */
export async function obtenerSesion(id: string): Promise<SesionDetalleDTO> {
  return pedir<SesionDetalleDTO>(`/sesiones/${id}`);
}

/**
 * Envía un mensaje de usuario y obtiene la respuesta de Sócrates.
 * Devuelve los dos nuevos mensajes: el del usuario y el del asistente.
 */
export async function enviarMensaje(
  sesionId: string,
  texto: string,
): Promise<{ usuario: MensajeDTO; asistente: MensajeDTO }> {
  return pedir<{ usuario: MensajeDTO; asistente: MensajeDTO }>(
    `/sesiones/${sesionId}/mensajes`,
    {
      method: "POST",
      body: JSON.stringify({ texto }),
    },
  );
}

/** Elimina una conversación completa (incluye todos sus mensajes). */
export async function eliminarSesion(id: string): Promise<void> {
  await pedir<{ eliminado: boolean }>(`/sesiones/${id}`, { method: "DELETE" });
}
