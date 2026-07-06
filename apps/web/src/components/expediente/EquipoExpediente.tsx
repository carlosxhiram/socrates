"use client";
/**
 * EquipoExpediente — las 6 tarjetas del equipo SIEMPRE visibles en el
 * expediente (misión de lanzamiento §2.11): "Encargar" cuando el rol está
 * libre, progreso en vivo mientras trabaja, motivo + "Reintentar" si quedó
 * bloqueado. Voz de oficina en todo momento (NFR-14): nunca "ejecutar/IA/agente".
 */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  FileSearch,
  Landmark,
  Handshake,
  FileCheck,
  Briefcase,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { ROLES_PANEL, EMPLEADOS, type RolEmpleado, type TareaDTO } from "@socrates/shared";
import { encargarTarea } from "@/lib/acciones";
import { usarPollingExpediente } from "@/lib/usar-polling";

const ICONOS: Record<string, LucideIcon> = {
  search: Search,
  "file-search": FileSearch,
  landmark: Landmark,
  handshake: Handshake,
  "file-check": FileCheck,
  briefcase: Briefcase,
};

const ESTADOS_ACTIVOS: TareaDTO["estado"][] = ["ENCARGADA", "EN_CURSO"];

/** La Tarea más relevante para este rol: la activa si hay una; si no, la más reciente. */
function tareaDelRol(tareas: TareaDTO[], rol: RolEmpleado): TareaDTO | null {
  const delRol = tareas.filter((t) => t.empleadoRol === rol);
  if (delRol.length === 0) return null;
  const activa = delRol.find((t) => ESTADOS_ACTIVOS.includes(t.estado));
  if (activa) return activa;
  return [...delRol].sort((a, b) => b.creadoEn.localeCompare(a.creadoEn))[0] ?? null;
}

export function EquipoExpediente({ expedienteId, tareas }: { expedienteId: string; tareas: TareaDTO[] }) {
  const hayTareasActivas = tareas.some((t) => ESTADOS_ACTIVOS.includes(t.estado));
  const huellaEstado = tareas.map((t) => `${t.id}:${t.estado}:${t.progresoPct ?? ""}`).join("|");
  usarPollingExpediente({ hayTareasActivas, huellaEstado });

  return (
    <section aria-label="Equipo en este expediente" className="space-y-2">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-oficina-tenue">
        Equipo en este expediente
      </h2>
      <div className="space-y-2">
        {ROLES_PANEL.map((rol) => (
          <TarjetaEmpleado key={rol} expedienteId={expedienteId} rol={rol} tarea={tareaDelRol(tareas, rol)} />
        ))}
      </div>
    </section>
  );
}

function TarjetaEmpleado({
  expedienteId,
  rol,
  tarea,
}: {
  expedienteId: string;
  rol: RolEmpleado;
  tarea: TareaDTO | null;
}) {
  const perfil = EMPLEADOS[rol];
  const Icono = ICONOS[perfil.icono] ?? Briefcase;
  const [abierto, setAbierto] = useState(false);
  const [descripcion, setDescripcion] = useState(perfil.descripcion);
  const [mensaje, setMensaje] = useState("");
  const [pendiente, iniciarTransicion] = useTransition();
  const router = useRouter();

  function encargar() {
    setMensaje("");
    iniciarTransicion(async () => {
      const res = await encargarTarea(expedienteId, rol, descripcion);
      if (!res.exito) {
        setMensaje(res.mensaje);
        return;
      }
      setAbierto(false);
      router.refresh();
    });
  }

  return (
    <div className="rounded-lg border border-oficina-borde bg-oficina-panel p-3">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-marca/10 text-marca">
          <Icono size={18} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-semibold text-oficina-texto">{perfil.nombre}</p>
            <EstadoTarjeta tarea={tarea} />
          </div>
          <p className="mt-0.5 text-xs text-oficina-tenue">
            {tarea && (tarea.estado === "ENCARGADA" || tarea.estado === "EN_CURSO")
              ? tarea.progresoNota || perfil.descripcion
              : tarea?.estado === "BLOQUEADA"
                ? (tarea.motivo ?? "No se pudo completar este encargo.")
                : perfil.descripcion}
          </p>

          {tarea && (tarea.estado === "ENCARGADA" || tarea.estado === "EN_CURSO") && (
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-oficina-fondo">
              <div
                className="h-full rounded-full bg-marca transition-all duration-500"
                style={{ width: `${Math.max(5, tarea.progresoPct ?? 5)}%` }}
              />
            </div>
          )}

          {!tarea && !abierto && (
            <button
              type="button"
              onClick={() => setAbierto(true)}
              className="mt-2 rounded-md border border-marca px-2.5 py-1 text-xs font-medium text-marca hover:bg-marca/5"
            >
              Encargar
            </button>
          )}

          {tarea?.estado === "BLOQUEADA" && !abierto && (
            <button
              type="button"
              onClick={() => setAbierto(true)}
              className="mt-2 rounded-md border border-oficina-borde px-2.5 py-1 text-xs font-medium text-oficina-tenue hover:text-oficina-texto"
            >
              Reintentar
            </button>
          )}

          {abierto && (
            <div className="mt-2 rounded-lg border border-oficina-borde bg-oficina-fondo p-3">
              <label htmlFor={`descripcion-${rol}`} className="block text-xs font-medium text-oficina-tenue">
                ¿Qué le encargas a {perfil.nombre}?
              </label>
              <textarea
                id={`descripcion-${rol}`}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={2}
                autoFocus
                className="mt-1 w-full resize-none rounded-lg border border-oficina-borde bg-oficina-panel px-3 py-1.5 text-sm text-oficina-texto focus:border-marca focus:outline-none"
              />
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  disabled={pendiente}
                  onClick={encargar}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-marca px-3 py-1.5 text-xs font-medium text-white hover:bg-marca/90 disabled:opacity-60"
                >
                  {pendiente && <Loader2 size={13} className="animate-spin" aria-hidden />}
                  {pendiente ? "Encargando…" : "Confirmar encargo"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAbierto(false);
                    setMensaje("");
                  }}
                  className="rounded-lg border border-oficina-borde px-3 py-1.5 text-xs font-medium text-oficina-tenue hover:text-oficina-texto"
                >
                  Cancelar
                </button>
              </div>
              {mensaje && (
                <p role="alert" className="mt-2 rounded-lg bg-estado-alerta/10 px-3 py-2 text-xs text-estado-alerta">
                  {mensaje}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EstadoTarjeta({ tarea }: { tarea: TareaDTO | null }) {
  if (!tarea) {
    return <span className="shrink-0 rounded-full bg-oficina-borde px-2 py-0.5 text-[11px] font-medium text-oficina-tenue">Libre</span>;
  }
  if (tarea.estado === "ENTREGADA") {
    return (
      <span className="shrink-0 rounded-full bg-estado-entrego/10 px-2 py-0.5 text-[11px] font-medium text-estado-entrego">
        Entregó
      </span>
    );
  }
  if (tarea.estado === "BLOQUEADA") {
    return (
      <span className="shrink-0 rounded-full bg-estado-alerta/10 px-2 py-0.5 text-[11px] font-medium text-estado-alerta">
        No se pudo completar
      </span>
    );
  }
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-marca/10 px-2 py-0.5 text-[11px] font-medium text-marca">
      <Loader2 size={10} className="animate-spin" aria-hidden />
      Trabajando
    </span>
  );
}
