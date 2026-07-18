"use client";
/**
 * MenuCuenta — el nombre de la oficina + "Cerrar sesión" (pulido de la misión
 * de lanzamiento §2.14). Solo se monta cuando Clerk está configurado (el
 * padre server-side decide eso); en Modo asesor demo no hay sesión que cerrar.
 */
import { useState } from "react";
import { useClerk } from "@clerk/nextjs";
import { LogOut, ChevronDown } from "lucide-react";

export function MenuCuenta({ nombreOficina }: { nombreOficina: string }) {
  const { signOut } = useClerk();
  const [abierto, setAbierto] = useState(false);

  return (
    <div className="relative ml-auto">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        className="flex items-center gap-1.5 rounded-lg border border-oficina-borde bg-oficina-panel px-3 py-1.5 text-sm text-oficina-texto hover:bg-oficina-fondo"
      >
        <span className="max-w-[160px] truncate">{nombreOficina}</span>
        <ChevronDown size={14} aria-hidden />
      </button>

      {abierto && (
        <>
          {/* Cierra el menú al hacer clic afuera, sin librería extra. */}
          <button
            type="button"
            aria-label="Cerrar menú"
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setAbierto(false)}
          />
          <div className="absolute right-0 z-20 mt-1 w-44 rounded-lg border border-oficina-borde bg-oficina-panel py-1 shadow-lg">
            <button
              type="button"
              onClick={() => signOut({ redirectUrl: "/" })}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-oficina-texto hover:bg-oficina-fondo"
            >
              <LogOut size={14} aria-hidden />
              Cerrar sesión
            </button>
          </div>
        </>
      )}
    </div>
  );
}
