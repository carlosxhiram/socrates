/**
 * EntregableGenericoView.tsx — el visor de los 5 entregables que NO son el
 * Reporte de Inteligencia (perfil_prospecto, recomendaciones_producto,
 * guion_acercamiento, lista_requisitos, seguimiento). Misma pintura visual
 * que ReporteV1 (bloques, citas, fuentes) — solo el armazón es más simple:
 * sin carta ejecutiva, sin perfil FODA, sin índice de cobertura.
 */
import type { EntregableGenericoV1, Fuente } from "@socrates/shared";
import {
  construirRegistro,
  Seccion,
  BloqueView,
  RecomendacionesFinanciamientoSeccion,
  BrechasSeccion,
  FuentesSeccion,
} from "./ComponentesReporte";

export function EntregableGenericoView({ contenido }: { contenido: EntregableGenericoV1 }) {
  const registro = construirRegistro((registrar) => {
    for (const s of contenido.secciones) {
      for (const b of s.bloques) visitarBloqueParaFuentes(b, registrar);
    }
  }, contenido.fuentes);

  return (
    <article className="mt-4 rounded-xl border border-oficina-borde bg-oficina-panel p-6">
      <header className="border-b border-oficina-borde pb-4">
        <h1 className="text-2xl font-semibold text-oficina-texto">{contenido.titulo}</h1>
        {contenido.subtitulo && <p className="mt-1 text-sm text-oficina-tenue">{contenido.subtitulo}</p>}
      </header>

      {contenido.resumen.length > 0 && (
        <div className="mt-4 space-y-2 text-sm text-oficina-texto">
          {contenido.resumen.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      )}

      {contenido.secciones.map((seccion, i) => (
        <Seccion key={`${seccion.titulo}-${i}`} titulo={seccion.titulo}>
          {seccion.bloques.map((b, j) => (
            <BloqueView key={j} bloque={b} registro={registro} />
          ))}
        </Seccion>
      ))}

      {contenido.recomendacionesFinanciamiento.length > 0 && (
        <RecomendacionesFinanciamientoSeccion recomendaciones={contenido.recomendacionesFinanciamiento} />
      )}

      {contenido.brechas.length > 0 && <BrechasSeccion brechas={contenido.brechas} />}

      <FuentesSeccion registro={registro} />
    </article>
  );
}

function visitarBloqueParaFuentes(
  bloque: EntregableGenericoV1["secciones"][number]["bloques"][number],
  registrar: (f: Fuente) => void,
) {
  const visitarAfirmaciones = (afirmaciones: { respaldo: { tipo: string; fuentes?: Fuente[]; fuentesBase?: Fuente[] } }[]) => {
    for (const a of afirmaciones) {
      if (a.respaldo.tipo === "fuente") a.respaldo.fuentes?.forEach(registrar);
      if (a.respaldo.tipo === "estimacion") a.respaldo.fuentesBase?.forEach(registrar);
    }
  };
  if (bloque.tipo === "parrafo" || bloque.tipo === "callout") visitarAfirmaciones(bloque.afirmaciones);
  if (bloque.tipo === "lista") bloque.items.forEach((item) => visitarAfirmaciones(item.afirmaciones));
  if (bloque.tipo === "tabla") bloque.tabla.fuentes.forEach(registrar);
}
