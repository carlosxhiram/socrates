"use client";

/**
 * ChatSesiones — UI de conversaciones con Sócrates.
 * Dos paneles: sidebar (lista de sesiones) + área de chat (hilo + caja de redacción).
 * Construido contra el contrato congelado de lib/sesiones-actions y @socrates/shared.
 */

import { useState, useTransition, useRef, useEffect } from "react";
import { Plus, Send, MessageSquare } from "lucide-react";
import {
  listarSesiones,
  crearSesion,
  obtenerSesion,
  enviarMensaje,
} from "@/lib/sesiones-actions";
import type { SesionResumenDTO, MensajeDTO } from "@socrates/shared";

// ─── helper: fecha corta relativa ─────────────────────────────────────────────
function fechaCorta(isoString: string): string {
  const fecha = new Date(isoString);
  const ahora = new Date();
  const diffMs = ahora.getTime() - fecha.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);

  if (diffMin < 1) return "ahora";
  if (diffMin < 60) return `hace ${diffMin} min`;
  if (diffH < 24) return `hace ${diffH} h`;
  if (diffD === 1) return "ayer";
  if (diffD < 7) return `hace ${diffD} días`;

  // más de una semana: dd/mm
  return fecha.toLocaleDateString("es-MX", { day: "2-digit", month: "short" });
}

// ─── burbuja de mensaje ────────────────────────────────────────────────────────
function BurbujaMensaje({ mensaje }: { mensaje: MensajeDTO }) {
  const esUsuario = mensaje.rol === "USUARIO";

  return (
    <div
      className={`flex w-full gap-2.5 ${esUsuario ? "justify-end" : "justify-start"}`}
    >
      {/* Avatar Sócrates */}
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
        <p
          className={`mt-1 text-[10px] ${
            esUsuario ? "text-white/60" : "text-oficina-tenue"
          }`}
        >
          {fechaCorta(mensaje.creadoEn)}
        </p>
      </div>
    </div>
  );
}

// ─── indicador "Sócrates está escribiendo…" ───────────────────────────────────
function IndicadorEscribiendo() {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 shrink-0 text-base" aria-hidden>
        🐢
      </span>
      <div className="rounded-2xl rounded-bl-sm border border-oficina-borde bg-oficina-panel px-4 py-3">
        <span className="inline-flex items-center gap-1" aria-label="Sócrates está escribiendo">
          <span className="text-xs text-oficina-tenue">Sócrates está escribiendo</span>
          {/* puntos animados vía CSS de Tailwind */}
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

// ─── estado vacío del hilo ─────────────────────────────────────────────────────
function EstadoVacioChat() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
      <span className="text-4xl" aria-hidden>
        🐢
      </span>
      <p className="text-sm text-oficina-texto font-medium">
        Escríbele a Sócrates para empezar
      </p>
      <p className="text-xs text-oficina-tenue max-w-[220px]">
        Tu asesor está listo. Cuéntale qué necesitas y empieza la conversación.
      </p>
    </div>
  );
}

