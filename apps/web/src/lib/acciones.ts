"use server";
/**
 * acciones.ts — mutaciones de La Oficina hacia la api (E2-S1/S5/S7).
 *
 * Server Actions: el token de Clerk (si hay) viaja del lado del servidor, igual
 * que en api-client.ts. En Modo asesor demo van sin token y la api resuelve al
 * asesor demo (NFR-11). Los mensajes de error vienen de la api ya en lenguaje
 * de oficina (NFR-14) y se muestran tal cual.
 */
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8787";
const clerkConfigurado = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export interface ResultadoAccion {
  exito: boolean;
  /** Mensaje de oficina para el Asesor (vacío cuando exito y no hay nada que decir). */
  mensaje: string;
}

async function tokenDeSesion(): Promise<string | null> {
  if (!clerkConfigurado) return null;
  try {
    const { getToken } = await auth();
    return (await getToken()) ?? null;
  } catch {
    return null;
  }
}

async function llamarApi(
  ruta: string,
  metodo: "POST" | "PATCH",
  cuerpo: Record<string, unknown>,
): Promise<{ ok: boolean; status: number; datos: unknown }> {
  const token = await tokenDeSesion();
  try {
    const resp = await fetch(`${API_URL}${ruta}`, {
      method: metodo,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(cuerpo),
      cache: "no-store",
    });
    const datos: unknown = await resp.json().catch(() => null);
    return { ok: resp.ok, status: resp.status, datos };
  } catch {
    return { ok: false, status: 0, datos: null };
  }
}

function mensajeDeError(datos: unknown, status: number): string {
  const mensaje =
    datos && typeof datos === "object" && "error" in datos
      ? (datos as { error?: { mensaje?: string } }).error?.mensaje
      : undefined;
  if (mensaje) return mensaje;
  if (status === 0) return "No pude conectarme con tu oficina. Revisa que el servicio esté encendido e inténtalo de nuevo.";
  return "Algo no salió bien al guardar. Inténtalo de nuevo en un momento.";
}

function limpiarTexto(valor: FormDataEntryValue | null): string | undefined {
  if (typeof valor !== "string") return undefined;
  const texto = valor.trim();
  return texto.length > 0 ? texto : undefined;
}

// ── E2-S1: crear Expediente ──────────────────────────────────────────────────
export async function crearExpediente(
  _previo: ResultadoAccion,
  formulario: FormData,
): Promise<ResultadoAccion> {
  const empresa = limpiarTexto(formulario.get("empresa"));
  const ciudad = limpiarTexto(formulario.get("ciudad"));
  const industria = limpiarTexto(formulario.get("industria"));
  if (!empresa || !ciudad || !industria) {
    return { exito: false, mensaje: "Para abrir el expediente necesito al menos la empresa, la ciudad y el giro." };
  }

  const sucursalesTexto = limpiarTexto(formulario.get("sucursales"));
  const sucursales = sucursalesTexto !== undefined ? Number(sucursalesTexto) : undefined;
  if (sucursales !== undefined && (!Number.isInteger(sucursales) || sucursales < 0)) {
    return { exito: false, mensaje: "El número de sucursales debe ser un número entero (o déjalo vacío)." };
  }

  const res = await llamarApi("/expedientes", "POST", {
    empresa,
    ciudad,
    industria,
    ...(limpiarTexto(formulario.get("sitioWeb")) ? { sitioWeb: limpiarTexto(formulario.get("sitioWeb")) } : {}),
    ...(limpiarTexto(formulario.get("rfc")) ? { rfc: limpiarTexto(formulario.get("rfc")) } : {}),
    ...(sucursales !== undefined ? { sucursales } : {}),
    ...(limpiarTexto(formulario.get("notas")) ? { notas: limpiarTexto(formulario.get("notas")) } : {}),
  });

  if (!res.ok) return { exito: false, mensaje: mensajeDeError(res.datos, res.status) };

  const creado = res.datos as { id: string };
  revalidatePath("/oficina");
  redirect(`/expedientes/${creado.id}`);
}

