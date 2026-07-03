/** Tarjeta de Expediente (UX C-2). Unidad de navegación primaria del Asesor. */
import Link from "next/link";
import { AlertTriangle, CircleAlert } from "lucide-react";
import type { ExpedienteResumenDTO } from "@socrates/shared";
import { EMPLEADOS, etiquetaEtapaActual } from "@socrates/shared";
import { BarraProgreso } from "./BarraProgreso";

export function TarjetaExpediente({ expediente }: { expediente: ExpedienteResumenDTO }) {
  const cerrado = expediente.etapa === "GANADO" || expediente.etapa === "PERDIDO";
  return (
    <Link
      href={`/expedientes/${expediente.id}`}
      className={`block rounded-xl border bg-oficina-panel p-4 transition-shadow hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-marca/40 ${
        cerrado ? "border-oficina-borde opacity-75" : "border-oficina-borde"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold uppercase tracking-tight text-oficina-texto">
          {expediente.empresa}
        </h3>
        <span className="shrink-0 rounded-full bg-oficina-fondo px-2.5 py-0.5 text-xs font-medium text-oficina-tenue">
          {etiquetaEtapaActual(expediente.etapa)}
        </span>
      </div>
      <p className="mt-0.5 text-sm text-oficina-tenue">
        {expediente.industria} · {expediente.ciudad}
      </p>

      <div className="mt-3">
        <BarraProgreso progreso={expediente.progreso} bloqueado={expediente.tieneBloqueo} />
      </div>

      {expediente.empleadosActivos.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {expediente.empleadosActivos.map((rol) => (
            <span
              key={rol}
              className="rounded-md bg-marca/10 px-2 py-0.5 text-[11px] font-medium text-marca"
            >
              {EMPLEADOS[rol]?.nombre ?? rol}
            </span>
          ))}
        </div>
      )}

      {expediente.tieneBloqueo ? (
        <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-estado-bloqueo">
          <CircleAlert size={14} aria-hidden /> Hay una tarea bloqueada
        </p>
      ) : expediente.entregablesEsperandoRevision > 0 ? (
        <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-estado-alerta">
          <AlertTriangle size={14} aria-hidden />
          {expediente.entregablesEsperandoRevision === 1
            ? "1 entregable esperando tu revisión"
            : `${expediente.entregablesEsperandoRevision} entregables esperando tu revisión`}
        </p>
      ) : null}
    </Link>
  );
}
