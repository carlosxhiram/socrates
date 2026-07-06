/**
 * investigador.ts — El Investigador: el pipeline de 6 fases (D-5) que arma el
 * Reporte de Inteligencia Financiera (reporte_inteligencia, ReporteV1).
 *
 * 1) Investigar industria+empresa (búsqueda externa si hay proveedor vivo).
 * 2) Perfil + FODA + hallazgos (1 llamada de IA).
 * 3) Matcheo de catálogo REAL (C-1: solo ids literales que existen).
 * 4) Brechas (ya vienen de la fase 2; aquí solo el checkpoint de progreso).
 * 5) Redactar el cuerpo del reporte (1 llamada de IA, con el análisis de
 *    las fases 2-3 como contexto).
 * 6) Verificar: endurece las citas (C-2 — "verificada" SOLO si la URL es una
 *    de las que de verdad se encontraron esta corrida, nunca por la sola
 *    palabra de la IA) y calcula el índice de cobertura contando de verdad.
 *
 * Sin catálogo o sin resultado de IA en cualquier fase crítica: bloqueo digno
 * (NFR-11), nunca un reporte a medias hecho pasar por completo (NFR-1).
 */
import { z } from "zod";
import {
  ReporteV1Schema,
  HallazgoSchema,
  FodaSchema,
  BrechaSchema,
  RecomendacionFinanciamientoSchema,
  RecomendacionEstrategicaSchema,
  SeccionCuerpoSchema,
  type Empleado,
  type ReporteV1,
  type Afirmacion,
  type Bloque,
  type Fuente,
  type RecomendacionFinanciamiento,
} from "@socrates/shared";
import { crearProveedorBusqueda } from "../busqueda/proveedor-busqueda.js";
import {
  BLOQUEO_SIN_SERVICIO,
  generarJSONValidado,
  instruccionesFormatoGenerico,
  listadoCatalogoParaPrompt,
} from "./utilidades.js";

const BLOQUEO_ANALISIS =
  "No logré construir el perfil de esta empresa con la información disponible; puedes reintentarlo.";
const BLOQUEO_REDACCION = "No logré redactar el reporte con el análisis reunido; puedes reintentarlo.";

// ── Fase 2: perfil + FODA + hallazgos ───────────────────────────────────────
const AnalisisSchema = z.object({
  hallazgos: z.array(HallazgoSchema.omit({ orden: true })).min(1),
  foda: FodaSchema,
  brechas: z.array(BrechaSchema).default([]),
});

// ── Fase 3: matcheo de catálogo ──────────────────────────────────────────────
const MatcheoSchema = z.object({
  recomendaciones: z.array(RecomendacionFinanciamientoSchema).default([]),
});

// ── Fase 5: redacción del cuerpo ─────────────────────────────────────────────
const RedaccionSchema = z.object({
  introduccion: z.array(z.string().min(1)).default([]),
  recomendacionesEstrategicas: z.array(RecomendacionEstrategicaSchema).min(1),
  secciones: z.array(SeccionCuerpoSchema).min(1),
});

function afirmacionesDeBloque(bloque: Bloque): Afirmacion[] {
  if (bloque.tipo === "parrafo" || bloque.tipo === "callout") return bloque.afirmaciones;
  if (bloque.tipo === "lista") return bloque.items.flatMap((item) => item.afirmaciones);
  return []; // "tabla" no carga afirmaciones en este esquema
}

function mapearBloque(bloque: Bloque, fn: (a: Afirmacion) => Afirmacion): Bloque {
  if (bloque.tipo === "parrafo" || bloque.tipo === "callout") {
    return { ...bloque, afirmaciones: bloque.afirmaciones.map(fn) };
  }
  if (bloque.tipo === "lista") {
    return { ...bloque, items: bloque.items.map((item) => ({ ...item, afirmaciones: item.afirmaciones.map(fn) })) };
  }
  return bloque;
}

function recolectarAfirmaciones(reporte: ReporteV1): Afirmacion[] {
  const todas: Afirmacion[] = [];
  for (const h of reporte.resumenEjecutivo.hallazgos) todas.push(...h.afirmaciones);
  for (const s of reporte.secciones) {
    for (const b of s.bloques) todas.push(...afirmacionesDeBloque(b));
    for (const sub of s.subsecciones) for (const b of sub.bloques) todas.push(...afirmacionesDeBloque(b));
  }
  return todas;
}

