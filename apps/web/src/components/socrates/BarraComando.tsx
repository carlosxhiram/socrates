"use client";

/**
 * BarraComando — la línea directa al gerente Sócrates (UX C-3).
 * El campo recibe texto y muestra un acuse en voz de Sócrates. En la Oficina
 * muestra además los "chips" de acciones rápidas, AL MISMO ANCHO que la barra
 * (rellenan el campo y lo enfocan). La conversación plena vive en SESIONES.
 */
import { useRef, useState } from "react";
import { Send } from "lucide-react";

export interface AccionRapida {
  etiqueta: string;
  plantilla: string;
}

export function BarraComando({
  contexto = "oficina",
  acciones,
}: {
  contexto?: "oficina" | "expediente";
  acciones?: AccionRapida[];
}) {
  const [texto, setTexto] = useState("");
  const [acuse, setAcuse] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const placeholder =
    contexto === "oficina"
      ? "¿Qué necesitas? Escríbeme en lenguaje natural…"
      : "¿Qué hacemos con este expediente?";

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!texto.trim()) return;
    setAcuse(
      "Te leo. Para platicar a fondo y darle seguimiento, abre una conversación en SESIONES; ahí te respondo y guardamos el hilo.",
    );
    setTexto("");
  }

  function usarAccion(plantilla: string) {
    setTexto(plantilla);
    inputRef.current?.focus();
  }

  return (
    <div className="space-y-3">
      {acuse && (
        <div
          aria-live="polite"
          className="rounded-xl border border-marca/20 bg-marca/5 px-4 py-3 text-sm text-oficina-texto"
        >
          <span className="mr-1.5" aria-hidden>
            🐢
          </span>
          {acuse}
        </div>
      )}
      <form
        onSubmit={enviar}
        className="flex items-center gap-2 rounded-xl border border-oficina-borde bg-oficina-panel px-3 py-2 shadow-sm"
      >
        <span className="text-lg" aria-hidden>
          🐢
        </span>
        <input
          ref={inputRef}
          id="comando-socrates"
          type="text"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder={placeholder}
          aria-label="Escríbele a Sócrates"
          className="flex-1 bg-transparent text-sm text-oficina-texto outline-none placeholder:text-oficina-tenue"
        />
        <button
          type="submit"
          aria-label="Enviar"
          className="flex items-center gap-1.5 rounded-lg bg-marca px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-marca-fuerte"
        >
          <Send size={15} aria-hidden /> Enviar
        </button>
      </form>

      {/* Chips de acciones rápidas: mismo ancho que la barra (grid de 6) */}
      {acciones && acciones.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {acciones.map((a) => (
            <button
              key={a.etiqueta}
              type="button"
              onClick={() => usarAccion(a.plantilla)}
              className="rounded-full border border-oficina-borde bg-oficina-panel px-3 py-1.5 text-center text-sm text-oficina-tenue transition-colors hover:border-marca/40 hover:text-oficina-texto"
            >
              {a.etiqueta}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
