/**
 * PanelEquipo — el panel "Tu equipo" (UX C-1, P-4).
 * Estado de cara al Asesor: Libre / Trabajando / Entregó. Jamás "Procesando".
 */
import {
  Search,
  FileSearch,
  Landmark,
  Handshake,
  FileCheck,
  Briefcase,
  type LucideIcon,
} from "lucide-react";
import type { EmpleadoEstadoDTO, RolEmpleado } from "@socrates/shared";
import { EditorNombreEmpleado } from "./EditorNombreEmpleado";

const ICONOS: Record<string, LucideIcon> = {
  search: Search,
  "file-search": FileSearch,
  landmark: Landmark,
  handshake: Handshake,
  "file-check": FileCheck,
  briefcase: Briefcase,
};

const BADGE: Record<EmpleadoEstadoDTO["estado"], { texto: string; clase: string }> = {
  LIBRE: { texto: "Libre", clase: "bg-oficina-borde text-oficina-tenue" },
  TRABAJANDO: { texto: "Trabajando", clase: "bg-marca/10 text-marca" },
  ENTREGO: { texto: "Entregó", clase: "bg-estado-entrego/10 text-estado-entrego" },
};

export function PanelEquipo({ equipo }: { equipo: EmpleadoEstadoDTO[] }) {
  return (
    <section aria-label="Tu equipo" className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-oficina-tenue">
        Tu equipo
      </h2>
      <div className="space-y-2">
        {equipo.map((emp) => {
          const Icono = ICONOS[emp.icono] ?? Briefcase;
          const badge = BADGE[emp.estado];
          return (
            <div
              key={emp.rol}
              className="rounded-lg border border-oficina-borde bg-oficina-panel p-3"
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-marca/10 text-marca">
                  <Icono size={18} aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <span className="min-w-0">
                      <EditorNombreEmpleado rol={emp.rol as RolEmpleado} nombre={emp.nombre} />
                    </span>
                    <span
                      className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${badge.clase}`}
                    >
                      {badge.texto}
                    </span>
                  </div>
                  {emp.expedienteActual ? (
                    <p className="mt-0.5 truncate text-xs text-oficina-tenue">
                      Expediente: {emp.expedienteActual.empresa}
                    </p>
                  ) : (
                    <p className="mt-0.5 truncate text-xs text-oficina-tenue">{emp.cargo}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