/**
 * C-2 endurecido en código, no solo en el prompt: una afirmación solo queda
 * "verificada" si su URL es una de las que ESTA corrida encontró de verdad
 * (`urlsReales`) — nunca porque la IA lo haya declarado por su cuenta. Sin esa
 * URL real, se degrada honestamente a estimación.
 */
function endurecerCitas(reporte: ReporteV1, urlsReales: Set<string>): ReporteV1 {
  const endurecer = (a: Afirmacion): Afirmacion => {
    if (a.respaldo.tipo !== "fuente") return a;
    const tieneUrlReal = a.respaldo.fuentes.some((f) => f.url && urlsReales.has(f.url));
    if (!tieneUrlReal) {
      return {
        texto: a.texto,
        respaldo: {
          tipo: "estimacion",
          metodo: "Análisis con la información disponible; sin fuente externa confirmada esta corrida.",
          fuentesBase: a.respaldo.fuentes,
        },
      };
    }
    return { ...a, respaldo: { ...a.respaldo, verificada: true } };
  };

  return {
    ...reporte,
    resumenEjecutivo: {
      ...reporte.resumenEjecutivo,
      hallazgos: reporte.resumenEjecutivo.hallazgos.map((h) => ({ ...h, afirmaciones: h.afirmaciones.map(endurecer) })),
    },
    secciones: reporte.secciones.map((s) => ({
      ...s,
      bloques: s.bloques.map((b) => mapearBloque(b, endurecer)),
      subsecciones: s.subsecciones.map((sub) => ({ ...sub, bloques: sub.bloques.map((b) => mapearBloque(b, endurecer)) })),
    })),
  };
}

function contarCobertura(reporte: ReporteV1): ReporteV1["indiceCobertura"] {
  const todas = recolectarAfirmaciones(reporte);
  const total = todas.length;
  const verificadas = todas.filter((a) => a.respaldo.tipo === "fuente" && a.respaldo.verificada).length;
  const estimaciones = todas.filter((a) => a.respaldo.tipo === "estimacion").length;
  const brechas = todas.filter((a) => a.respaldo.tipo === "brecha").length;
  return {
    totalAfirmaciones: total,
    verificadas,
    estimaciones,
    brechas,
    porcentajeCobertura: total > 0 ? Math.round((verificadas / total) * 1000) / 10 : 0,
    verificadoEn: new Date().toISOString(),
  };
}

