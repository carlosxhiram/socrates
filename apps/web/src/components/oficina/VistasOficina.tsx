"use client";

/**
 * VistasOficina — alterna entre EXPEDIENTES (carpetas) y SESIONES (chat con
 * Sócrates) como dos pestañas-botón. Recibe los datos ya cargados en el
 * servidor; las Sesiones se manejan luego con server actions desde el chat.
 */
import { useState } from "react";
import type { ExpedienteResumenDTO, SesionResumenDTO } from "@socrates/shared";
import { TarjetaExpediente } from "@/components/oficina/TarjetaExpediente";
import { ListaSesiones } from "@/components/socrates/ListaSesiones";

type Vista = "expedientes" | "sesiones";

export function VistasOficina({
  expedientes,
  sesionesIniciales,
}: {
  expedientes: ExpedienteResumenDTO[];
  sesionesIniciales: SesionResumenDTO[];
}) {
  const [vista, setVista] = useState<Vista>("expedientes");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-5">
          <Pestana activa={vista === "expedientes"} onClick={() => setVista("expedientes")}>
            Expedientes
          </Pestana>
          <Pestana activa={vista === "sesiones"} onClick={() => setVista("sesiones")}>
            Sesiones
          </Pestana>
        </div>
        <span className="text-xs text-oficina-tenue">
          {vista === "expedientes"
            ? `${expedientes.length} ${expedientes.length === 1 ? "carpeta" : "carpetas"}`
            : `${sesionesIniciales.length} ${
                sesionesIniciales.length === 1 ? "conversación" : "conversaciones"
              }`}
        </span>
      </div>

      {vista === "expedientes" ? (
        expedientes.length === 0 ? (
          <ExpedientesVacio />
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {expedientes.map((e) => (
              <TarjetaExpediente key={e.id} expediente={e} />
            ))}
          </div>
        )
      ) : (
        <ListaSesiones sesionesIniciales={sesionesIniciales} />
      )}
    </div>
  );
}

function Pestana({
  activa,
  onClick,
  children,
}: {
  activa: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activa}
      className={[
        "text-sm font-semibold uppercase tracking-wide transition-colors",
        activa
          ? "text-oficina-texto"
          : "text-oficina-tenue hover:text-oficina-texto",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function ExpedientesVacio() {
  return (
    <div className="rounded-xl border border-dashed border-oficina-borde bg-oficina-panel p-8 text-center">
      <p className="text-sm text-oficina-texto">
        <span className="mr-1" aria-hidden>
          🐢
        </span>
        Aún no hay expedientes. Abre el primero o escríbeme arriba y lo armamos juntos.
      </p>
    </div>
  );
}
