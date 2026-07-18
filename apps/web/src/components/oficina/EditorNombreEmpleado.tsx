"use client";
/**
 * EditorNombreEmpleado — renombrar a un empleado desde donde se le vea (Panel de
 * Equipo, onboarding). Muestra el nombre con un lápiz; al editar abre un campo
 * inline. Al guardar llama la Server Action y refresca la vista para re-hidratar
 * el nombre resuelto por la api. Validación de cliente 1–40 (el servidor revalida).
 */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Check, X, Loader2 } from "lucide-react";
import type { RolEmpleado } from "@socrates/shared";
import { guardarNombresEquipoAction } from "@/app/acciones/equipo";

const MAX = 40;

export function EditorNombreEmpleado({
  rol,
  nombre,
  claseNombre = "text-sm font-semibold text-oficina-texto",
}: {
  rol: RolEmpleado;
  nombre: string;
  /** Clases del texto del nombre cuando NO se está editando. */
  claseNombre?: string;
}) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [valor, setValor] = useState(nombre);
  const [error, setError] = useState<string | null>(null);
  const [guardando, iniciar] = useTransition();

  function abrir() {
    setValor(nombre);
    setError(null);
    setEditando(true);
  }

  function cancelar() {
    setEditando(false);
    setError(null);
  }

  function guardar() {
    const limpio = valor.trim();
    if (limpio.length === 0) {
      setError("El nombre no puede ir vacío.");
      return;
    }
    if (limpio.length > MAX) {
      setError(`El nombre no puede pasar de ${MAX} caracteres.`);
      return;
    }
    if (limpio === nombre) {
      cancelar();
      return;
    }
    setError(null);
    iniciar(async () => {
      const res = await guardarNombresEquipoAction({ [rol]: limpio });
      if (res.ok) {
        setEditando(false);
        router.refresh();
      } else {
        setError(res.error ?? "No se pudo guardar.");
      }
    });
  }

  if (!editando) {
    return (
      <span className="inline-flex items-center gap-1.5">
        <span className={claseNombre}>{nombre}</span>
        <button
          type="button"
          onClick={abrir}
          aria-label={`Renombrar a ${nombre}`}
          className="shrink-0 rounded p-0.5 text-oficina-tenue transition-colors hover:text-marca focus:outline-none focus:ring-2 focus:ring-marca/40"
        >
          <Pencil size={13} aria-hidden />
        </button>
      </span>
    );
  }

  return (
    <span className="block">
      <span className="flex items-center gap-1.5">
        <input
          type="text"
          autoFocus
          value={valor}
          maxLength={MAX}
          disabled={guardando}
          onChange={(e) => setValor(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              guardar();
            } else if (e.key === "Escape") {
              e.preventDefault();
              cancelar();
            }
          }}
          aria-label="Nuevo nombre"
          className="w-full min-w-0 rounded-md border border-marca/40 bg-oficina-fondo px-2 py-1 text-sm text-oficina-texto outline-none focus:border-marca focus:ring-1 focus:ring-marca/30"
        />
        <button
          type="button"
          onClick={guardar}
          disabled={guardando}
          aria-label="Guardar nombre"
          className="shrink-0 rounded p-1 text-estado-entrego hover:bg-estado-entrego/10 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-marca/40"
        >
          {guardando ? (
            <Loader2 size={14} className="animate-spin" aria-hidden />
          ) : (
            <Check size={14} aria-hidden />
          )}
        </button>
        <button
          type="button"
          onClick={cancelar}
          disabled={guardando}
          aria-label="Cancelar"
          className="shrink-0 rounded p-1 text-oficina-tenue hover:bg-oficina-borde disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-marca/40"
        >
          <X size={14} aria-hidden />
        </button>
      </span>
      {error && (
        <span className="mt-1 block text-[11px] text-estado-bloqueo" role="alert">
          {error}
        </span>
      )}
    </span>
  );
}
