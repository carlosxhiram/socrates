"use client";
/**
 * AccionesEtapa — avanzar la Etapa y marcar Ganado/Perdido (E2-S7).
 * El servidor es quien decide (máquina de Etapas, FR-7); aquí solo se pide y
 * se muestra el motivo de oficina cuando algo no procede (progreso honesto).
 */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ETAPAS_LINEALES,
  ETAPAS_TERMINALES,
  ETAPA_ETIQUETA,
  type EtapaExpediente,
} from "@socrates/shared";
import { cambiarEtapa } from "@/lib/acciones";

export function AccionesEtapa({ expedienteId, etapa }: { expedienteId: string; etapa: EtapaExpediente }) {
  const router = useRouter();
  const [mensaje, setMensaje] = useState("");
  const [cerrando, setCerrando] = useState<"GANADO" | "PERDIDO" | null>(null);
  const [motivo, setMotivo] = useState("");
  const [pendiente, iniciarTransicion] = useTransition();

  const cerrado = (ETAPAS_TERMINALES as string[]).includes(etapa);
  const indice = ETAPAS_LINEALES.indexOf(etapa);
  const siguiente = indice >= 0 && indice < ETAPAS_LINEALES.length - 1 ? ETAPAS_LINEALES[indice + 1] : null;

  function ejecutar(nuevaEtapa: string, motivoCierre?: string) {
    setMensaje("");
    iniciarTransicion(async () => {
      const res = await cambiarEtapa(expedienteId, nuevaEtapa, motivoCierre);
      if (!res.exito) {
        setMensaje(res.mensaje);
        return;
      }
      setCerrando(null);
      setMotivo("");
      router.refresh();
    });
  }

  if (cerrado) {
    return (
      <p className="text-xs text-oficina-tenue">
        Expediente cerrado como {ETAPA_ETIQUETA[etapa]}.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {siguiente && (
          <button
            type="button"
            disabled={pendiente}
            onClick={() => ejecutar(siguiente)}
            className="rounded-lg border border-marca px-3 py-1.5 text-xs font-medium text-marca hover:bg-marca/5 disabled:opacity-60"
          >
            Avanzar a {ETAPA_ETIQUETA[siguiente]}
          </button>
        )}
        <button
          type="button"
          disabled={pendiente}
          onClick={() => { setCerrando("GANADO"); setMensaje(""); }}
          className="rounded-lg border border-estado-entrego px-3 py-1.5 text-xs font-medium text-estado-entrego hover:bg-estado-entrego/5 disabled:opacity-60"
        >
          Marcar como Ganado
        </button>
        <button
          type="button"
          disabled={pendiente}
          onClick={() => { setCerrando("PERDIDO"); setMensaje(""); }}
          className="rounded-lg border border-oficina-borde px-3 py-1.5 text-xs font-medium text-oficina-tenue hover:text-oficina-texto disabled:opacity-60"
        >
          Marcar como Perdido
        </button>
      </div>

      {cerrando && (
        <div className="rounded-lg border border-oficina-borde bg-oficina-fondo p-3">
          <label htmlFor={`motivo-${expedienteId}`} className="block text-xs font-medium text-oficina-tenue">
            {cerrando === "GANADO" ? "¿Cómo se ganó? (opcional)" : "¿Qué pasó? (opcional)"}
          </label>
          <input
            id={`motivo-${expedienteId}`}
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            autoFocus
            className="mt-1 w-full rounded-lg border border-oficina-borde bg-oficina-panel px-3 py-1.5 text-sm text-oficina-texto focus:border-marca focus:outline-none"
          />
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              disabled={pendiente}
              onClick={() => ejecutar(cerrando, motivo)}
              className="rounded-lg bg-marca px-3 py-1.5 text-xs font-medium text-white hover:bg-marca/90 disabled:opacity-60"
            >
              {pendiente ? "Guardando…" : `Confirmar ${cerrando === "GANADO" ? "Ganado" : "Perdido"}`}
            </button>
            <button
              type="button"
              onClick={() => { setCerrando(null); setMotivo(""); }}
              className="rounded-lg border border-oficina-borde px-3 py-1.5 text-xs font-medium text-oficina-tenue hover:text-oficina-texto"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {mensaje && (
        <p role="alert" className="rounded-lg bg-estado-alerta/10 px-3 py-2 text-xs text-estado-alerta">
          {mensaje}
        </p>
      )}
    </div>
  );
}
