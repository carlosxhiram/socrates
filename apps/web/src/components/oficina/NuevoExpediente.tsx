"use client";
/**
 * NuevoExpediente — botón + formulario para abrir una carpeta nueva (E2-S1).
 * Campos mínimos obligatorios: empresa, ciudad, giro (industria). Los
 * opcionales no bloquean. Al confirmar, la oficina te lleva al expediente.
 */
import { useActionState, useId, useState } from "react";
import { Plus } from "lucide-react";
import { crearExpediente, type ResultadoAccion } from "@/lib/acciones";

const SIN_MENSAJE: ResultadoAccion = { exito: true, mensaje: "" };

export function NuevoExpediente() {
  const [abierto, setAbierto] = useState(false);
  const [resultado, enviar, enviando] = useActionState(crearExpediente, SIN_MENSAJE);
  const idFormulario = useId();

  return (
    <div>
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        aria-controls={`${idFormulario}-panel`}
        className="inline-flex items-center gap-1.5 rounded-lg bg-marca px-3.5 py-2 text-sm font-medium text-white hover:bg-marca/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca"
      >
        <Plus size={15} aria-hidden />
        Nuevo expediente
      </button>

      {abierto && (
        <form
          id={`${idFormulario}-panel`}
          action={enviar}
          className="mt-3 rounded-xl border border-oficina-borde bg-oficina-panel p-4"
        >
          <p className="text-sm font-medium text-oficina-texto">Abrir un expediente</p>
          <p className="mt-0.5 text-xs text-oficina-tenue">
            Con la empresa, la ciudad y el giro basta para empezar; lo demás se puede completar después.
          </p>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Campo etiqueta="Empresa" nombre="empresa" requerido autoFocus />
            <Campo etiqueta="Ciudad" nombre="ciudad" requerido />
            <Campo etiqueta="Giro" nombre="industria" requerido />
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Campo etiqueta="Sitio web (opcional)" nombre="sitioWeb" tipo="url" placeholder="https://…" />
            <Campo etiqueta="RFC (opcional)" nombre="rfc" />
            <Campo etiqueta="Sucursales (opcional)" nombre="sucursales" tipo="number" min={0} />
          </div>
          <div className="mt-3">
            <label htmlFor={`${idFormulario}-notas`} className="block text-xs font-medium text-oficina-tenue">
              Notas (opcional)
            </label>
            <textarea
              id={`${idFormulario}-notas`}
              name="notas"
              rows={2}
              className="mt-1 w-full rounded-lg border border-oficina-borde bg-oficina-fondo px-3 py-2 text-sm text-oficina-texto focus:border-marca focus:outline-none"
            />
          </div>

          {!resultado.exito && resultado.mensaje && (
            <p role="alert" className="mt-3 rounded-lg bg-estado-alerta/10 px-3 py-2 text-sm text-estado-alerta">
              {resultado.mensaje}
            </p>
          )}

          <div className="mt-4 flex items-center gap-2">
            <button
              type="submit"
              disabled={enviando}
              className="rounded-lg bg-marca px-3.5 py-2 text-sm font-medium text-white hover:bg-marca/90 disabled:opacity-60"
            >
              {enviando ? "Abriendo el expediente…" : "Abrir expediente"}
            </button>
            <button
              type="button"
              onClick={() => setAbierto(false)}
              className="rounded-lg border border-oficina-borde px-3.5 py-2 text-sm font-medium text-oficina-tenue hover:text-oficina-texto"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function Campo({
  etiqueta,
  nombre,
  requerido,
  tipo = "text",
  placeholder,
  min,
  autoFocus,
}: {
  etiqueta: string;
  nombre: string;
  requerido?: boolean;
  tipo?: "text" | "url" | "number";
  placeholder?: string;
  min?: number;
  autoFocus?: boolean;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-oficina-tenue">
        {etiqueta}
      </label>
      <input
        id={id}
        name={nombre}
        type={tipo}
        required={requerido}
        placeholder={placeholder}
        min={min}
        autoFocus={autoFocus}
        className="mt-1 w-full rounded-lg border border-oficina-borde bg-oficina-fondo px-3 py-2 text-sm text-oficina-texto focus:border-marca focus:outline-none"
      />
    </div>
  );
}
