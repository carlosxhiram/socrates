"use client";
/**
 * DatosProspecto — editar los datos capturados del prospecto (E2-S5).
 * Los mínimos (empresa, ciudad, giro) no pueden quedar vacíos; los opcionales
 * se pueden completar o borrar cuando el Asesor consiga la información.
 */
import { useActionState, useEffect, useId, useState } from "react";
import { Pencil } from "lucide-react";
import { editarExpediente, type ResultadoAccion } from "@/lib/acciones";

const SIN_MENSAJE: ResultadoAccion = { exito: true, mensaje: "" };

export interface DatosEditables {
  empresa: string;
  ciudad: string;
  industria: string;
  sitioWeb: string | null;
  rfc: string | null;
  sucursales: number | null;
  notas: string | null;
}

export function DatosProspecto({ expedienteId, datos }: { expedienteId: string; datos: DatosEditables }) {
  const [editando, setEditando] = useState(false);
  const accion = editarExpediente.bind(null, expedienteId);
  const [resultado, enviar, enviando] = useActionState(accion, SIN_MENSAJE);
  const idBase = useId();

  // Al guardar con éxito, el formulario se cierra y la confirmación queda visible.
  useEffect(() => {
    if (resultado.exito && resultado.mensaje) setEditando(false);
  }, [resultado]);

  if (!editando) {
    return (
      <section className="rounded-xl border border-oficina-borde bg-oficina-panel p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-oficina-tenue">
            Datos del prospecto
          </h2>
          <button
            type="button"
            onClick={() => setEditando(true)}
            className="inline-flex items-center gap-1 rounded-md border border-oficina-borde px-2.5 py-1 text-xs font-medium text-oficina-tenue hover:text-marca"
          >
            <Pencil size={12} aria-hidden /> Editar
          </button>
        </div>
        <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
          <Dato titulo="Sitio web" valor={datos.sitioWeb} enlace />
          <Dato titulo="RFC" valor={datos.rfc} />
          <Dato titulo="Sucursales" valor={datos.sucursales !== null ? String(datos.sucursales) : null} />
        </dl>
        {resultado.exito && resultado.mensaje && (
          <p role="status" className="mt-3 rounded-lg bg-estado-entrego/10 px-3 py-2 text-xs text-estado-entrego">
            {resultado.mensaje}
          </p>
        )}
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-oficina-borde bg-oficina-panel p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-oficina-tenue">
        Datos del prospecto
      </h2>
      <form action={enviar} className="mt-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Campo idBase={idBase} etiqueta="Empresa" nombre="empresa" defaultValue={datos.empresa} requerido />
          <Campo idBase={idBase} etiqueta="Ciudad" nombre="ciudad" defaultValue={datos.ciudad} requerido />
          <Campo idBase={idBase} etiqueta="Giro" nombre="industria" defaultValue={datos.industria} requerido />
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Campo idBase={idBase} etiqueta="Sitio web" nombre="sitioWeb" defaultValue={datos.sitioWeb ?? ""} tipo="url" />
          <Campo idBase={idBase} etiqueta="RFC" nombre="rfc" defaultValue={datos.rfc ?? ""} />
          <Campo idBase={idBase} etiqueta="Sucursales" nombre="sucursales" defaultValue={datos.sucursales !== null ? String(datos.sucursales) : ""} tipo="number" min={0} />
        </div>
        <div className="mt-3">
          <label htmlFor={`${idBase}-notas`} className="block text-xs font-medium text-oficina-tenue">
            Notas
          </label>
          <textarea
            id={`${idBase}-notas`}
            name="notas"
            rows={2}
            defaultValue={datos.notas ?? ""}
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
            {enviando ? "Guardando…" : "Guardar datos"}
          </button>
          <button
            type="button"
            onClick={() => setEditando(false)}
            className="rounded-lg border border-oficina-borde px-3.5 py-2 text-sm font-medium text-oficina-tenue hover:text-oficina-texto"
          >
            Cancelar
          </button>
        </div>
      </form>
    </section>
  );
}

function Dato({ titulo, valor, enlace }: { titulo: string; valor: string | null; enlace?: boolean }) {
  // Solo se enlaza lo que de verdad es una dirección web (nada de esquemas raros).
  const esEnlaceSeguro = enlace && valor !== null && /^https?:\/\//i.test(valor);
  return (
    <div className="flex gap-2">
      <dt className="shrink-0 text-oficina-tenue">{titulo}:</dt>
      <dd className="min-w-0 truncate text-oficina-texto">
        {valor ? (
          esEnlaceSeguro ? (
            <a href={valor} target="_blank" rel="noopener noreferrer" className="text-marca hover:underline">
              {valor}
            </a>
          ) : (
            valor
          )
        ) : (
          <span className="text-oficina-tenue">— sin capturar —</span>
        )}
      </dd>
    </div>
  );
}

function Campo({
  idBase,
  etiqueta,
  nombre,
  defaultValue,
  requerido,
  tipo = "text",
  min,
}: {
  idBase: string;
  etiqueta: string;
  nombre: string;
  defaultValue: string;
  requerido?: boolean;
  tipo?: "text" | "url" | "number";
  min?: number;
}) {
  const id = `${idBase}-${nombre}`;
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-oficina-tenue">
        {etiqueta}
      </label>
      <input
        id={id}
        name={nombre}
        type={tipo}
        defaultValue={defaultValue}
        required={requerido}
        min={min}
        className="mt-1 w-full rounded-lg border border-oficina-borde bg-oficina-fondo px-3 py-2 text-sm text-oficina-texto focus:border-marca focus:outline-none"
      />
    </div>
  );
}
