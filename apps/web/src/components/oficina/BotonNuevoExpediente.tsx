"use client";

/**
 * BotonNuevoExpediente — vive en la barra superior de la Oficina. Por ahora
 * lleva al asesor a la línea de Sócrates (la puerta de entrada para describir lo
 * que necesita), enfocándola. El alta plena de expedientes llega después.
 */
import { Plus } from "lucide-react";

export function BotonNuevoExpediente() {
  function alClic() {
    const el = document.getElementById("comando-socrates") as HTMLInputElement | null;
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    el?.focus();
  }

  return (
    <button
      type="button"
      onClick={alClic}
      className="flex items-center gap-1.5 rounded-full bg-marca px-3.5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-marca-fuerte"
    >
      <Plus size={15} aria-hidden /> Nuevo expediente
    </button>
  );
}
