/**
 * P-2 Detalle de Expediente (FR-6). Cabecera + equipo en este expediente +
 * bandeja de entregables. Lista los entregables y enlaza al visor.
 */
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { obtenerExpediente } from "@/lib/api-client";
import {
  EMPLEADOS,
  etiquetaEtapaActual,
  ESTADO_TAREA_ETIQUETA,
  TIPO_ENTREGABLE_ETIQUETA,
  type RolEmpleado,
  type TipoEntregable,
  type EstadoTarea,
} from "@socrates/shared";
import { BarraProgreso } from "@/components/oficina/BarraProgreso";
import { BarraComando } from "@/components/socrates/BarraComando";
import { AccionesEtapa } from "@/components/expediente/AccionesEtapa";
import { DatosProspecto } from "@/components/expediente/DatosProspecto";
import { fechaCorta } from "@/lib/format-esmx";

export const dynamic = "force-dynamic";

export default async function ExpedientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let exp;
  try {
    exp = await obtenerExpediente(id);
  } catch {
    return (
      <main className="mx-auto max-w-[1100px] px-6 py-8">
        <Volver />
        <p className="mt-6 text-sm text-oficina-tenue">
          🐢 No pude abrir ese expediente. Quizá no existe o no es tuyo.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-[1100px] px-6 py-8">
      <Volver />

      {/* Cabecera */}
      <header className="mt-4 rounded-xl border border-oficina-borde bg-oficina-panel p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold uppercase tracking-tight text-oficina-texto">
              {exp.empresa}
            </h1>
            <p className="mt-0.5 text-sm text-oficina-tenue">
              {exp.industria} · {exp.ciudad}
            </p>
          </div>
          <span className="rounded-full bg-oficina-fondo px-3 py-1 text-xs font-medium text-oficina-tenue">
            {etiquetaEtapaActual(exp.etapa)}
          </span>
        </div>
        <div className="mt-4">
          <BarraProgreso progreso={exp.progreso} bloqueado={exp.tieneBloqueo} />
        </div>
        {exp.notas && <p className="mt-3 text-sm text-oficina-texto">{exp.notas}</p>}
        {exp.motivoCierre && (
          <p className="mt-2 text-xs text-oficina-tenue">Motivo del cierre: {exp.motivoCierre}</p>
        )}
        <div className="mt-4">
          <AccionesEtapa expedienteId={exp.id} etapa={exp.etapa} />
        </div>
      </header>

      <div className="mt-6">
        <DatosProspecto
          expedienteId={exp.id}
          datos={{
            empresa: exp.empresa,
            ciudad: exp.ciudad,
            industria: exp.industria,
            sitioWeb: exp.sitioWeb ?? null,
            rfc: exp.rfc ?? null,
            sucursales: exp.sucursales ?? null,
            notas: exp.notas ?? null,
          }}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        {/* Entregables (bandeja, UX C-4) */}
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-oficina-tenue">
            Entregables
          </h2>
          {exp.entregables.length === 0 ? (
            <p className="rounded-lg border border-dashed border-oficina-borde bg-oficina-panel p-5 text-sm text-oficina-tenue">
              Todavía no hay entregables en este expediente.
            </p>
          ) : (
            <ul className="space-y-2">
              {exp.entregables.map((d) => (
                <li
                  key={d.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-oficina-borde bg-oficina-panel p-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-oficina-texto">
                      {TIPO_ENTREGABLE_ETIQUETA[d.tipo as TipoEntregable] ?? d.tipo}
                    </p>
                    <p className="mt-0.5 text-xs text-oficina-tenue">
                      {d.empleadoRol
                        ? EMPLEADOS[d.empleadoRol as RolEmpleado]?.nombre
                        : "Equipo"}{" "}
                      · {fechaCorta(d.creadoEn)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <EstadoEntregableBadge estado={d.estado} />
                    <Link
                      href={`/entregables/${d.id}`}
                      className="rounded-md border border-oficina-borde px-2.5 py-1 text-xs font-medium text-marca hover:bg-marca/5"
                    >
                      Revisar →
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Equipo en este expediente */}
        <aside>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-oficina-tenue">
            Equipo en este expediente
          </h2>
          {exp.tareas.length === 0 ? (
            <p className="rounded-lg border border-dashed border-oficina-borde bg-oficina-panel p-5 text-sm text-oficina-tenue">
              Aún no le has encargado nada al equipo aquí.
            </p>
          ) : (
            <ul className="space-y-2">
              {exp.tareas.map((t) => (
                <li
                  key={t.id}
                  className="rounded-lg border border-oficina-borde bg-oficina-panel p-3"
                >
                  <p className="text-sm font-medium text-oficina-texto">
                    {EMPLEADOS[t.empleadoRol as RolEmpleado]?.nombre ?? t.empleadoRol}
                  </p>
                  <p className="mt-0.5 text-xs text-oficina-tenue">{t.descripcion}</p>
                  <p className="mt-1 text-[11px] font-medium text-oficina-tenue">
                    {ESTADO_TAREA_ETIQUETA[t.estado as EstadoTarea] ?? t.estado}
                    {t.motivo ? ` — ${t.motivo}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>

      <div className="mt-8">
        <BarraComando contexto="expediente" />
      </div>
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

function EstadoEntregableBadge({ estado }: { estado: string }) {
  const aprobado = estado === "APROBADO";
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
        aprobado
          ? "bg-estado-entrego/10 text-estado-entrego"
          : "bg-estado-alerta/10 text-estado-alerta"
      }`}
    >
      {aprobado ? "Aprobado" : "Borrador"}
    </span>
  );
}
