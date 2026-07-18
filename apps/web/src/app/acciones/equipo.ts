"use server";
/**
 * Server Action para renombrar al equipo. La invoca la isla cliente (Panel de
 * Equipo, onboarding); corre en el servidor con la sesión de Clerk y habla con
 * la api por el api-client. El asesor se deriva del token allá, nunca del payload.
 */
import { guardarNombresEquipo } from "@/lib/api-client";
import { NombresEquipoSchema, type NombresEquipo } from "@socrates/shared";

export interface ResultadoEquipo {
  ok: boolean;
  error?: string;
}

export async function guardarNombresEquipoAction(
  nombres: NombresEquipo,
): Promise<ResultadoEquipo> {
  const parsed = NombresEquipoSchema.safeParse(nombres);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Revisa los nombres." };
  }
  try {
    await guardarNombresEquipo(parsed.data);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "No se pudo guardar." };
  }
}
