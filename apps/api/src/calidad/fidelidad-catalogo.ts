/**
 * fidelidad-catalogo.ts — el foso C-1 como código de servidor.
 *
 * "El catálogo es sagrado": ninguna recomendación de financiamiento llega al
 * Asesor si su `productoId` no existe en el Catálogo real, o si `institucionId`
 * no coincide con la institución REAL del producto (el modelo Prisma
 * `Recomendacion` no tiene institucionId propio — la institución se deriva
 * SIEMPRE vía `producto.institucion`, nunca se guarda por separado).
 *
 * Las descartadas NO se silencian: se devuelven como Brecha, honesta y visible
 * (NFR-11/C-2) — nunca se "arregla" inventando la institución/producto que
 * falta (regla 5 del CLAUDE.md: el catálogo lo cura solo Carlos).
 */
import type { CatalogoLector, BrechaInfo } from "@socrates/shared";
import type { RecomendacionFinanciamiento } from "@socrates/shared";

export interface ResultadoFidelidad {
  validas: RecomendacionFinanciamiento[];
  brechas: BrechaInfo[];
}

/**
 * Filtra `recomendaciones` contra el Catálogo real. Una recomendación se
 * descarta si:
 *  - el `productoId` no existe, o
 *  - el `institucionId` que trae NO coincide con `producto.institucionId`.
 *
 * Las que sobreviven NO se persisten con el `productoNombre`/`institucionNombre`
 * que haya escrito la IA: el id es la fuente de verdad (C-1), así que el
 * NOMBRE que ve el asesor se sobrescribe con el del catálogo real. Sin esto,
 * un id correcto podría llevar pegada una etiqueta inventada (otro nombre,
 * otra tasa) y el foso validaría el id mientras la mentira pasa por la
 * etiqueta — el catálogo es sagrado también en lo que el asesor LEE, no
 * solo en lo que el sistema referencia internamente.
 */
export async function verificarRecomendaciones(
  recomendaciones: RecomendacionFinanciamiento[],
  catalogo: CatalogoLector,
): Promise<ResultadoFidelidad> {
  const validas: RecomendacionFinanciamiento[] = [];
  const brechas: BrechaInfo[] = [];

  for (const rec of recomendaciones) {
    const producto = await catalogo.buscarProducto(rec.productoId);
    if (!producto) {
      brechas.push({
        campo: "recomendacion",
        motivo: `Se descartó una sugerencia (${rec.productoNombre || rec.productoId}) fuera del catálogo vigente.`,
      });
      continue;
    }
    if (producto.institucionId !== rec.institucionId) {
      brechas.push({
        campo: "recomendacion",
        motivo: `Se descartó una sugerencia de "${rec.productoNombre}" con institución inconsistente con el catálogo vigente.`,
      });
      continue;
    }
    validas.push({
      ...rec,
      productoNombre: producto.nombre,
      institucionNombre: producto.institucionNombre,
    });
  }

  return { validas, brechas };
}