// ─── props del componente principal ───────────────────────────────────────────
export function ChatSesiones({
  sesionesIniciales,
}: {
  sesionesIniciales: SesionResumenDTO[];
}) {
  // ── estado ────────────────────────────────────────────────────────────────
  const [sesiones, setSesiones] = useState<SesionResumenDTO[]>(sesionesIniciales);
  const [sesionActivaId, setSesionActivaId] = useState<string | null>(
    sesionesIniciales[0]?.id ?? null,
  );
  // mensajes del hilo actual (puede incluir un item "escribiendo" sentinel)
  const [mensajes, setMensajes] = useState<MensajeDTO[]>([]);
  const [escribiendo, setEscribiendo] = useState(false);
  const [texto, setTexto] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();
  const hiloRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ── carga inicial: si hay sesión activa, traer sus mensajes ────────────────
  useEffect(() => {
    if (!sesionActivaId) return;
    startTransition(async () => {
      try {
        const detalle = await obtenerSesion(sesionActivaId);
        setMensajes(detalle.mensajes);
      } catch {
        setError("No pude cargar los mensajes de esta sesión. Intenta de nuevo.");
      }
    });
    // solo al montar / cambio de sesión
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sesionActivaId]);

  // ── auto-scroll al último mensaje ─────────────────────────────────────────
  useEffect(() => {
    if (hiloRef.current) {
      hiloRef.current.scrollTop = hiloRef.current.scrollHeight;
    }
  }, [mensajes, escribiendo]);

  // ── seleccionar sesión del sidebar ────────────────────────────────────────
  function seleccionarSesion(id: string) {
    if (id === sesionActivaId) return;
    setError(null);
    setMensajes([]);
    setSesionActivaId(id);
    // el useEffect de arriba detecta el cambio y carga los mensajes
  }

  // ── crear nueva conversación ──────────────────────────────────────────────
  function nuevaConversacion() {
    setError(null);
    startTransition(async () => {
      try {
        const nueva = await crearSesion();
        setSesiones((prev) => [nueva, ...prev]);
        setSesionActivaId(nueva.id);
        setMensajes([]);
      } catch {
        setError("No pude crear la conversación. Intenta de nuevo.");
      }
    });
  }

  // ── enviar mensaje ────────────────────────────────────────────────────────
  async function handleEnviar(e: React.FormEvent) {
    e.preventDefault();
    const textoLimpio = texto.trim();
    if (!textoLimpio || isPending || escribiendo) return;

    setError(null);
    setTexto("");

    // ID temporal para burbuja optimista de usuario
    const idTemp = `tmp-${Date.now()}`;
    const mensajeOptimistaUsuario: MensajeDTO = {
      id: idTemp,
      rol: "USUARIO",
      contenido: textoLimpio,
      creadoEn: new Date().toISOString(),
    };

    // 1. Agregar burbuja optimista del usuario e indicador de escritura
    setMensajes((prev) => [...prev, mensajeOptimistaUsuario]);
    setEscribiendo(true);

    try {
      // 2. Si no hay sesión activa, crear una primero
      let idSesion = sesionActivaId;
      if (!idSesion) {
        const nueva = await crearSesion();
        setSesiones((prev) => [nueva, ...prev]);
        setSesionActivaId(nueva.id);
        idSesion = nueva.id;
      }

      // 3. Llamar al servidor
      const { usuario, asistente } = await enviarMensaje(idSesion, textoLimpio);

      // 4. Reemplazar burbuja temporal + quitar indicador + agregar respuesta
      setMensajes((prev) => [
        ...prev.filter((m) => m.id !== idTemp),
        usuario,
        asistente,
      ]);

      // 5. Actualizar la sesión en el sidebar (titulo / cantidad / orden)
      setSesiones((prev) => {
        const actualizada = prev.find((s) => s.id === idSesion);
        if (!actualizada) return prev;
        const nueva: SesionResumenDTO = {
          ...actualizada,
          actualizadoEn: asistente.creadoEn,
          cantidadMensajes: actualizada.cantidadMensajes + 2,
        };
        // mover al inicio
        return [nueva, ...prev.filter((s) => s.id !== idSesion)];
      });
    } catch {
      // Quitar indicador de escritura y mostrar error inline sin romper la UI
      setEscribiendo(false);
      setMensajes((prev) => prev.filter((m) => m.id !== idTemp));
      setError("No pude enviar el mensaje. Verifica tu conexión e intenta de nuevo.");
      // Restaurar el texto para que el usuario no pierda lo que escribió
      setTexto(textoLimpio);
      return;
    }

    setEscribiendo(false);
  }

  // ── ajustar altura del textarea automáticamente ───────────────────────────
  function ajustarAltura() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }

  // ── render ────────────────────────────────────────────────────────────────
  const estaOcupado = isPending || escribiendo;

  return (
    <>
      {/* Animación de puntos para el indicador de escritura */}
      <style>{`
        @keyframes parpadeo {
          0%, 80%, 100% { opacity: 0.2; transform: translateY(0); }
          40% { opacity: 1; transform: translateY(-3px); }
        }
      `}</style>

      <div className="flex h-[72vh] min-h-[480px] overflow-hidden rounded-xl border border-oficina-borde bg-oficina-fondo shadow-sm">
        {/* ── PANEL IZQUIERDO: lista de sesiones ─────────────────────────── */}
        <aside className="flex w-[260px] shrink-0 flex-col border-r border-oficina-borde bg-oficina-panel">
          {/* Botón nueva conversación */}
          <div className="border-b border-oficina-borde p-3">
            <button
              onClick={nuevaConversacion}
              disabled={estaOcupado}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-marca px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-marca-fuerte disabled:opacity-60"
            >
              <Plus size={15} aria-hidden />
              Nueva conversación
            </button>
          </div>

          {/* Lista de sesiones */}
          <div className="flex-1 overflow-y-auto py-2">
            {sesiones.length === 0 ? (
              <p className="px-4 py-6 text-center text-xs text-oficina-tenue">
                Aún no tienes conversaciones.
                <br />
                Empieza una nueva.
              </p>
            ) : (
              <ul role="listbox" aria-label="Conversaciones">
                {sesiones.map((s) => {
                  const activa = s.id === sesionActivaId;
                  return (
                    <li key={s.id} role="option" aria-selected={activa}>
                      <button
                        onClick={() => seleccionarSesion(s.id)}
                        className={`flex w-full flex-col gap-0.5 px-4 py-3 text-left transition-colors ${
                          activa
                            ? "bg-marca/8 border-l-2 border-marca pl-[14px]"
                            : "border-l-2 border-transparent pl-[14px] hover:bg-oficina-fondo"
                        }`}
                      >
                        <span
                          className={`truncate text-sm font-medium leading-snug ${
                            activa ? "text-marca" : "text-oficina-texto"
                          }`}
                        >
                          {s.titulo}
                        </span>
                        <span className="flex items-center gap-1.5 text-[10px] text-oficina-tenue">
                          <MessageSquare size={10} aria-hidden />
                          {s.cantidadMensajes}{" "}
                          {s.cantidadMensajes === 1 ? "mensaje" : "mensajes"}
                          <span>·</span>
                          {fechaCorta(s.actualizadoEn)}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>

        {/* ── PANEL DERECHO: área de chat ─────────────────────────────────── */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Hilo de mensajes */}
          <div
            ref={hiloRef}
            className="flex-1 overflow-y-auto p-5"
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
              className="flex items-end gap-2 rounded-xl border border-oficina-borde bg-oficina-panel px-3 py-2 shadow-sm focus-within:border-marca/40 transition-colors"
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
                  // Enter envía; Shift+Enter inserta salto de línea
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleEnviar(e as unknown as React.FormEvent);
                  }
                }}
                placeholder="Escríbele a Sócrates… (Enter para enviar, Shift+Enter para saltar línea)"
                aria-label="Mensaje para Sócrates"
                rows={1}
                disabled={estaOcupado}
                className="flex-1 resize-none overflow-hidden bg-transparent text-sm text-oficina-texto outline-none placeholder:text-oficina-tenue disabled:opacity-50"
                style={{ minHeight: "24px", maxHeight: "160px" }}
              />
              <button
                type="submit"
                disabled={estaOcupado || !texto.trim()}
                aria-label="Enviar mensaje"
                className="mb-0.5 flex shrink-0 items-center gap-1.5 rounded-lg bg-marca px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-marca-fuerte disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={14} aria-hidden />
                Enviar
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
