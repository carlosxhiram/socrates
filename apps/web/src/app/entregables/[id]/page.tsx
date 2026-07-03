/**
 * P-3 Visor de Entregable (subtipo A: Reporte de Inteligencia) — versión E1.
 * Muestra el reporte completo desde el JSONB: cabecera, carta, resumen
 * ejecutivo, perfil del cliente, el cuerpo con sus secciones y, junto a cada
 * afirmación con cifras, la cita que la respalda (fuente / estimación /
 * brecha) — C-2 hecho visible en pantalla, nunca una cifra suelta sin
 * respaldo (NFR-1). El editor/aprobar/exportar plenos llegan en E4; aquí se
 * VE el seed aprobado.
 */
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { obtenerEntregable, ErrorApi } from "@/lib/api-client";
import {
  TIPO_ENTREGABLE_ETIQUETA,
  type TipoEntregable,
  type ReporteV1,
  type Respaldo,
  type Afirmacion,
  type Fuente,
  type Bloque,
  type Tabla,
  type SeccionCuerpo,
  type CartaEjecutiva,
  type ResumenEjecutivo,
  type PerfilCliente,
  type Foda,
  type RecomendacionFinanciamiento,
  type Brecha,
  type IndiceCobertura,
} from "@socrates/shared";
import { fechaCorta } from "@/lib/format-esmx";

export const dynamic = "force-dynamic";

type Parametros = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Parametros): Promise<Metadata> {
  const { id } = await params;
  try {
    const ent = await obtenerEntregable(id);
    const tipoEtiqueta = TIPO_ENTREGABLE_ETIQUETA[ent.tipo as TipoEntregable] ?? ent.tipo;
    return { title: `${ent.empresa} / ${tipoEtiqueta}` };
  } catch {
    return { title: "Entregable" };
  }
}

