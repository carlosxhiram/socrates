"use server";
/**
 * Server Actions del recibimiento. El wizard (cliente) las invoca; corren en el
 * servidor con la sesión de Clerk y hablan con la api por el api-client.
 */
import {
  obtenerYo,
  guardarPerfil,
  iniciarCheckout,
  completarBienvenida,
} from "@/lib/api-client";
import { GuardarPerfilSchema, type YoDTO } from "@socrates/shared";

export interface ResultadoPerfil {
  ok: boolean;
  error?: string;
}

/** Paso 1: valida y guarda los datos de la oficina (para useActionState). */
export async function guardarPerfilAction(
  _prev: ResultadoPerfil | null,
  formData: FormData,
): Promise<ResultadoPerfil> {
  const parsed = GuardarPerfilSchema.safeParse({
    nombreOficina: formData.get("nombreOficina"),
    zona: formData.get("zona"),
    especialidad: formData.get("especialidad"),
    // Las casillas nativas llegan como "on" si están marcadas, ausentes si no.
    aceptaTerminos: formData.get("aceptaTerminos") === "on",
    aceptaAviso: formData.get("aceptaAviso") === "on",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Revisa los datos." };
  }
  try {
    await guardarPerfil(parsed.data);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "No se pudo guardar." };
  }
}

/** Paso 2: crea el Checkout y devuelve la URL a donde mandar al asesor. */
export async function iniciarPruebaAction(): Promise<{ url: string; modo: "stripe" | "demo" }> {
  return iniciarCheckout();
}

/** Paso 3: marca la bienvenida vista. Lanza si aún falta acceso (la api lo valida). */
export async function completarBienvenidaAction(): Promise<void> {
  await completarBienvenida();
}

/** Sondeo del estado actual (lo usa el paso "confirmando" tras volver de Stripe). */
export async function estadoAction(): Promise<YoDTO> {
  return obtenerYo();
}
