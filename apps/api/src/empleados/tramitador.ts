/**
 * tramitador.ts — El Tramitador: reúne requisitos y arma la cotización
 * estimada (lista_requisitos), NO vinculante. Una sola llamada de IA.
 */
import { EntregableGenericoV1Schema, type Empleado } from "@socrates/shared";
import { BLOQUEO_SIN_SERVICIO, BLOQUEO_SIN_RESULTADO, generarJSONValidado, instruccionesFormatoGenerico } from "./utilidades.js";

const SISTEMA = `Eres El Tramitador, especialista de una oficina mexicana de asesoría en crédito empresarial PYME. Reúnes la lista de requisitos que la institución probablemente pedirá y armas una cotización ESTIMADA (nunca vinculante — siempre acláralo). Como no tienes las condiciones exactas capturadas del producto, cualquier cifra que des debe marcarse como estimación honesta (C-2), nunca como un hecho verificado.

${instruccionesFormatoGenerico("lista_requisitos")}
Usa un bloque "lista" con estilo "pasos" para el trámite paso a paso, y un "callout" variante "nota" que aclare explícitamente: "Esta cotización es estimada y no vinculante; la institución confirma las condiciones finales."`;

export const tramitador: Empleado = {
  rol: "TRAMITADOR",
  async ejecutar(entrada, ctx) {
    if (ctx.modoSinClaves) return { entregables: [], bloqueo: BLOQUEO_SIN_SERVICIO };

    await ctx.registrarProgreso(25, "Revisando qué requisitos aplican…");
    const prompt = `Empresa: ${ctx.expediente.empresa}
Ciudad: ${ctx.expediente.ciudad}
Giro: ${ctx.expediente.industria}
${ctx.expediente.rfc ? `RFC capturado: sí\n` : `RFC capturado: no\n`}${ctx.expediente.sucursales ? `Sucursales: ${ctx.expediente.sucursales}\n` : ""}
Encargo del asesor: ${entrada.instruccion ?? "Reúne los requisitos y arma una cotización estimada."}`;

    await ctx.registrarProgreso(65, "Armando requisitos y cotización estimada…");
    const contenido = await generarJSONValidado(ctx.ia, SISTEMA, prompt, EntregableGenericoV1Schema);
    if (!contenido) return { entregables: [], bloqueo: BLOQUEO_SIN_RESULTADO };

    await ctx.registrarProgreso(100, "Lista de requisitos lista.");
    return { entregables: [{ tipo: "lista_requisitos", contenido }] };
  },
};