export default async function EntregablePage({ params }: Parametros) {
  const { id } = await params;
  let ent;
  try {
    ent = await obtenerEntregable(id);
  } catch (err) {
    const noEsTuyo = err instanceof ErrorApi && (err.status === 404 || err.status === 403);
    return (
      <main className="mx-auto max-w-[900px] px-6 py-8">
        <Volver />
        <p className="mt-6 text-sm text-oficina-tenue">
          🐢{" "}
          {noEsTuyo
            ? "No encontré ese entregable, o no es tuyo."
            : "No me pude conectar con tu oficina para abrir este entregable. Revisa tu conexión y vuelve a intentarlo."}
        </p>
      </main>
    );
  }

  const reporte = ent.contenido as ReporteV1 | null;
  const registro = reporte ? construirRegistroFuentes(reporte) : null;

  return (
    <main className="mx-auto min-h-screen max-w-[900px] px-6 py-8">
      <Volver expedienteId={ent.expedienteId} />

      <div className="mt-4 flex items-center justify-between gap-3">
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            ent.estado === "APROBADO"
              ? "bg-estado-entrego/10 text-estado-entrego"
              : "bg-estado-alerta/10 text-estado-alerta"
          }`}
        >
          {ent.estado === "APROBADO" ? "Aprobado" : "Borrador — esperando tu revisión"}
        </span>
      </div>

      {reporte && registro ? (
        <article className="mt-4 rounded-xl border border-oficina-borde bg-oficina-panel p-6">
          <header className="border-b border-oficina-borde pb-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-marca">
              {reporte.metadatos.marca}
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-oficina-texto">
              {reporte.metadatos.titulo}
            </h1>
            {reporte.metadatos.subtitulo && (
              <p className="mt-1 text-sm text-oficina-tenue">{reporte.metadatos.subtitulo}</p>
            )}
            <p className="mt-3 text-xs text-oficina-tenue">
              Cliente: {reporte.metadatos.cliente.nombre}
              {reporte.metadatos.cliente.descriptor
                ? ` · ${reporte.metadatos.cliente.descriptor}`
                : ""}{" "}
              · {fechaCorta(reporte.metadatos.fecha)}
            </p>
          </header>

          {reporte.cartaEjecutiva && <CartaEjecutivaSeccion carta={reporte.cartaEjecutiva} />}

          <ResumenEjecutivoSeccion resumen={reporte.resumenEjecutivo} registro={registro} />

          {reporte.perfilCliente && (
            <PerfilClienteSeccion perfil={reporte.perfilCliente} registro={registro} />
          )}

          {reporte.secciones.map((seccion, i) => (
            <SeccionCuerpoView key={seccion.numero ?? `${seccion.titulo}-${i}`} seccion={seccion} registro={registro} />
          ))}

          {reporte.recomendacionesFinanciamiento.length > 0 && (
            <RecomendacionesFinanciamientoSeccion
              recomendaciones={reporte.recomendacionesFinanciamiento}
            />
          )}

          {reporte.brechas.length > 0 && <BrechasSeccion brechas={reporte.brechas} />}

          {reporte.indiceCobertura && <IndiceCoberturaSeccion indice={reporte.indiceCobertura} />}

          <FuentesSeccion registro={registro} />

          <footer className="mt-6 border-t border-oficina-borde pt-4 text-xs text-oficina-tenue">
            {reporte.metadatos.disclaimer}
          </footer>
        </article>
      ) : (
        <p className="mt-4 rounded-xl border border-oficina-borde bg-oficina-panel p-6 text-sm text-oficina-tenue">
          Este entregable todavía no tiene contenido para mostrar.
        </p>
      )}
    </main>
  );
}

function Volver({ expedienteId }: { expedienteId?: string }) {
  const href = expedienteId ? `/expedientes/${expedienteId}` : "/oficina";
  const etiqueta = expedienteId ? "Volver al expediente" : "Volver a La Oficina";
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-oficina-tenue hover:text-marca"
    >
      <ArrowLeft size={15} aria-hidden /> {etiqueta}
    </Link>
  );
}

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="mt-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-oficina-tenue">
        {titulo}
      </h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}

function SubTitulo({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 text-xs font-semibold text-oficina-texto">{children}</p>;
}

// ════════════════════════════════════════════════════════════════════════════
// REGISTRO DE FUENTES — recorre TODO el reporte una vez y numera cada fuente
// citada (C-2). Cada afirmación con cifras enlaza aquí; nada se muestra sin
// poder abrir su respaldo.
// ════════════════════════════════════════════════════════════════════════════

interface FuenteRegistrada {
  n: number;
  fuente: Fuente;
}

interface RegistroFuentes {
  /** Registra (o reutiliza) una fuente y devuelve su número estable. */
  obtener(fuente: Fuente): FuenteRegistrada;
  /** La bibliografía completa, en orden de aparición. */
  lista(): FuenteRegistrada[];
}

function claveFuente(f: Fuente): string {
  return [f.titulo.trim().toLowerCase(), f.url ?? "", f.periodo ?? "", f.documento ?? "", f.editor ?? ""].join(
    "|",
  );
}

function construirRegistroFuentes(reporte: ReporteV1): RegistroFuentes {
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

  function visitarRespaldo(r: Respaldo | undefined) {
    if (!r) return;
    if (r.tipo === "fuente") r.fuentes.forEach(registrar);
    if (r.tipo === "estimacion") r.fuentesBase.forEach(registrar);
  }

  function visitarAfirmaciones(afirmaciones: Afirmacion[] | undefined) {
    afirmaciones?.forEach((a) => visitarRespaldo(a.respaldo));
  }

  function visitarTabla(t: Tabla | undefined) {
    t?.fuentes.forEach(registrar);
  }

  function visitarBloque(b: Bloque) {
    if (b.tipo === "parrafo") visitarAfirmaciones(b.afirmaciones);
    if (b.tipo === "tabla") visitarTabla(b.tabla);
    if (b.tipo === "lista") b.items.forEach((it) => visitarAfirmaciones(it.afirmaciones));
    if (b.tipo === "callout") visitarAfirmaciones(b.afirmaciones);
  }

  function visitarSeccion(s: SeccionCuerpo) {
    s.bloques.forEach(visitarBloque);
    s.subsecciones.forEach((sub) => sub.bloques.forEach(visitarBloque));
  }

  reporte.resumenEjecutivo.hallazgos.forEach((h) => visitarAfirmaciones(h.afirmaciones));
  visitarTabla(reporte.resumenEjecutivo.tablaPerfilFinanciamiento);

  visitarTabla(reporte.perfilCliente?.datosOperativos);
  const foda = reporte.perfilCliente?.foda;
  if (foda) {
    ([...foda.fortalezas, ...foda.oportunidades, ...foda.debilidades, ...foda.amenazas]).forEach(
      (item) => visitarRespaldo(item.respaldo),
    );
  }

  reporte.secciones.forEach(visitarSeccion);

  // Bibliografía consolidada declarada en el reporte: puede traer fuentes
  // generales no ancladas a una afirmación puntual del cuerpo.
  reporte.fuentes.forEach(registrar);

  return {
    obtener: registrar,
    lista: () => Array.from(mapa.values()).sort((a, b) => a.n - b.n),
  };
}

function tituloFuente(f: Fuente): string {
  return f.periodo ? `${f.titulo} — ${f.periodo}` : f.titulo;
}

function esUrlSegura(url: string | undefined): url is string {
  return typeof url === "string" && /^https?:\/\//i.test(url);
}

// ════════════════════════════════════════════════════════════════════════════
// CITAS — la marca discreta junto a cada afirmación (superíndice + enlace a
// Fuentes, o etiqueta de estimación/brecha cuando no hay fuente que abrir).
// ════════════════════════════════════════════════════════════════════════════

function CitaRespaldo({ respaldo, registro }: { respaldo: Respaldo; registro: RegistroFuentes }) {
  if (respaldo.tipo === "fuente") {
    return (
      <sup className="ml-0.5 whitespace-nowrap text-[0.7em] font-semibold leading-none text-marca">
        {respaldo.fuentes.map((f, i) => {
          const { n } = registro.obtener(f);
          return (
            <a
              key={i}
              href={`#fuente-${n}`}
              title={tituloFuente(f)}
              aria-label={`Ver fuente ${n}: ${tituloFuente(f)}`}
              className="rounded-sm px-px hover:underline focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-marca"
            >
              [{n}]
            </a>
          );
        })}
      </sup>
    );
  }
  if (respaldo.tipo === "estimacion") {
    return (
      <sup
        tabIndex={0}
        title={`Estimación: ${respaldo.metodo}`}
        aria-label={`Cifra estimada por el asesor: ${respaldo.metodo}`}
        className="ml-0.5 cursor-help whitespace-nowrap rounded-sm text-[0.7em] font-semibold leading-none text-oficina-tenue focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-marca"
      >
        [estimado]
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

function CitasBloque({
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

function TablaView({ tabla, registro }: { tabla: Tabla; registro: RegistroFuentes }) {
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
              <th
                key={i}
                scope="col"
                className="border-b border-oficina-borde px-3 py-2 font-semibold text-oficina-tenue"
              >
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

function BloqueView({ bloque, registro }: { bloque: Bloque; registro: RegistroFuentes }) {
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
      <Etiqueta
        className={`mt-3 ml-4 space-y-1.5 text-sm text-oficina-texto ${
          bloque.estilo === "pasos" ? "list-decimal" : "list-disc"
        }`}
      >
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
      {bloque.titulo && (
        <p className="text-xs font-semibold uppercase tracking-wide text-oficina-tenue">
          {bloque.titulo}
        </p>
      )}
      <p className={bloque.titulo ? "mt-1" : ""}>
        {bloque.texto}
        <CitasBloque afirmaciones={bloque.afirmaciones} registro={registro} />
      </p>
    </div>
  );
}

function SeccionCuerpoView({ seccion, registro }: { seccion: SeccionCuerpo; registro: RegistroFuentes }) {
  return (
    <Seccion titulo={seccion.numero ? `${seccion.numero}. ${seccion.titulo}` : seccion.titulo}>
      {seccion.bloques.map((b, i) => (
        <BloqueView key={i} bloque={b} registro={registro} />
      ))}
      {seccion.subsecciones.map((sub, i) => (
        <div key={i} className="mt-4">
          <SubTitulo>{sub.numero ? `${sub.numero} ${sub.titulo}` : sub.titulo}</SubTitulo>
          {sub.bloques.map((b, j) => (
            <BloqueView key={j} bloque={b} registro={registro} />
          ))}
        </div>
      ))}
    </Seccion>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// CARTA EJECUTIVA · RESUMEN EJECUTIVO · PERFIL DEL CLIENTE (FODA)
// ════════════════════════════════════════════════════════════════════════════

function CartaEjecutivaSeccion({ carta }: { carta: CartaEjecutiva }) {
  return (
    <Seccion titulo="Carta">
      {carta.lugarFecha && <p className="text-xs text-oficina-tenue">{carta.lugarFecha}</p>}
      <p className="mt-2 text-sm font-medium text-oficina-texto">{carta.saludo}</p>
      <div className="mt-2 space-y-2 text-sm text-oficina-texto">
        {carta.parrafos.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      <p className="mt-3 text-sm text-oficina-texto">
        {carta.despedida}
        <br />
        <span className="font-medium">{carta.firmante.nombre}</span>
        {carta.firmante.cargo && (
          <>
            <br />
            <span className="text-xs text-oficina-tenue">{carta.firmante.cargo}</span>
          </>
        )}
      </p>
    </Seccion>
  );
}

function ResumenEjecutivoSeccion({
  resumen,
  registro,
}: {
  resumen: ResumenEjecutivo;
  registro: RegistroFuentes;
}) {
  return (
    <Seccion titulo="Resumen ejecutivo">
      {resumen.introduccion.length > 0 && (
        <div className="space-y-2 text-sm text-oficina-texto">
          {resumen.introduccion.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      )}

      {resumen.hallazgos.length > 0 && (
        <>
          <SubTitulo>Hallazgos</SubTitulo>
          <ol className="ml-4 list-decimal space-y-1.5 text-sm text-oficina-texto">
            {resumen.hallazgos
              .slice()
              .sort((a, b) => a.orden - b.orden)
              .map((h) => (
                <li key={h.orden}>
                  <span className="font-medium">{h.titulo}</span> — {h.descripcion}
                  <CitasBloque afirmaciones={h.afirmaciones} registro={registro} />
                </li>
              ))}
          </ol>
        </>
      )}

      {resumen.recomendaciones.length > 0 && (
        <>
          <SubTitulo>Recomendaciones</SubTitulo>
          <ol className="ml-4 list-decimal space-y-1.5 text-sm text-oficina-texto">
            {resumen.recomendaciones.map((r) => (
              <li key={r.clave}>
                <span className="font-medium">{r.titulo}</span> — {r.descripcion}
                {r.impactoEsperado && (
                  <span className="block text-xs text-oficina-tenue">
                    Impacto esperado: {r.impactoEsperado}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </>
      )}

      {resumen.tablaPerfilFinanciamiento && (
        <div className="mt-3">
          <SubTitulo>{resumen.tablaPerfilFinanciamiento.titulo ?? "Perfil de financiamiento"}</SubTitulo>
          <TablaView tabla={resumen.tablaPerfilFinanciamiento} registro={registro} />
        </div>
      )}
    </Seccion>
  );
}

const FODA_CONFIG: { clave: keyof Foda; titulo: string }[] = [
  { clave: "fortalezas", titulo: "Fortalezas" },
  { clave: "oportunidades", titulo: "Oportunidades" },
  { clave: "debilidades", titulo: "Debilidades" },
  { clave: "amenazas", titulo: "Amenazas" },
];

function PerfilClienteSeccion({
  perfil,
  registro,
}: {
  perfil: PerfilCliente;
  registro: RegistroFuentes;
}) {
  const foda = perfil.foda;
  const tieneFoda = Boolean(foda) && FODA_CONFIG.some(({ clave }) => (foda?.[clave]?.length ?? 0) > 0);
  const tieneHistoria = perfil.historia.length > 0;
  if (!perfil.datosOperativos && !tieneFoda && !tieneHistoria) return null;

  return (
    <Seccion titulo="Perfil del cliente">
      {tieneHistoria && (
        <ul className="ml-4 list-disc space-y-1 text-sm text-oficina-texto">
          {perfil.historia.map((h, i) => (
            <li key={i}>
              <span className="font-medium">{h.periodo}:</span> {h.descripcion}
            </li>
          ))}
        </ul>
      )}

      {perfil.datosOperativos && <TablaView tabla={perfil.datosOperativos} registro={registro} />}

      {tieneFoda && (
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {FODA_CONFIG.map(({ clave, titulo }) => {
            const items = foda?.[clave] ?? [];
            if (items.length === 0) return null;
            return (
              <div key={clave}>
                <SubTitulo>{titulo}</SubTitulo>
                <ul className="ml-4 list-disc space-y-1 text-sm text-oficina-texto">
                  {items.map((item, i) => (
                    <li key={i}>
                      {item.texto}
                      {item.respaldo && <CitaRespaldo respaldo={item.respaldo} registro={registro} />}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </Seccion>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// RECOMENDACIONES DE FINANCIAMIENTO · BRECHAS · ÍNDICE DE COBERTURA · FUENTES
// ════════════════════════════════════════════════════════════════════════════

function RecomendacionesFinanciamientoSeccion({
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
            {r.beneficioEsperado && (
              <p className="mt-1 text-xs text-estado-entrego">{r.beneficioEsperado}</p>
            )}
          </li>
        ))}
      </ul>
    </Seccion>
  );
}

function BrechasSeccion({ brechas }: { brechas: Brecha[] }) {
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

function IndiceCoberturaSeccion({ indice }: { indice: IndiceCobertura }) {
  return (
    <Seccion titulo="Qué tan respaldado está este reporte">
      <p className="text-sm text-oficina-texto">
        De {indice.totalAfirmaciones} afirmaciones con cifras: {indice.verificadas} con fuente
        verificada, {indice.estimaciones} son estimaciones del asesor y {indice.brechas} quedaron
        marcadas como brecha de información.
      </p>
      <p className="mt-1 text-xs text-oficina-tenue">
        {indice.porcentajeCobertura.toFixed(0)}% de cobertura verificada.
      </p>
    </Seccion>
  );
}

function FuentesSeccion({ registro }: { registro: RegistroFuentes }) {
  const lista = registro.lista();
  if (lista.length === 0) return null;
  return (
    <Seccion titulo="Fuentes">
      <ol className="ml-4 list-decimal space-y-1.5 text-xs text-oficina-tenue">
        {lista.map(({ n, fuente }) => (
          <li key={n} id={`fuente-${n}`} className="scroll-mt-6">
            {esUrlSegura(fuente.url) ? (
              <a
                href={fuente.url}
                target="_blank"
                rel="noreferrer noopener"
                className="font-medium text-marca hover:underline"
              >
                {fuente.titulo}
              </a>
            ) : (
              <span className="font-medium text-oficina-texto">{fuente.titulo}</span>
            )}
            {fuente.editor ? ` — ${fuente.editor}` : ""}
            {fuente.documento ? ` — ${fuente.documento}` : ""}
            {fuente.periodo ? ` (${fuente.periodo})` : ""}
          </li>
        ))}
      </ol>
    </Seccion>
  );
}
