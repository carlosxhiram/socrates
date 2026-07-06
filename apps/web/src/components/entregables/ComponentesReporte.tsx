/**
 * ComponentesReporte.tsx — las piezas visuales COMPARTIDAS entre el visor de
 * ReporteV1 (app/entregables/[id]/page.tsx) y el visor genérico
 * (EntregableGenericoView.tsx): ambos tipos reusan DELIBERADAMENTE los mismos
 * esquemas de Bloque/Tabla/Fuente/Respaldo/Recomendacion (ver
 * packages/shared/src/entregables/EntregableGenericoV1.ts), así que la misma
 * pintura visual les sirve a los dos sin duplicar código (C-2 hecho visible
 * en pantalla en ambos: cifra con cita, o marcada honesta como estimación /
 * sin verificar — nunca una cifra suelta, NFR-1).
 */
import type {
  Respaldo,
  Afirmacion,
  Fuente,
  Bloque,
  Tabla,
  RecomendacionFinanciamiento,
  Brecha,
} from "@socrates/shared";

// ════════════════════════════════════════════════════════════════════════════
// REGISTRO DE FUENTES — interfaz compartida; cada visor arma la suya.
// ════════════════════════════════════════════════════════════════════════════

export interface FuenteRegistrada {
  n: number;
  fuente: Fuente;
}

export interface RegistroFuentes {
  obtener(fuente: Fuente): FuenteRegistrada;
  citadas(): FuenteRegistrada[];
  bibliografiaAdicional(): Fuente[];
}

/** Clave de deduplicación: la URL si existe; si no, el título normalizado. */
export function claveFuente(f: Fuente): string {
  if (f.url) return f.url.trim().toLowerCase();
  return f.titulo.trim().toLowerCase().replace(/\s+/g, " ");
}

export function tituloFuente(f: Fuente): string {
  return f.periodo ? `${f.titulo} — ${f.periodo}` : f.titulo;
}

export function esUrlSegura(url: string | undefined): url is string {
  return typeof url === "string" && /^https?:\/\//i.test(url);
}

/** Constructor genérico de RegistroFuentes: dado un visitador que recorra el
 * documento llamando `registrar` por cada Fuente citada, arma el registro
 * numerado + la bibliografía adicional (lo de `fuentesTop` que nadie citó). */
export function construirRegistro(
  visitar: (registrar: (f: Fuente) => void) => void,
  fuentesTop: Fuente[],
): RegistroFuentes {
  const mapa = new Map<string, FuenteRegistrada>();
  let siguiente = 1;

  function registrar(f: Fuente): FuenteRegistrada {
    const clave = claveFuente(f);
    const existente = mapa.get(clave);
    if (existente) return existente;
    const nueva: FuenteRegistrada = { n: siguiente++, fuente: f };
    mapa.set(clave, nueva);
    return nueva;
  }

  visitar((f) => {
    registrar(f);
  });

  const bibliografiaAdicional: Fuente[] = [];
  const vistas = new Set<string>();
  for (const f of fuentesTop) {
    const clave = claveFuente(f);
    if (mapa.has(clave) || vistas.has(clave)) continue;
    vistas.add(clave);
    bibliografiaAdicional.push(f);
  }

  return {
    obtener: registrar,
    citadas: () => Array.from(mapa.values()).sort((a, b) => a.n - b.n),
    bibliografiaAdicional: () => bibliografiaAdicional,
  };
}

// ════════════════════════════════════════════════════════════════════════════
// ARMAZÓN VISUAL (secciones/subtítulos)
// ════════════════════════════════════════════════════════════════════════════

export function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="mt-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-oficina-tenue">{titulo}</h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}