// ── E2-S5: editar datos del prospecto ────────────────────────────────────────
export async function editarExpediente(
  id: string,
  _previo: ResultadoAccion,
  formulario: FormData,
): Promise<ResultadoAccion> {
  const empresa = limpiarTexto(formulario.get("empresa"));
  const ciudad = limpiarTexto(formulario.get("ciudad"));
  const industria = limpiarTexto(formulario.get("industria"));
  if (!empresa || !ciudad || !industria) {
    return { exito: false, mensaje: "El expediente no puede quedarse sin empresa, ciudad o giro." };
  }

  const sucursalesTexto = limpiarTexto(formulario.get("sucursales"));
  const sucursales = sucursalesTexto !== undefined ? Number(sucursalesTexto) : undefined;
  if (sucursales !== undefined && (!Number.isInteger(sucursales) || sucursales < 0)) {
    return { exito: false, mensaje: "El número de sucursales debe ser un número entero (o déjalo vacío)." };
  }

  const res = await llamarApi(`/expedientes/${id}`, "PATCH", {
    empresa,
    ciudad,
    industria,
    sitioWeb: limpiarTexto(formulario.get("sitioWeb")) ?? "",
    rfc: limpiarTexto(formulario.get("rfc")) ?? "",
    ...(sucursales !== undefined ? { sucursales } : {}),
    notas: limpiarTexto(formulario.get("notas")) ?? "",
  });

  if (!res.ok) return { exito: false, mensaje: mensajeDeError(res.datos, res.status) };

  revalidatePath("/oficina");
  revalidatePath(`/expedientes/${id}`);
  return { exito: true, mensaje: "Datos del prospecto guardados." };
}

// ── E2-S7: avanzar Etapa / marcar Ganado-Perdido ─────────────────────────────
export async function cambiarEtapa(
  id: string,
  etapa: string,
  motivoCierre?: string,
): Promise<ResultadoAccion> {
  const res = await llamarApi(`/expedientes/${id}`, "PATCH", {
    etapa,
    ...(motivoCierre?.trim() ? { motivoCierre: motivoCierre.trim() } : {}),
  });

  if (!res.ok) return { exito: false, mensaje: mensajeDeError(res.datos, res.status) };

  revalidatePath("/oficina");
  revalidatePath(`/expedientes/${id}`);
  return { exito: true, mensaje: "" };
}

// ── Carril C1 ─────────────────────────────────────────────────────────────
// Encargar trabajo al equipo (spec 2.1/2.11) y aprobar un entregable (spec 2.9).

/** Contrato POST /expedientes/:id/tareas (spec 2.1, la construye el Carril A). */
export async function encargarTarea(
  expedienteId: string,
  empleadoRol: string,
  descripcion?: string,
): Promise<ResultadoAccion> {
  const res = await llamarApi(`/expedientes/${expedienteId}/tareas`, "POST", {
    empleadoRol,
    ...(descripcion?.trim() ? { descripcion: descripcion.trim() } : {}),
  });

  if (!res.ok) return { exito: false, mensaje: mensajeDeError(res.datos, res.status) };

  revalidatePath(`/expedientes/${expedienteId}`);
  return { exito: true, mensaje: "" };
}

/**
 * Aprobar un entregable (spec 2.9): manda la versión vista para detectar el
 * candado (409 VERSION_DESFASADA) sin usar api-client.ts (solo lectura desde
 * el servidor) — las mutaciones del visor viven aquí, igual que el resto.
 */
export async function aprobarEntregable(
  entregableId: string,
  version: number,
): Promise<ResultadoAccion & { versionDesfasada?: boolean }> {
  const res = await llamarApi(`/entregables/${entregableId}/aprobar`, "POST", { version });

  if (!res.ok) {
    const codigo =
      res.datos && typeof res.datos === "object" && "error" in res.datos
        ? (res.datos as { error?: { codigo?: string } }).error?.codigo
        : undefined;
    return {
      exito: false,
      mensaje: mensajeDeError(res.datos, res.status),
      versionDesfasada: codigo === "VERSION_DESFASADA",
    };
  }

  revalidatePath(`/entregables/${entregableId}`);
  return { exito: true, mensaje: "Entregable aprobado. Ya está listo para usarse con tu prospecto." };
}
