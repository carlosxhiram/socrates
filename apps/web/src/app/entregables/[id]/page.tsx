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
import { requerirAcceso } from "@/lib/portero";
import {
  TIPO_ENTREGABLE_ETIQUETA,
  ReporteV1Schema,
  EntregableGenericoV1Schema,
  type TipoEntregable,
  type ReporteV1,
  type Respaldo,
  type Afirmacion,
  type Tabla,
  type SeccionCuerpo,
  type CartaEjecutiva,
  type ResumenEjecutivo,
  type PerfilCliente,
  type Foda,
  type IndiceCobertura,
} from "@socrates/shared";
import { fechaCorta } from "@/lib/format-esmx";
import { BotonAprobar } from "@/components/entregables/BotonAprobar";
import { EntregableGenericoView } from "@/components/entregables/EntregableGenericoView";
import {
  construirRegistro,
  Seccion,
  SubTitulo,
  CitaRespaldo,
  CitasBloque,
  TablaView,
  BloqueView,
  RecomendacionesFinanciamientoSeccion,
  BrechasSeccion,
  FuentesSeccion,
  type RegistroFuentes,
} from "@/components/entregables/ComponentesReporte";

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
  await requerirAcceso();
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

  // Dos formas de cuerpo posibles (misión de lanzamiento §2.13): el Reporte de
  // Inteligencia (ReporteV1, el Investigador) o el genérico de los otros 5
  // roles (EntregableGenericoV1). Nunca se castea el JSONB a ciegas: se valida
  // contra el esquema Zod real antes de tocarlo — un contenido roto avisa con
  // honestidad, nunca con un 500 (NFR-1/NFR-11).
  let reporte: ReporteV1 | null = null;
  let generico: import("@socrates/shared").EntregableGenericoV1 | null = null;
  let avisoContenido: string | null = null;

  if (ent.contenido == null) {
    avisoContenido = "Este entregable todavía no tiene contenido para mostrar.";
  } else if (ent.tipo === "reporte_inteligencia") {
    const parseado = ReporteV1Schema.safeParse(ent.contenido);
    if (parseado.success) {
      reporte = parseado.data;
    } else {
      avisoContenido = "El contenido de este entregable no se pudo leer completo; el equipo lo va a revisar.";
    }
  } else {
    const parseado = EntregableGenericoV1Schema.safeParse(ent.contenido);
    if (parseado.success) {
      generico = parseado.data;
    } else {
      avisoContenido = "El contenido de este entregable no se pudo leer completo; el equipo lo va a revisar.";
    }
  }

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

          {reporte.indice.length > 0 && <IndiceSeccion indice={reporte.indice} />}

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
      ) : generico ? (
        <EntregableGenericoView contenido={generico} />
      ) : (
        <p className="mt-4 rounded-xl border border-oficina-borde bg-oficina-panel p-6 text-sm text-oficina-tenue">
          {avisoContenido ?? "Este entregable todavía no tiene contenido para mostrar."}
        </p>
      )}

      {ent.estado === "BORRADOR" && (reporte || generico) && (
        <BotonAprobar entregableId={ent.id} expedienteId={ent.expedienteId} version={ent.versionActual} />
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

// ════════════════════════════════════════════════════════════════════════════
// REGISTRO DE FUENTES — recorre TODO el reporte una vez y numera cada fuente
// citada (C-2), vía el constructor compartido con el visor genérico
// (ComponentesReporte.construirRegistro). Cada afirmación con cifras enlaza
// aquí; nada se muestra sin poder abrir su respaldo.
// ════════════════════════════════════════════════════════════════════════════

function construirRegistroFuentes(reporte: ReporteV1): RegistroFuentes {
  return construirRegistro((registrar) => {
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
    function visitarBloque(b: import("@socrates/shared").Bloque) {
      if (b.tipo === "parrafo") visitarAfirmaciones(b.afirmaciones);
      if (b.tipo === "tabla") visitarTabla(b.tabla);
      if (b.tipo === "lista") b.items.forEach((it) => visitarAfirmaciones(it.afirmaciones));
      if (b.tipo === "callout") visitarAfirmaciones(b.afirmaciones);
    }

    reporte.resumenEjecutivo.hallazgos.forEach((h) => visitarAfirmaciones(h.afirmaciones));
    visitarTabla(reporte.resumenEjecutivo.tablaPerfilFinanciamiento);

    visitarTabla(reporte.perfilCliente?.datosOperativos);
    const foda = reporte.perfilCliente?.foda;
    if (foda) {
      [...foda.fortalezas, ...foda.oportunidades, ...foda.debilidades, ...foda.amenazas].forEach((item) =>
        visitarRespaldo(item.respaldo),
      );
    }

    reporte.secciones.forEach((s) => {
      s.bloques.forEach(visitarBloque);
      s.subsecciones.forEach((sub) => sub.bloques.forEach(visitarBloque));
    });
  }, reporte.fuentes);
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

/** Navegación del reporte ("Contenido del Reporte", I–XI de Probemedic). El
 * índice no siempre corresponde 1:1 con las secciones del cuerpo (el Resumen
 * Ejecutivo, las Brechas y las Fuentes son campos propios, no `secciones`),
 * así que se muestra como lista simple — sin inventar anclas que no existen. */
function IndiceSeccion({ indice }: { indice: string[] }) {
  return (
    <Seccion titulo="Contenido del Reporte">
      <ul className="ml-4 list-disc space-y-1 text-sm text-oficina-texto">
        {indice.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </Seccion>
  );
}

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
// ÍNDICE DE COBERTURA — exclusivo del Reporte de Inteligencia (ReporteV1); las
// Recomendaciones/Brechas/Fuentes las pintan los componentes compartidos de
// ComponentesReporte.tsx (RecomendacionesFinanciamientoSeccion, BrechasSeccion,
// FuentesSeccion), reusados también por el visor genérico.
// ════════════════════════════════════════════════════════════════════════════

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
