"use client";

import { useState } from "react";
import { CadenaEncargo } from "@/components/landing/CadenaEncargo";
import { CadenaEncargoV2 } from "@/components/landing/variantes/CadenaEncargoV2";
import { OficinaViva } from "@/components/landing/variantes/OficinaViva";
import { ReporteSeArma } from "@/components/landing/variantes/ReporteSeArma";
import { ConversacionGerente } from "@/components/landing/variantes/ConversacionGerente";

/**
 * /estudio — taller interno para elegir el gráfico estrella del Hero.
 * Página SIN enlaces desde la landing: solo la ve quien tiene la ruta.
 * Cada pestaña monta su variante desde cero (key) para ver el loop completo.
 */

const VARIANTES = [
  {
    clave: "cadena-v1",
    nombre: "Cadena v1 (actual)",
    descripcion:
      "La versión que hoy vive en el Hero: nueve casillas con palomitas por turno. Referencia para comparar.",
    Componente: CadenaEncargo,
  },
  {
    clave: "cadena-v2",
    nombre: "Cadena v2 · compacta",
    descripcion:
      "Cuatro casillas. El encargo es un punto verde que viaja por el riel mientras se dibuja; los seis especialistas rotan en una sola casilla que se levanta a su turno.",
    Componente: CadenaEncargoV2,
  },
  {
    clave: "oficina-viva",
    nombre: "Oficina viva",
    descripcion:
      "El reporte al centro y el equipo flotando alrededor. Cada quien toma su turno: se acerca, escribe, y su palomita vuela hasta rellenar un renglón. Sócrates coordina desde arriba.",
    Componente: OficinaViva,
  },
  {
    clave: "reporte",
    nombre: "Reporte que se arma solo",
    descripcion:
      "El entregable como protagonista: las secciones nacen escribiéndose, cada una llega firmada por su especialista, y el sello final cae con peso propio.",
    Componente: ReporteSeArma,
  },
  {
    clave: "conversacion",
    nombre: "Conversación con el gerente",
    descripcion:
      "La experiencia real del producto: le escribes a Sócrates, ves cómo delega en vivo y te regresa el entregable listo para revisar.",
    Componente: ConversacionGerente,
  },
] as const;

export default function PaginaEstudio() {
  const [clave, setClave] = useState<(typeof VARIANTES)[number]["clave"]>("cadena-v2");
  const activa = VARIANTES.find((v) => v.clave === clave) ?? VARIANTES[0];
  const { Componente } = activa;

  return (
    <main className="min-h-screen bg-oficina-fondo px-6 py-16">
      <div className="mx-auto max-w-5xl">
        {/* Encabezado del taller */}
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-oficina-tenue">
          Estudio interno · No enlazado desde la landing
        </p>
        <h1 className="text-3xl font-black tracking-tight text-oficina-texto md:text-4xl">
          El gráfico estrella, a prueba.
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-oficina-tenue">
          Cinco candidatos para el Hero. Recorre las pestañas, deja correr cada
          loop completo (pasa el mouse encima para pausarlo) y dile a tu equipo
          cuál se queda.
        </p>

        {/* Pestañas */}
        <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="Variantes del gráfico">
          {VARIANTES.map((v) => (
            <button
              key={v.clave}
              role="tab"
              aria-selected={v.clave === clave}
              onClick={() => setClave(v.clave)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                v.clave === clave
                  ? "border-marca bg-marca text-white"
                  : "border-oficina-borde bg-oficina-panel text-oficina-texto hover:border-marca/40"
              }`}
            >
              {v.nombre}
            </button>
          ))}
        </div>

        {/* Escenario — mismo papel milimétrico del Hero para juzgar en contexto */}
        <div className="relative mt-8 overflow-hidden rounded-2xl border border-oficina-borde bg-oficina-fondo">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(to right, #e3e7ed 1px, transparent 1px), linear-gradient(to bottom, #e3e7ed 1px, transparent 1px)",
              backgroundSize: "48px 48px",
              opacity: 0.35,
            }}
          />
          <div className="relative flex min-h-[560px] items-center justify-center p-10">
            {/* key: cada cambio de pestaña remonta la variante y su loop nace de cero */}
            <Componente key={activa.clave} />
          </div>
        </div>

        {/* Ficha de la variante activa */}
        <div className="mt-6 rounded-xl border border-oficina-borde bg-oficina-panel p-5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-oficina-tenue">
            {activa.nombre}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-oficina-texto">
            {activa.descripcion}
          </p>
        </div>
      </div>
    </main>
  );
}
