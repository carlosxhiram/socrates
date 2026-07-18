"use client";
/**
 * BotonAprobar — el Gate humano (C-3, A1). Solo visible en BORRADOR; manda la
 * `version` que el Asesor tiene enfrente (candado optimista, misma versión
 * que ve). Si cambió mientras tanto, el servidor responde 409 y este botón
 * lo avisa con un mensaje digno y recarga en vez de fingir que aprobó.
 */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { aprobarEntregable } from "@/lib/acciones";

export function BotonAprobar({
  entregableId,
  expedienteId,
  version,
}: {
  entregableId: string;
  expedienteId: string;
  version: number;
}) {
  const [confirmando, setConfirmando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [pendiente, iniciarTransicion] = useTransition();
  const router = useRouter();

  function aprobar() {
    setMensaje("");
    iniciarTransicion(async () => {
      const res = await aprobarEntregable(entregableId, version, expedienteId);
      if (!res.exito) {
        setMensaje(res.mensaje);
        router.refresh(); // por si cambió de versión: refresca para mostrar la vigente
        return;
      }
      setConfirmando(false);
      router.refresh();
    });
  }

  if (!confirmando) {
    return (
      <div className="mt-4">
        <button
          type="button"
          onClick={() => setConfirmando(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-marca px-4 py-2 text-sm font-medium text-white hover:bg-marca/90"
        >
          <CheckCircle2 size={16} aria-hidden />
          Aprobar entregable
        </button>
        {mensaje && (
          <p role="alert" className="mt-2 rounded-lg bg-estado-alerta/10 px-3 py-2 text-xs text-estado-alerta">
            {mensaje}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-xl border border-marca/30 bg-marca/5 p-4">
      <p className="text-sm text-oficina-texto">
        Al aprobar, este entregable queda listo para que lo uses con tu prospecto.
      </p>
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          disabled={pendiente}
          onClick={aprobar}
          className="inline-flex items-center gap-1.5 rounded-lg bg-marca px-4 py-2 text-sm font-medium text-white hover:bg-marca/90 disabled:opacity-60"
        >
          {pendiente && <Loader2 size={14} className="animate-spin" aria-hidden />}
          {pendiente ? "Aprobando…" : "Sí, aprobar"}
        </button>
        <button
          type="button"
          onClick={() => setConfirmando(false)}
          className="rounded-lg border border-oficina-borde px-4 py-2 text-sm font-medium text-oficina-tenue hover:text-oficina-texto"
        >
          Cancelar
        </button>
      </div>
      {mensaje && (
        <p role="alert" className="mt-2 rounded-lg bg-estado-alerta/10 px-3 py-2 text-xs text-estado-alerta">
          {mensaje}
        </p>
      )}
    </div>
  );
}