export function SubTitulo({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 text-xs font-semibold text-oficina-texto">{children}</p>;
}

// ════════════════════════════════════════════════════════════════════════════
// CITAS — la marca discreta junto a cada afirmación.
// ════════════════════════════════════════════════════════════════════════════

export function EnlaceFuente({ fuente, registro }: { fuente: Fuente; registro: RegistroFuentes }) {
  const { n } = registro.obtener(fuente);
  return (
    <a
      href={`#fuente-${n}`}
      title={tituloFuente(fuente)}
      aria-label={`Ver fuente ${n}: ${tituloFuente(fuente)}`}
      className="rounded-sm px-px text-marca hover:underline focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-marca"
    >
      [{n}]
    </a>
  );
}

export function CitaRespaldo({ respaldo, registro }: { respaldo: Respaldo; registro: RegistroFuentes }) {
  if (respaldo.tipo === "fuente") {
    return (
      <sup className="ml-0.5 whitespace-nowrap text-[0.7em] font-semibold leading-none">
        {respaldo.fuentes.map((f, i) => (
          <EnlaceFuente key={i} fuente={f} registro={registro} />
        ))}
      </sup>
    );
  }
  if (respaldo.tipo === "estimacion") {
    return (
      <sup className="ml-0.5 whitespace-nowrap text-[0.7em] font-semibold leading-none">
        <span
          tabIndex={0}
          title={`Estimación: ${respaldo.metodo}`}
          aria-label={`Cifra estimada por el asesor: ${respaldo.metodo}`}
          className="cursor-help rounded-sm text-oficina-tenue focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-marca"
        >
          [estimado]
        </span>
        {respaldo.fuentesBase.map((f, i) => (
          <EnlaceFuente key={i} fuente={f} registro={registro} />
        ))}
      </sup>
    );
  }
  return (
    <sup
      tabIndex={0}
      title={`Brecha de información: ${respaldo.motivo}`}
      aria-label={`Sin verificar — brecha de información: ${respaldo.motivo}`}
      className="ml-0.5 cursor-help whitespace-nowrap rounded-sm text-[0.7em] font-semibold leading-none text-estado-alerta focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-marca"
    >
      [sin verificar]
    </sup>
  );
}

export function CitasBloque({
  afirmaciones,
  registro,
}: {
  afirmaciones: Afirmacion[] | undefined;
  registro: RegistroFuentes;
}) {
  if (!afirmaciones || afirmaciones.length === 0) return null;
  return (
    <>
      {afirmaciones.map((a, i) => (
        <CitaRespaldo key={i} respaldo={a.respaldo} registro={registro} />
      ))}
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// BLOQUES DE CUERPO (párrafo / tabla / lista / callout)
// ════════════════════════════════════════════════════════════════════════════

export function TablaView({ tabla, registro }: { tabla: Tabla; registro: RegistroFuentes }) {
  return (
    <div className="mt-3 overflow-x-auto rounded-lg border border-oficina-borde">
      {tabla.titulo && (
        <p className="border-b border-oficina-borde bg-oficina-fondo px-3 py-2 text-xs font-semibold text-oficina-texto">
          {tabla.titulo}
        </p>
      )}
      <table className="w-full min-w-[480px] border-collapse text-left text-xs">
        <thead>
          <tr className="bg-oficina-fondo">
            {tabla.columnas.map((c, i) => (
              <th key={i} scope="col" className="border-b border-oficina-borde px-3 py-2 font-semibold text-oficina-tenue">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tabla.filas.map((fila, i) => (
            <tr key={i} className="border-b border-oficina-borde last:border-b-0">
              {fila.map((celda, j) => (
                <td key={j} className="px-3 py-2 align-top text-oficina-texto">
                  {celda}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {(tabla.nota || tabla.fuentes.length > 0) && (
        <p className="border-t border-oficina-borde px-3 py-2 text-[11px] text-oficina-tenue">
          {tabla.nota}
          {tabla.nota && tabla.fuentes.length > 0 ? " " : ""}
          {tabla.fuentes.length > 0 && (
            <>
              Fuentes:{" "}
              {tabla.fuentes.map((f, i) => {
                const { n } = registro.obtener(f);
                return (
                  <span key={i}>
                    <a
                      href={`#fuente-${n}`}
                      title={tituloFuente(f)}
                      aria-label={`Ver fuente ${n}: ${tituloFuente(f)}`}
                      className="text-marca hover:underline"
                    >
                      {f.titulo}
                    </a>
                    {i < tabla.fuentes.length - 1 ? "; " : ""}
                  </span>
                );
              })}
            </>
          )}
        </p>
      )}
    </div>
  );
}

export function BloqueView({ bloque, registro }: { bloque: Bloque; registro: RegistroFuentes }) {
  if (bloque.tipo === "parrafo") {
    return (
      <p className="mt-3 text-sm text-oficina-texto first:mt-0">
        {bloque.texto}
        <CitasBloque afirmaciones={bloque.afirmaciones} registro={registro} />
      </p>
    );
  }
  if (bloque.tipo === "tabla") {
    return <TablaView tabla={bloque.tabla} registro={registro} />;
  }
  if (bloque.tipo === "lista") {
    const Etiqueta = bloque.estilo === "pasos" ? "ol" : "ul";
    return (
      <Etiqueta className={`mt-3 ml-4 space-y-1.5 text-sm text-oficina-texto ${bloque.estilo === "pasos" ? "list-decimal" : "list-disc"}`}>
        {bloque.items.map((item, i) => (
          <li key={i}>
            {item.texto}
            <CitasBloque afirmaciones={item.afirmaciones} registro={registro} />
          </li>
        ))}
      </Etiqueta>
    );
  }
  // callout
  const clase =
    bloque.variante === "advertencia"
      ? "border-estado-alerta/30 bg-estado-alerta/5"
      : bloque.variante === "implicacion"
        ? "border-marca/20 bg-marca/5"
        : bloque.variante === "recomendacion"
          ? "border-estado-entrego/20 bg-estado-entrego/5"
          : "border-oficina-borde bg-oficina-fondo";
  return (
    <div className={`mt-3 rounded-lg border px-4 py-3 text-sm text-oficina-texto ${clase}`}>
      {bloque.titulo && <p className="text-xs font-semibold uppercase tracking-wide text-oficina-tenue">{bloque.titulo}</p>}
      <p className={bloque.titulo ? "mt-1" : ""}>
        {bloque.texto}
        <CitasBloque afirmaciones={bloque.afirmaciones} registro={registro} />
      </p>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// RECOMENDACIONES DE FINANCIAMIENTO · BRECHAS · FUENTES (compartidas)
// ════════════════════════════════════════════════════════════════════════════

export function RecomendacionesFinanciamientoSeccion({
  recomendaciones,
}: {
  recomendaciones: RecomendacionFinanciamiento[];
}) {
  return (
    <Seccion titulo="Soluciones de financiamiento recomendadas">
      <ul className="space-y-2 text-sm text-oficina-texto">
        {recomendaciones.map((r, i) => (
          <li key={i} className="rounded-lg bg-oficina-fondo p-3">
            <p className="font-medium">{r.productoNombre}</p>
            <p className="text-xs text-oficina-tenue">
              {r.institucionNombre}
              {r.montoPlazo ? ` · ${r.montoPlazo}` : ""}
            </p>
            <p className="mt-1.5 text-xs text-oficina-texto">{r.usoEspecifico}</p>
            {r.beneficioEsperado && <p className="mt-1 text-xs text-estado-entrego">{r.beneficioEsperado}</p>}
          </li>
        ))}
      </ul>
    </Seccion>
  );
}

export function BrechasSeccion({ brechas }: { brechas: Brecha[] }) {
  return (
    <Seccion titulo="Brechas de información">
      <ul className="ml-4 list-disc space-y-1 text-sm text-oficina-tenue">
        {brechas.map((b, i) => (
          <li key={i}>
            <span className="font-medium text-oficina-texto">{b.tema}:</span> {b.descripcion}
          </li>
        ))}
      </ul>
    </Seccion>
  );
}

export function FuenteLinea({ fuente }: { fuente: Fuente }) {
  return (
    <>
      {esUrlSegura(fuente.url) ? (
        <a href={fuente.url} target="_blank" rel="noreferrer noopener" className="font-medium text-marca hover:underline">
          {fuente.titulo}
        </a>
      ) : (
        <span className="font-medium text-oficina-texto">{fuente.titulo}</span>
      )}
      {fuente.editor ? ` — ${fuente.editor}` : ""}
      {fuente.documento ? ` — ${fuente.documento}` : ""}
      {fuente.periodo ? ` (${fuente.periodo})` : ""}
    </>
  );
}

export function FuentesSeccion({ registro }: { registro: RegistroFuentes }) {
  const citadas = registro.citadas();
  const adicionales = registro.bibliografiaAdicional();
  if (citadas.length === 0 && adicionales.length === 0) return null;
  return (
    <Seccion titulo="Fuentes">
      {citadas.length > 0 && (
        <ol className="ml-4 list-decimal space-y-1.5 text-xs text-oficina-tenue">
          {citadas.map(({ n, fuente }) => (
            <li key={n} id={`fuente-${n}`} className="scroll-mt-6">
              <FuenteLinea fuente={fuente} />
            </li>
          ))}
        </ol>
      )}
      {adicionales.length > 0 && (
        <>
          <SubTitulo>Bibliografía adicional</SubTitulo>
          <p className="text-[11px] text-oficina-tenue">
            Consultadas para el reporte pero no ancladas a una afirmación puntual del cuerpo.
          </p>
          <ul className="ml-4 list-disc space-y-1.5 text-xs text-oficina-tenue">
            {adicionales.map((fuente, i) => (
              <li key={i}>
                <FuenteLinea fuente={fuente} />
              </li>
            ))}
          </ul>
        </>
      )}
    </Seccion>
  );
}
