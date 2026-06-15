/**
 * P-3 Visor de Entregable (subtipo A: Reporte de Inteligencia) — versión E1.
 * Muestra la cabecera del reporte y un resumen de sus secciones desde el JSONB.
 * El editor/aprobar/exportar plenos llegan en E4; aquí se VE el seed aprobado.
 */
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { obtenerEntregable } from "@/lib/api-client";
import type { ReporteV1 } from "@socrates/shared";
import { fechaCorta } from "@/lib/format-esmx";

export const dynamic = "force-dynamic";

export default async function EntregablePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let ent;
  try {
    ent = await obtenerEntregable(id);
  } catch {
    return (
      <main className="mx-auto max-w-[900px] px-6 py-8">
        <Volver />
        <p className="mt-6 text-sm text-oficina-tenue">
          🐢 No pude abrir ese entregable.
        </p>
      </main>
    );
  }

  const reporte = ent.contenido as ReporteV1 | null;

  return (
    <main className="mx-auto min-h-screen max-w-[900px] px-6 py-8">
      <Volver />

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

      {reporte ? (
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

          {reporte.resumenEjecutivo && (
            <Seccion titulo="Resumen ejecutivo">
              {reporte.resumenEjecutivo.hallazgos?.length ? (
                <>
                  <SubTitulo>Hallazgos</SubTitulo>
                  <ol className="ml-4 list-decimal space-y-1 text-sm text-oficina-texto">
                    {reporte.resumenEjecutivo.hallazgos.map((h, i) => (
                      <li key={i}>
                        <span className="font-medium">{h.titulo}</span> — {h.descripcion}
                      </li>
                    ))}
                  </ol>
                </>
              ) : null}
              {reporte.resumenEjecutivo.recomendaciones?.length ? (
                <>
                  <SubTitulo>Recomendaciones</SubTitulo>
                  <ol className="ml-4 list-decimal space-y-1 text-sm text-oficina-texto">
                    {reporte.resumenEjecutivo.recomendaciones.map((r, i) => (
                      <li key={i}>
                        <span className="font-medium">{r.titulo}</span> — {r.descripcion}
                      </li>
                    ))}
                  </ol>
                </>
              ) : null}
            </Seccion>
          )}

          {reporte.recomendacionesFinanciamiento?.length ? (
            <Seccion titulo="Soluciones de financiamiento recomendadas">
              <ul className="space-y-2 text-sm text-oficina-texto">
                {reporte.recomendacionesFinanciamiento.map((r, i) => (
                  <li key={i} className="rounded-lg bg-oficina-fondo p-3">
                    <p className="font-medium">{r.productoNombre}</p>
                    <p className="text-xs text-oficina-tenue">{r.institucionNombre}</p>
                  </li>
                ))}
              </ul>
            </Seccion>
          ) : null}

          {reporte.brechas?.length ? (
            <Seccion titulo="Brechas de información">
              <ul className="ml-4 list-disc space-y-1 text-sm text-oficina-tenue">
                {reporte.brechas.map((b, i) => (
                  <li key={i}>
                    <span className="font-medium text-oficina-texto">{b.tema}:</span>{" "}
                    {b.descripcion}
                  </li>
                ))}
              </ul>
            </Seccion>
          ) : null}

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

function Volver() {
  return (
    <Link
      href="/oficina"
      className="inline-flex items-center gap-1.5 text-sm font-medium text-oficina-tenue hover:text-marca"
    >
      <ArrowLeft size={15} aria-hidden /> Volver a La Oficina
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
