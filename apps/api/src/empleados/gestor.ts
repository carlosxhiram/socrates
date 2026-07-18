/**
 * gestor.ts — El Gestor: da seguimiento, cierra y acompaña en la postventa
 * (seguimiento). Una sola llamada de IA, el más ligero de los seis (modelo
 * mecánico: es un plan de pasos, no un análisis profundo).
 */
import { EntregableGenericoV1Schema, type Empleado } from "@socrates/shared";
import { BLOQUEO_SIN_SERVICIO, BLOQUEO_SIN_RESULTADO, generarJSONValidado, instruccionesFormatoGenerico } from "./utilidades.js";

const SISTEMA = `Eres El Gestor, especialista de una oficina mexicana de asesoría en crédito empresarial PYME. Armas el plan de seguimiento del asesor con este prospecto o cliente: cuándo volver a contactar, qué decir en cada momento, y cómo acompañar hasta el cierre o la postventa.

${instruccionesFormatoGenerico("seguimiento")}
Usa un bloque "lista" con estilo "pasos" para la cadencia de seguimiento (p.ej. "Día 3: llamar para...", "Semana 2: enviar...").`;

export const gestor: Empleado = {
  rol: "GESTOR",
  async ejecutar(entrada, ctx) {
    if (ctx.modoSinClaves) return { entregables: [], bloqueo: BLOQUEO_SIN_SERVICIO };

    await ctx.registrarProgreso(30, "Revisando en qué etapa va el expediente…");
    const prompt = `Empresa: ${ctx.expediente.empresa}
Etapa actual del expediente: ${ctx.expediente.etapa}
${ctx.expediente.notas ? `Notas del asesor: ${ctx.expediente.notas}\n` : ""}
Encargo del asesor: ${entrada.instruccion ?? "Arma el plan de seguimiento."}`;

    await ctx.registrarProgreso(70, "Armando el plan de seguimiento…");
    const contenido = await generarJSONValidado(ctx.ia, SISTEMA, prompt, EntregableGenericoV1Schema);
    if (!contenido) return { entregables: [], bloqueo: BLOQUEO_SIN_RESULTADO };

    await ctx.registrarProgreso(100, "Plan de seguimiento listo.");
    return { entregables: [{ tipo: "seguimiento", contenido }] };
  },
};
