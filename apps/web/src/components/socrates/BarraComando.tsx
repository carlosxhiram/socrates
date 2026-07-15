"use client";

/**
 * BarraComando — la línea directa al gerente Sócrates (UX C-3).
 * El campo recibe texto; al Enviar, abre una conversación nueva en
 * Conversaciones (Sesiones) con ese texto como primer mensaje y navega ahí —
 * el asesor aterriza viendo su mensaje y la respuesta de Sócrates (hoy, sin
 * llaves de IA, el acuse honesto del equipo). La interpretación/plan plenos
 * (delegar a empleados) llegan en E3. Opcionalmente muestra "chips" de
 * acciones rápidas que rellenan el campo y lo enfocan.
 */
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Send, Loader2, MessagesSquare } from "lucide-react";
import { crearSesion, enviarMensaje } from "@/lib/sesiones-actions";

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
  const router = useRouter();
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const placeholder =
    contexto === "oficina"
      ? "Cuéntame qué necesitas y lo armamos"
      : "¿Qué hacemos con este expediente?";

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    const limpio = texto.trim();
    if (!limpio || enviando) return;

    setError(null);
    setEnviando(true);
    try {
      // Reusa el flujo existente de Sesiones: crea la conversación y manda el
      // texto del asesor como primer mensaje, luego navega ahí — el asesor
      // aterriza viendo su mensaje ya enviado y la respuesta de Sócrates.
      const nueva = await crearSesion();
      await enviarMensaje(nueva.id, limpio);
      setTexto("");
      router.push(`/sesiones/${nueva.id}`);
    } catch {
      setError("No pude abrir tu conversación. Intenta de nuevo.");
      setEnviando(false);
    }
  }

  function usarAccion(plantilla: string) {
    setTexto(plantilla);
    inputRef.current?.focus();
  }

  return (
    <div className="space-y-3">
      {/* Región de aviso SIEMPRE montada: así el lector de pantalla la detecta
          desde el primer mensaje, no solo a partir del segundo (E1). */}
      <div aria-live="polite">
        {error && (
          <div className="rounded-xl border border-estado-alerta/30 bg-estado-alerta/5 px-4 py-3 text-sm text-oficina-texto">
            <span className="mr-1.5" aria-hidden>
              ⚠️
            </span>
            {error}
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
          disabled={enviando}
          className="flex-1 rounded-md bg-transparent text-sm text-oficina-texto outline-none placeholder:text-oficina-tenue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marca focus-visible:ring-offset-1 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={enviando || !texto.trim()}
          aria-label="Enviar"
          className="flex items-center gap-1.5 rounded-lg bg-marca px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-marca-fuerte disabled:cursor-not-allowed disabled:opacity-60"
        >
          {enviando ? (
            <>
              <Loader2 size={15} className="animate-spin" aria-hidden /> Abriendo tu
              conversación…
            </>
          ) : (
            <>
              <Send size={15} aria-hidden /> Enviar
            </>
          )}
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
