/**
 * portero.ts — el guardián de las páginas protegidas (server-side).
 *
 * Llama `requerirAcceso()` al inicio de un Server Component protegido: si al
 * asesor le falta cualquier paso del recibimiento (perfil, pago o bienvenida),
 * lo manda a `/bienvenida`. Solo deja pasar si `siguientePaso === "completo"`.
 *
 * La decisión la toma el SERVIDOR vía `GET /yo` (que calcula siguientePaso); el
 * cliente nunca elige su propio acceso.
 */
import { redirect } from "next/navigation";
import { obtenerYo } from "./api-client";

export async function requerirAcceso(): Promise<void> {
  try {
    const yo = await obtenerYo();
    if (yo.siguientePaso === "completo") return;
  } catch {
    // api caída o sin cuenta resoluble: que el recibimiento lo maneje.
  }
  // redirect() está FUERA del try para no tragarse su excepción interna.
  redirect("/bienvenida");
}
