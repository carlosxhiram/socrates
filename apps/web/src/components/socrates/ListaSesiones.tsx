"use client";

/**
 * ListaSesiones — explorador de conversaciones con Sócrates.
 * Dos vistas alternables: TARJETAS o LISTA. Cada ítem muestra el título de la
 * sesión y un resumen (vista previa del último mensaje); al hacer clic lleva a
 * /sesiones/[id], la pantalla propia de esa conversación. "Nueva conversación"
 * crea una y entra directo.
 */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, MessageSquare, LayoutGrid, List } from "lucide-react";
import { crearSesion } from "@/lib/sesiones-actions";
import type { SesionResumenDTO } from "@socrates/shared";

const RESUMEN_VACIO = "Conversación nueva — aún sin mensajes.";

function fechaCorta(iso: string): string {
  const fecha = new Date(iso);
  const diffMin = Math.floor((Date.now() - fecha.getTime()) / 60_000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);
  if (diffMin < 1) return "ahora";
  if (diffMin < 60) return `hace ${diffMin} min`;
  if (diffH < 24) return `hace ${diffH} h`;
  if (diffD === 1) return "ayer";
  if (diffD < 7) return `hace ${diffD} días`;
  return fecha.toLocaleDateString("es-MX", { day: "2-digit", month: "short" });
}

function metaTexto(s: SesionResumenDTO): string {
  const n = s.cantidadMensajes;
  return `${n} ${n === 1 ? "mensaje" : "mensajes"} · ${fechaCorta(s.actualizadoEn)}`;
}

export function ListaSesiones({
  sesionesIniciales,
}: {
  sesionesIniciales: SesionResumenDTO[];
}) {
  const router = useRouter();
  const [vista, setVista] = useState<"tarjetas" | "lista">("tarjetas");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function nuevaConversacion() {
    setError(null);
    startTransition(async () => {
      try {
        const nueva = await crearSesion();
        router.push(`/sesiones/${nueva.id}`);
      } catch {
        setError("No pude crear la conversación. Intenta de nuevo.");
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Barra: nueva conversación + alternador de vista */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={nuevaConversacion}
          disabled={isPending}
          className="flex items-center gap-1.5 rounded-full bg-marca px-3.5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-marca-fuerte disabled:opacity-60"
        >
          <Plus size={15} aria-hidden /> Nueva conversación
        </button>

        <div
          className="flex items-center gap-1 rounded-full border border-oficina-borde bg-oficina-panel p-1"
          role="group"
          aria-label="Cambiar vista"
        >
          <BotonVista
            activa={vista === "tarjetas"}
            onClick={() => setVista("tarjetas")}
            etiqueta="Vista de tarjetas"
          >
            <LayoutGrid size={15} aria-hidden />
          </BotonVista>
          <BotonVista
            activa={vista === "lista"}
            onClick={() => setVista("lista")}
            etiqueta="Vista de lista"
          >
            <List size={15} aria-hidden />
          </BotonVista>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-estado-alerta/30 bg-estado-alerta/5 px-4 py-2.5 text-xs text-oficina-texto"
        >
          <span className="mr-1" aria-hidden>
            ⚠️
          </span>
          {error}
        </div>
      )}

      {sesionesIniciales.length === 0 ? (
        <Vacio />
      ) : vista === "tarjetas" ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {sesionesIniciales.map((s) => (
            <Link
              key={s.id}
              href={`/sesiones/${s.id}`}
              className="group flex flex-col gap-2 rounded-xl border border-oficina-borde bg-oficina-panel p-4 transition-shadow hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-marca/40"
            >
              <h3 className="truncate text-sm font-semibold text-oficina-texto group-hover:text-marca">
                {s.titulo}
              </h3>
              <p className="line-clamp-2 text-xs leading-relaxed text-oficina-tenue">
                {s.resumen?.trim() || RESUMEN_VACIO}
              </p>
              <span className="mt-auto flex items-center gap-1.5 pt-1 text-[11px] text-oficina-tenue">
                <MessageSquare size={11} aria-hidden /> {metaTexto(s)}
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-oficina-borde bg-oficina-panel">
          {sesionesIniciales.map((s, i) => (
            <Link
              key={s.id}
              href={`/sesiones/${s.id}`}
              className={`flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-oficina-fondo focus:outline-none focus:ring-2 focus:ring-inset focus:ring-marca/40 ${
                i > 0 ? "border-t border-oficina-borde" : ""
              }`}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-oficina-texto">
                  {s.titulo}
                </p>
                <p className="truncate text-xs text-oficina-tenue">
                  {s.resumen?.trim() || RESUMEN_VACIO}
                </p>
              </div>
              <span className="shrink-0 text-[11px] text-oficina-tenue">
                {metaTexto(s)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function BotonVista({
  activa,
  onClick,
  etiqueta,
  children,
}: {
  activa: boolean;
  onClick: () => void;
  etiqueta: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activa}
      aria-label={etiqueta}
      className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
        activa
          ? "bg-marca text-white"
          : "text-oficina-tenue hover:text-oficina-texto"
      }`}
    >
      {children}
    </button>
  );
}

function Vacio() {
  return (
    <div className="rounded-xl border border-dashed border-oficina-borde bg-oficina-panel p-8 text-center">
      <p className="text-sm text-oficina-texto">
        <span className="mr-1" aria-hidden>
          🐢
        </span>
        Aún no tienes conversaciones. Abre una nueva y empieza a platicar con Sócrates.
      </p>
    </div>
  );
}
