/**
 * negociador.ts — El Negociador: guion de acercamiento, pitch y manejo de
 * objeciones (guion_acercamiento). Una sola llamada de IA, sin catálogo.
 */
import { EntregableGenericoV1Schema, type Empleado } from "@socrates/shared";
import { BLOQUEO_SIN_SERVICIO, BLOQUEO_SIN_RESULTADO, generarJSONValidado, instruccionesFormatoGenerico } from "./utilidades.js";

const SISTEMA = `Eres El Negociador, especialista de una oficina mexicana de asesoría en crédito empresarial PYME. Preparas el guion de acercamiento del asesor con el prospecto: cómo abrir la conversación, el pitch central y el manejo de las objeciones más probables (tasa, plazo, garantías, desconfianza). Nunca inventas condiciones de producto que no te den — si el asesor no te dio detalles del producto, habla en términos generales y honestos.

${instruccionesFormatoGenerico("guion_acercamiento")}
Usa bloques "lista" con estilo "pasos" para el guion paso a paso, y "callout" variante "advertencia" para las objeciones con su respuesta.`;

export const negociador: Empleado = {
  rol: "NEGOCIADOR",
  async ejecutar(entrada, ctx) {
    if (ctx.modoSinClaves) return { entregables: [], bloqueo: BLOQUEO_SIN_SERVICIO };

    await ctx.registrarProgreso(25, "Repasando el expediente del prospecto…");
    const prompt = `Empresa (prospecto): ${ctx.expediente.empresa}
Ciudad: ${ctx.expediente.ciudad}
Giro: ${ctx.expediente.industria}
${ctx.expediente.notas ? `Notas del asesor: ${ctx.expediente.notas}\n` : ""}
Encargo del asesor: ${entrada.instruccion ?? "Prepara el guion de acercamiento y el manejo de objeciones."}`;

    await ctx.registrarProgreso(65, "Preparando el guion y las objeciones…");
    const contenido = await generarJSONValidado(ctx.ia, SISTEMA, prompt, EntregableGenericoV1Schema);
    if (!contenido) return { entregables: [], bloqueo: BLOQUEO_SIN_RESULTADO };

    await ctx.registrarProgreso(100, "Guion listo.");
    return { entregables: [{ tipo: "guion_acercamiento", contenido }] };
  },
};