export const investigador: Empleado = {
  rol: "INVESTIGADOR",
  async ejecutar(entrada, ctx) {
    if (ctx.modoSinClaves) return { entregables: [], bloqueo: BLOQUEO_SIN_SERVICIO };

    // ── Fase 1: investigar (15%) ──────────────────────────────────────────
    await ctx.registrarProgreso(15, "Investigando la industria y la empresa…");
    const busqueda = crearProveedorBusqueda();
    const fuentesEncontradas: Fuente[] = [];
    const urlsReales = new Set<string>();
    let contextoExterno = "";
    if (busqueda.disponible) {
      const consultas = [
        `${ctx.expediente.industria} México panorama y riesgos ${new Date().getFullYear()}`,
        `${ctx.expediente.empresa} ${ctx.expediente.ciudad}`,
      ];
      for (const consulta of consultas) {
        const resultados = await busqueda.buscar(consulta).catch(() => []);
        for (const r of resultados.slice(0, 3)) {
          urlsReales.add(r.url);
          fuentesEncontradas.push({ titulo: r.titulo, url: r.url });
          contextoExterno += `\n- [${r.titulo}](${r.url}): ${r.fragmento}`;
        }
      }
    }

    // ── Fase 2: perfil + FODA + hallazgos (35%) ──────────────────────────
    await ctx.registrarProgreso(35, "Construyendo el perfil y el FODA…");
    const sistemaAnalisis = `Eres El Investigador, especialista de una oficina mexicana de asesoría en crédito empresarial PYME. Analizas la industria y la empresa del expediente para armar hallazgos y un FODA honesto.

Responde ÚNICAMENTE un objeto JSON (sin texto antes/después, sin fences) con esta forma EXACTA:
{"hallazgos":[{"titulo":"string","descripcion":"string","afirmaciones":[]}],"foda":{"fortalezas":[{"texto":"string"}],"oportunidades":[{"texto":"string"}],"debilidades":[{"texto":"string"}],"amenazas":[{"texto":"string"}]},"brechas":[{"tema":"string","descripcion":"string","recomendacion":"string (opcional)","severidad":"alta"|"media"|"baja"}]}
Reglas: mínimo 2 hallazgos y al menos un elemento en cada categoría del FODA cuando sea razonable. En "foda" NUNCA incluyas "respaldo" (son juicios del asesor, no citas). En "afirmaciones" de cada hallazgo: dejarlo vacío salvo que cites algo del "Contexto externo encontrado" de abajo — en ese caso usa {"texto":"...","respaldo":{"tipo":"fuente","fuentes":[{"titulo":"...","url":"<URL EXACTA del contexto>"}],"verificada":false}}. Si no tienes contexto externo, NUNCA marques nada como "fuente" — usa {"tipo":"estimacion","metodo":"...","fuentesBase":[]}. "brechas": información real que falta y el asesor debería conseguir del cliente. Español de México impecable, sin jerga técnica.`;
    const promptAnalisis = `Empresa: ${ctx.expediente.empresa}
Ciudad: ${ctx.expediente.ciudad}
Giro: ${ctx.expediente.industria}
${ctx.expediente.sitioWeb ? `Sitio web: ${ctx.expediente.sitioWeb}\n` : ""}${ctx.expediente.rfc ? `RFC capturado: sí\n` : ""}${ctx.expediente.sucursales ? `Sucursales: ${ctx.expediente.sucursales}\n` : ""}${ctx.expediente.notas ? `Notas del asesor: ${ctx.expediente.notas}\n` : ""}
${contextoExterno ? `Contexto externo encontrado:${contextoExterno}\n` : "No hay contexto externo disponible esta corrida: basa el análisis SOLO en los datos del expediente; todo lo que no se sepa con certeza se marca como brecha o estimación, NUNCA como fuente verificada.\n"}
Encargo del asesor: ${entrada.instruccion ?? "Arma el reporte de inteligencia financiera de este prospecto."}`;

    const analisis = await generarJSONValidado(ctx.ia, sistemaAnalisis, promptAnalisis, AnalisisSchema);
    if (!analisis) return { entregables: [], bloqueo: { motivo: BLOQUEO_ANALISIS } };

    // ── Fase 3: matcheo de catálogo (55%) ─────────────────────────────────
    await ctx.registrarProgreso(55, "Comparando contra el catálogo real…");
    const productos = await ctx.catalogo.listarProductos();
    let recomendaciones: RecomendacionFinanciamiento[] = [];
    if (productos.length > 0) {
      const listado = listadoCatalogoParaPrompt(productos);
      const sistemaMatcheo = `Eres El Investigador identificando qué productos del catálogo REAL de instituciones aliadas encajan con las necesidades detectadas.

REGLA DURA (C-1, el catálogo es sagrado): SOLO puedes usar productos de esta lista EXACTA, con su productoId/institucionId LITERALES:
${listado}

Responde ÚNICAMENTE un JSON: {"recomendaciones":[{"necesidad":"string","hallazgoOrigen":"string (opcional)","productoId":"<literal>","institucionId":"<literal, el mismo del producto>","productoNombre":"<copiado>","institucionNombre":"<copiado>","montoPlazo":"string (opcional)","usoEspecifico":"string","requisitosClave":"string (opcional)","beneficioEsperado":"string (opcional)","inversionEstimada":"string (opcional)"}]}
1 a 3 recomendaciones, las que mejor encajen. Si ninguna encaja bien, responde "recomendaciones":[].`;
      const promptMatcheo = `Hallazgos detectados:\n${analisis.hallazgos.map((h) => `- ${h.titulo}: ${h.descripcion}`).join("\n")}`;
      const matcheo = await generarJSONValidado(ctx.ia, sistemaMatcheo, promptMatcheo, MatcheoSchema);
      recomendaciones = matcheo?.recomendaciones ?? [];
    }

    // ── Fase 4: brechas (70%) — ya reunidas en `analisis.brechas`; checkpoint. ─
    await ctx.registrarProgreso(70, "Marcando lo que falta por confirmar…");

    // ── Fase 5: redactar (85%) ─────────────────────────────────────────────
    await ctx.registrarProgreso(85, "Redactando el reporte…");
    const sistemaRedaccion = `Eres El Investigador redactando el CUERPO del Reporte de Inteligencia Financiera para el asesor, a partir del análisis ya reunido.

${instruccionesFormatoGenerico("reporte_inteligencia")}
Además de "secciones", responde también:
"introduccion": ["1 a 3 párrafos de apertura del resumen ejecutivo"],
"recomendacionesEstrategicas": [{"clave":"R1","titulo":"string","descripcion":"string","impactoEsperado":"string (opcional)","institucionSugerida":"string (opcional)"}] (mínimo 1, alto nivel — el detalle de producto ya se resolvió aparte, aquí solo el QUÉ hacer)
Escribe 2 a 4 "secciones" con el cuerpo del análisis (perfil de la empresa, contexto de la industria, riesgos). Reusa las afirmaciones/respaldo con la MISMA disciplina de C-2 explicada arriba.`;
    const promptRedaccion = `Empresa: ${ctx.expediente.empresa} (${ctx.expediente.industria}, ${ctx.expediente.ciudad})

Hallazgos ya analizados:
${analisis.hallazgos.map((h) => `- ${h.titulo}: ${h.descripcion}`).join("\n")}

FODA ya analizado: fortalezas=${analisis.foda.fortalezas.map((f) => f.texto).join(" | ")}; oportunidades=${analisis.foda.oportunidades.map((f) => f.texto).join(" | ")}; debilidades=${analisis.foda.debilidades.map((f) => f.texto).join(" | ")}; amenazas=${analisis.foda.amenazas.map((f) => f.texto).join(" | ")}

${recomendaciones.length > 0 ? `Productos ya identificados como viables: ${recomendaciones.map((r) => r.productoNombre).join(", ")}` : "No se identificó un producto del catálogo que encaje bien todavía."}
${contextoExterno ? `\nContexto externo encontrado:${contextoExterno}` : ""}

Redacta el reporte completo con esta información.`;

    const redaccion = await generarJSONValidado(ctx.ia, sistemaRedaccion, promptRedaccion, RedaccionSchema);
    if (!redaccion) return { entregables: [], bloqueo: { motivo: BLOQUEO_REDACCION } };

    // ── Ensamblar el ReporteV1 completo ────────────────────────────────────
    let reporte: ReporteV1;
    try {
      reporte = ReporteV1Schema.parse({
        metadatos: {
          titulo: `Reporte de Inteligencia Financiera — ${ctx.expediente.empresa}`,
          cliente: { nombre: ctx.expediente.empresa, ciudad: ctx.expediente.ciudad, descriptor: ctx.expediente.industria },
          preparadoPor: { ciudad: ctx.expediente.ciudad },
          fecha: new Date().toISOString(),
        },
        resumenEjecutivo: {
          introduccion: redaccion.introduccion,
          hallazgos: analisis.hallazgos.map((h, i) => ({ ...h, orden: i + 1 })),
          recomendaciones: redaccion.recomendacionesEstrategicas,
        },
        perfilCliente: { historia: [], foda: analisis.foda },
        secciones: redaccion.secciones,
        recomendacionesFinanciamiento: recomendaciones,
        brechas: analisis.brechas,
        fuentes: fuentesEncontradas,
      });
    } catch {
      return { entregables: [], bloqueo: { motivo: BLOQUEO_REDACCION } };
    }

    // ── Fase 6: verificar (95%) ────────────────────────────────────────────
    await ctx.registrarProgreso(95, "Verificando citas y calculando la cobertura…");
    reporte = endurecerCitas(reporte, urlsReales);
    reporte = { ...reporte, indiceCobertura: contarCobertura(reporte) };

    await ctx.registrarProgreso(100, "Reporte listo.");
    return { entregables: [{ tipo: "reporte_inteligencia", contenido: reporte }] };
  },
};
