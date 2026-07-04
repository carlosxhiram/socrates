"use client";

/**
 * BarraComando — la línea directa al gerente Sócrates (UX C-3).
 * El campo recibe texto y muestra un acuse en voz de Sócrates; para platicar a
 * fondo con seguimiento, el acuse invita a abrir una conversación en
 * Conversaciones (Sesiones), donde el hilo se guarda. La interpretación/plan
 * plenos llegan en E3. Opcionalmente muestra "chips" de acciones rápidas que
 * rellenan el campo y lo enfocan.
 */
import { useRef, useState } from "react";
import Link from "next/link";
import { Send, MessagesSquare } from "lucide-react";

/** Un atajo que precarga el campo con una plantilla de encargo. */
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
      ? "Cuéntame qué necesitas y lo armamos"
      : "¿Qué hacemos con este expediente?";

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!texto.trim()) return;
    // Acuse honesto: la planeación real (delegar a empleados) llega en E3; para
    // conversar con seguimiento, Conversaciones (Sesiones) ya guarda el hilo.
    setAcuse(
      "Te leo. Para platicar a fondo y darle seguimiento, abre una conversación en Conversaciones; ahí te respondo y guardamos el hilo.",
    );
    setTexto("");
  }

  function usarAccion(plantilla: string) {
    setTexto(plantilla);
    inputRef.current?.focus();
  }

  return (
    <div className="space-y-3">
      {/* Región de acuse SIEMPRE montada: así el lector de pantalla la detecta
          desde el primer mensaje, no solo a partir del segundo (E1). */}
      <div aria-live="polite">
        {acuse && (
          <div className="rounded-xl border border-marca/20 bg-marca/5 px-4 py-3 text-sm text-oficina-texto">
            <span className="mr-1.5" aria-hidden>
              🐢
            </span>
            {acuse}{" "}
            <Link
              href="/sesiones"
              className="font-medium text-marca underline underline-offset-2 hover:text-marca-fuerte"
            >
              Abrir Conversaciones
            </Link>
          </div>
        )}
      </div>
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
          className="flex-1 rounded-md bg-transparent text-sm text-oficina-texto outline-none placeholder:text-oficina-tenue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marca focus-visible:ring-offset-1"
        />
        <button
          type="submit"
          aria-label="Enviar"
          className="flex items-center gap-1.5 rounded-lg bg-marca px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-marca-fuerte"
        >
          <Send size={15} aria-hidden /> Enviar
        </button>
      </form>

      {/* Chips de acciones rápidas: mismo ancho que la barra (grid de hasta 6). */}
      {acciones && acciones.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
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

      {/* Enlace persistente a Conversaciones (visible siempre en la Oficina). */}
      {contexto === "oficina" && (
        <Link
          href="/sesiones"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-oficina-tenue transition-colors hover:text-marca"
        >
          <MessagesSquare size={13} aria-hidden /> Ver mis conversaciones con Sócrates
        </Link>
      )}
    </div>
  );
}
