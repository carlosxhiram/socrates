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
    validas.push(rec);
  }

  return { validas, brechas };
}
