/**
 * asesor-producto.ts — El Asesor de producto: identifica el mejor
 * financiamiento del catálogo SOC para la necesidad del prospecto
 * (recomendaciones_producto). Es el ÚNICO de los cinco genéricos que llena
 * `recomendacionesFinanciamiento` — y SOLO con productos reales del catálogo
 * (C-1): el prompt le da la lista literal de ids, nunca decide "de memoria".
 * El worker vuelve a verificar la fidelidad de todos modos (defensa en
 * profundidad) antes de persistir.
 */
import { EntregableGenericoV1Schema, type Empleado } from "@socrates/shared";
import {
  BLOQUEO_SIN_SERVICIO,
  BLOQUEO_SIN_RESULTADO,
  generarJSONValidado,
  instruccionesFormatoGenerico,
  listadoCatalogoParaPrompt,
} from "./utilidades.js";

export const asesorProducto: Empleado = {
  rol: "ASESOR_PRODUCTO",
  async ejecutar(entrada, ctx) {
    if (ctx.modoSinClaves) return { entregables: [], bloqueo: BLOQUEO_SIN_SERVICIO };

    await ctx.registrarProgreso(20, "Consultando el catálogo de instituciones aliadas…");
    const productos = await ctx.catalogo.listarProductos();
    if (productos.length === 0) {
      return {
        entregables: [],
        bloqueo: {
          motivo: "El catálogo de instituciones aliadas todavía no tiene productos capturados; no puedo recomendar nada todavía.",
        },
      };
    }

    const listado = listadoCatalogoParaPrompt(productos);

    const sistema = `Eres El Asesor de producto, especialista de una oficina mexicana de asesoría en crédito empresarial PYME. Tu único trabajo es identificar CUÁLES productos del catálogo real de instituciones aliadas le convienen al prospecto, y por qué.

REGLA DURA (C-1, el catálogo es sagrado): SOLO puedes recomendar productos de esta lista EXACTA, usando su productoId/institucionId LITERALES (cópialos tal cual, nunca los inventes ni los alteres). Si ninguno encaja bien, dilo en las brechas — nunca inventes un producto que no está aquí:
${listado}

${instruccionesFormatoGenerico("recomendaciones_producto")}
Además, llena "recomendacionesFinanciamiento" (1 a 3 opciones, las mejores para esta necesidad) con esta forma exacta por cada una:
{"necesidad":"string","hallazgoOrigen":"string (opcional)","productoId":"<literal de la lista>","institucionId":"<literal de la lista, el mismo que trae ese producto>","productoNombre":"<copiado de la lista>","institucionNombre":"<copiado de la lista>","montoPlazo":"string (opcional)","usoEspecifico":"string","requisitosClave":"string (opcional)","beneficioEsperado":"string (opcional)","inversionEstimada":"string (opcional)"}`;

    await ctx.registrarProgreso(60, "Comparando contra el catálogo real…");
    const prompt = `Empresa: ${ctx.expediente.empresa}
Ciudad: ${ctx.expediente.ciudad}
Giro: ${ctx.expediente.industria}
${ctx.expediente.notas ? `Notas del asesor: ${ctx.expediente.notas}\n` : ""}
Encargo del asesor: ${entrada.instruccion ?? "Identifica el mejor financiamiento del catálogo para esta necesidad."}`;

    const contenido = await generarJSONValidado(ctx.ia, sistema, prompt, EntregableGenericoV1Schema);
    if (!contenido) return { entregables: [], bloqueo: BLOQUEO_SIN_RESULTADO };

    await ctx.registrarProgreso(100, "Recomendación lista.");
    return { entregables: [{ tipo: "recomendaciones_producto", contenido }] };
  },
};
