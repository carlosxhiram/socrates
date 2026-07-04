"use client";

/**
 * ConversacionSesion — el hilo de UNA conversación con Sócrates, en su pantalla
 * propia (/sesiones/[id]). Recibe los mensajes ya cargados en el servidor y deja
 * seguir escribiendo (envío optimista). La lista de conversaciones vive aparte,
 * en /sesiones (ListaSesiones).
 */
import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { enviarMensaje } from "@/lib/sesiones-actions";
import type { SesionDetalleDTO, MensajeDTO } from "@socrates/shared";

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

function BurbujaMensaje({ mensaje }: { mensaje: MensajeDTO }) {
  const esUsuario = mensaje.rol === "USUARIO";
  return (
    <div className={`flex w-full gap-2.5 ${esUsuario ? "justify-end" : "justify-start"}`}>
      {!esUsuario && (
        <span className="mt-0.5 shrink-0 text-base" aria-hidden>
          🐢
        </span>
      )}
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          esUsuario
            ? "rounded-br-sm bg-marca text-white"
            : "rounded-bl-sm border border-oficina-borde bg-oficina-panel text-oficina-texto"
        }`}
      >
        <p className="whitespace-pre-wrap">{mensaje.contenido}</p>
        <p className={`mt-1 text-[10px] ${esUsuario ? "text-white/60" : "text-oficina-tenue"}`}>
          {fechaCorta(mensaje.creadoEn)}
        </p>
      </div>
    </div>
  );
}

function IndicadorEscribiendo() {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 shrink-0 text-base" aria-hidden>
        🐢
      </span>
      <div className="rounded-2xl rounded-bl-sm border border-oficina-borde bg-oficina-panel px-4 py-3">
        <span className="inline-flex items-center gap-1" aria-label="Sócrates está escribiendo">
          <span className="text-xs text-oficina-tenue">Sócrates está escribiendo</span>
          <span className="flex gap-0.5 pl-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-oficina-tenue"
                style={{ animation: `parpadeo 1.2s ease-in-out ${i * 0.2}s infinite` }}
              />
            ))}
          </span>
        </span>
      </div>
    </div>
  );
}

function EstadoVacioChat() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
      <span className="text-4xl" aria-hidden>
        🐢
      </span>
      <p className="text-sm font-medium text-oficina-texto">
        Escríbele a Sócrates para empezar
      </p>
      <p className="max-w-[240px] text-xs text-oficina-tenue">
        Tu asesor está listo. Cuéntale qué necesitas y empieza la conversación.
      </p>
    </div>
  );
}

export function ConversacionSesion({
  sesionInicial,
}: {
  sesionInicial: SesionDetalleDTO;
}) {
  const [mensajes, setMensajes] = useState<MensajeDTO[]>(sesionInicial.mensajes);
  const [escribiendo, setEscribiendo] = useState(false);
  const [texto, setTexto] = useState("");
  const [error, setError] = useState<string | null>(null);
  const hiloRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (hiloRef.current) hiloRef.current.scrollTop = hiloRef.current.scrollHeight;
  }, [mensajes, escribiendo]);

  async function handleEnviar(e: React.FormEvent) {
    e.preventDefault();
    const limpio = texto.trim();
    if (!limpio || escribiendo) return;

    setError(null);
    setTexto("");
    const idTemp = `tmp-${Date.now()}`;
    setMensajes((prev) => [
      ...prev,
      { id: idTemp, rol: "USUARIO", contenido: limpio, creadoEn: new Date().toISOString() },
    ]);
    setEscribiendo(true);

    try {
      const { usuario, asistente } = await enviarMensaje(sesionInicial.id, limpio);
      setMensajes((prev) => [...prev.filter((m) => m.id !== idTemp), usuario, asistente]);
    } catch {
      setMensajes((prev) => prev.filter((m) => m.id !== idTemp));
      setError("No pude enviar el mensaje. Verifica tu conexión e intenta de nuevo.");
      setTexto(limpio);
    }
    setEscribiendo(false);
  }

  function ajustarAltura() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }

  return (
    <>
      <style>{`@keyframes parpadeo {0%,80%,100%{opacity:.2;transform:translateY(0)}40%{opacity:1;transform:translateY(-3px)}}`}</style>

      <div className="flex h-[70vh] min-h-[460px] flex-col overflow-hidden rounded-xl border border-oficina-borde bg-oficina-fondo shadow-sm">
        {/* Hilo de mensajes */}
        <div
          ref={hiloRef}
          className="flex flex-1 flex-col overflow-y-auto p-5"
          aria-live="polite"
          aria-label="Hilo de conversación"
        >
          {mensajes.length === 0 && !escribiendo ? (
            <EstadoVacioChat />
          ) : (
            <div className="flex flex-col gap-4">
              {mensajes.map((m) => (
                <BurbujaMensaje key={m.id} mensaje={m} />
              ))}
              {escribiendo && <IndicadorEscribiendo />}
            </div>
          )}
        </div>

        {/* Aviso de error inline */}
        {error && (
          <div
            role="alert"
            className="mx-4 mb-2 rounded-lg border border-estado-alerta/30 bg-estado-alerta/5 px-4 py-2.5 text-xs text-oficina-texto"
          >
            <span className="mr-1" aria-hidden>
              ⚠️
            </span>
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-2 underline underline-offset-2 hover:text-marca"
              aria-label="Cerrar aviso"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* Caja de redacción */}
        <div className="border-t border-oficina-borde p-4">
          <form
            onSubmit={handleEnviar}
            className="flex items-end gap-2 rounded-xl border border-oficina-borde bg-oficina-panel px-3 py-2 shadow-sm transition-colors focus-within:border-marca/40"
          >
            <span className="mb-1 shrink-0 text-base" aria-hidden>
              🐢
            </span>
            <textarea
              ref={textareaRef}
              value={texto}
              onChange={(e) => {
                setTexto(e.target.value);
                ajustarAltura();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleEnviar(e as unknown as React.FormEvent);
                }
              }}
              placeholder="Escríbele a Sócrates… (Enter para enviar, Shift+Enter para saltar línea)"
              aria-label="Mensaje para Sócrates"
              rows={1}
              disabled={escribiendo}
              className="flex-1 resize-none overflow-hidden bg-transparent text-sm text-oficina-texto outline-none placeholder:text-oficina-tenue disabled:opacity-50"
              style={{ minHeight: "24px", maxHeight: "160px" }}
            />
            <button
              type="submit"
              disabled={escribiendo || !texto.trim()}
              aria-label="Enviar mensaje"
              className="mb-0.5 flex shrink-0 items-center gap-1.5 rounded-lg bg-marca px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-marca-fuerte disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send size={14} aria-hidden />
              Enviar
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
