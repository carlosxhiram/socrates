"use client";

/**
 * BarraComando — la línea directa al gerente Sócrates (UX C-3).
 * Placeholder FUNCIONAL: el campo recibe texto y muestra un acuse en voz de
 * Sócrates. La interpretación/plan plenos llegan en E3. No es un chat.
 */
import { useState } from "react";
import { Send } from "lucide-react";

export function BarraComando({ contexto = "oficina" }: { contexto?: "oficina" | "expediente" }) {
  const [texto, setTexto] = useState("");
  const [acuse, setAcuse] = useState<string | null>(null);

  const placeholder =
    contexto === "oficina"
      ? "¿Qué necesitas? Escríbeme en lenguaje natural…"
      : "¿Qué hacemos con este expediente?";

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!texto.trim()) return;
    // E1: acuse honesto. La planeación real (delegar a empleados) llega en E3.
    setAcuse(
      "Te leo. Todavía estoy aprendiendo a repartir el trabajo entre el equipo; muy pronto podré encargar esto por ti.",
    );
    setTexto("");
  }

  return (
    <div className="space-y-2">
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
    </div>
  );
}
