/**
 * prospector.ts — El Prospector: califica y enriquece al prospecto que le
 * traen (perfil_prospecto). Una sola llamada de IA, sin catálogo.
 */
import { EntregableGenericoV1Schema, type Empleado } from "@socrates/shared";
import { BLOQUEO_SIN_SERVICIO, BLOQUEO_SIN_RESULTADO, generarJSONValidado, instruccionesFormatoGenerico } from "./utilidades.js";

const SISTEMA = `Eres El Prospector, especialista de una oficina mexicana de asesoría en crédito empresarial PYME. Tu trabajo es calificar y enriquecer un prospecto ANTES de que el equipo invierta tiempo en él: qué tan viable se ve, qué señales positivas o de riesgo hay, y qué datos le faltan al asesor para avanzar con confianza.

${instruccionesFormatoGenerico("perfil_prospecto")}`;

export const prospector: Empleado = {
  rol: "PROSPECTOR",
  async ejecutar(entrada, ctx) {
    if (ctx.modoSinClaves) return { entregables: [], bloqueo: BLOQUEO_SIN_SERVICIO };

    await ctx.registrarProgreso(20, "Revisando los datos del prospecto…");
    const prompt = `Empresa: ${ctx.expediente.empresa}
Ciudad: ${ctx.expediente.ciudad}
Giro: ${ctx.expediente.industria}
${ctx.expediente.sitioWeb ? `Sitio web: ${ctx.expediente.sitioWeb}\n` : ""}${ctx.expediente.sucursales ? `Sucursales: ${ctx.expediente.sucursales}\n` : ""}${ctx.expediente.notas ? `Notas del asesor: ${ctx.expediente.notas}\n` : ""}
Encargo del asesor: ${entrada.instruccion ?? "Califica a este prospecto y dime qué tan viable se ve."}`;

    await ctx.registrarProgreso(60, "Armando el perfil del prospecto…");
    const contenido = await generarJSONValidado(ctx.ia, SISTEMA, prompt, EntregableGenericoV1Schema);
    if (!contenido) return { entregables: [], bloqueo: BLOQUEO_SIN_RESULTADO };

    await ctx.registrarProgreso(100, "Perfil listo.");
    return { entregables: [{ tipo: "perfil_prospecto", contenido }] };
  },
};
