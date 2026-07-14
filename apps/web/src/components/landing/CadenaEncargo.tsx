"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

/**
 * "Cadena de encargo" — el gráfico estrella del Hero.
 *
 * Cuenta, en cascada vertical, cómo un solo encargo del asesor baja por la
 * plantilla (el gerente lo asigna, cada especialista hace su parte) hasta
 * convertirse en el reporte de inteligencia listo para revisar. Es una isla
 * DECORATIVA, pero el texto de cada casilla es real y queda legible para los
 * lectores de pantalla (la línea, los nodos y las palomitas van `aria-hidden`).
 *
 * Doctrina de movimiento (Resend): un solo easing en todo, loop lento y
 * silencioso, el estado nunca depende solo del color (se refuerza con forma:
 * casilla hueca → pulso → palomita). Solo se anima transform/opacity.
 */

type Estado = "pendiente" | "activo" | "listo";

interface Casilla {
  nombre: string;
  rol?: string;
  sub: string;
  tipo?: "origen" | "destino";
}

// El encargo baja por la cadena: tú → gerente → especialistas → reporte.
const CASILLAS: Casilla[] = [
  { nombre: "Tu encargo", sub: "Tú lo pides", tipo: "origen" },
  { nombre: "Sócrates", rol: "Gerente", sub: "Asigna el trabajo" },
  { nombre: "Diego", rol: "Prospector", sub: "Califica al prospecto" },
  { nombre: "Hiram", rol: "Investigador", sub: "Arma el reporte con fuentes" },
  { nombre: "Jair", rol: "Asesor de Producto", sub: "Elige el financiamiento" },
  { nombre: "Katya", rol: "Negociadora", sub: "Prepara el pitch" },
  { nombre: "María", rol: "Trámites", sub: "Reúne los requisitos" },
  { nombre: "Paula", rol: "Gestora", sub: "Deja listo el seguimiento" },
  {
    nombre: "Reporte de inteligencia",
    sub: "Listo para tu revisión",
    tipo: "destino",
  },
];

const TOTAL = CASILLAS.length; // valor de "paso" que significa: todo listo
const PASO_MS = 900; // ritmo de cada relevo (dentro del rango 800–1200)
const ESPERA_MS = 2200; // pausa de celebración con la cadena completa
const REINICIO_MS = 600; // beat en vacío antes de volver a empezar

export function CadenaEncargo() {
  const sinMovimiento = useReducedMotion();
  // paso = índice de la casilla en curso. TOTAL ⇒ todo listo. -1 ⇒ vacío.
  const [paso, setPaso] = useState(0);
  const [pausado, setPausado] = useState(false);
  // El motor solo late cuando la tarjeta está a la vista: en móvil el wrapper
  // es display:none (nunca intersecta) y el loop no gasta batería.
  const raiz = useRef<HTMLDivElement>(null);
  const enVista = useInView(raiz);

  // Con "menos movimiento" activo: foto fija con toda la cadena resuelta.
  useEffect(() => {
    if (sinMovimiento) setPaso(TOTAL);
  }, [sinMovimiento]);

  // El motor del loop. Se detiene en hover (WCAG 2.2.2), con reduced-motion
  // y fuera de pantalla.
  useEffect(() => {
    if (sinMovimiento || pausado || !enVista) return;
    const espera =
      paso === TOTAL ? ESPERA_MS : paso < 0 ? REINICIO_MS : PASO_MS;
    const t = setTimeout(() => {
      setPaso((p) => (p === TOTAL ? -1 : p < 0 ? 0 : p + 1));
    }, espera);
    return () => clearTimeout(t);
  }, [paso, pausado, sinMovimiento, enVista]);

  const estadoDe = (i: number): Estado =>
    paso > i ? "listo" : paso === i ? "activo" : "pendiente";

  return (
    <div
      ref={raiz}
      className="w-80 rounded-xl border border-oficina-borde bg-oficina-panel shadow-sm"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
    >
      {/* Encabezado editorial */}
      <div className="border-b border-oficina-borde px-5 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-oficina-tenue">
          Cadena de encargo
        </p>
        <p className="mt-1 text-[12px] leading-snug text-oficina-tenue">
          De tu encargo al reporte, sin que muevas un dedo.
        </p>
      </div>

      {/* La cascada — lista ordenada real para lectores de pantalla */}
      <ol
        aria-label="Cadena de encargo: de tu encargo al reporte de inteligencia"
        className="px-5 pb-5 pt-5"
      >
        {CASILLAS.map((casilla, i) => (
          <Fila
            key={casilla.nombre}
            casilla={casilla}
            estado={estadoDe(i)}
            esUltima={i === CASILLAS.length - 1}
            sinMovimiento={Boolean(sinMovimiento)}
          />
        ))}
      </ol>
    </div>
  );
}

interface FilaProps {
  casilla: Casilla;
  estado: Estado;
  esUltima: boolean;
  sinMovimiento: boolean;
}

function Fila({ casilla, estado, esUltima, sinMovimiento }: FilaProps) {
  const activo = estado === "activo";
  const listo = estado === "listo";
  const destino = casilla.tipo === "destino";
  const origen = casilla.tipo === "origen";

  const relleno = destino ? "bg-estado-entrego" : "bg-marca";
  const halo = destino ? "bg-estado-entrego/40" : "bg-marca/40";

  return (
    <li className="flex gap-3">
      {/* Columna de la línea y el nodo — puramente decorativa */}
      <div aria-hidden className="relative flex w-5 flex-col items-center">
        <span
          className={`relative z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors duration-500 ${
            activo || listo
              ? relleno
              : "border border-oficina-borde bg-oficina-panel"
          }`}
        >
          {/* Halo que late mientras la casilla trabaja (pulso equivalente) */}
          {activo && !sinMovimiento && (
            <motion.span
              className={`absolute inset-0 rounded-full ${halo}`}
              initial={{ opacity: 0.5, scale: 1 }}
              animate={{ opacity: 0, scale: 1.9 }}
              transition={{ duration: 1.5, ease: "easeOut", repeat: Infinity }}
            />
          )}

          {/* Marca de estado: palomita (entregable) o punto (según la casilla) */}
          {listo && !origen && (
            <svg
              viewBox="0 0 24 24"
              className="h-3 w-3 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth={3.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <motion.path
                d="M5 13l4 4L19 7"
                initial={{ pathLength: sinMovimiento ? 1 : 0 }}
                animate={{ pathLength: 1 }}
                transition={{
                  duration: sinMovimiento ? 0 : 0.35,
                  ease: [0.4, 0, 0.2, 1],
                }}
              />
            </svg>
          )}
          {listo && origen && (
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
          )}
          {activo && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
          {!activo && !listo && (
            <span className="h-1 w-1 rounded-full bg-oficina-borde" />
          )}
        </span>

        {/* Tramo que conecta con la casilla siguiente y se va "llenando" */}
        {!esUltima && (
          <div className="relative w-px flex-1">
            <div className="absolute inset-0 bg-oficina-borde" />
            <motion.div
              className={`absolute inset-0 origin-top ${relleno}`}
              initial={{ scaleY: sinMovimiento ? 1 : 0 }}
              animate={{ scaleY: listo ? 1 : 0 }}
              transition={{
                duration: sinMovimiento ? 0 : 0.5,
                ease: [0.4, 0, 0.2, 1],
              }}
            />
          </div>
        )}
      </div>

      {/* Texto real de la casilla */}
      <div className={`min-w-0 flex-1 ${esUltima ? "pb-0" : "pb-4"}`}>
        <p
          className={`text-[13px] leading-tight ${
            destino ? "font-bold" : "font-semibold"
          } text-oficina-texto`}
        >
          {casilla.nombre}
          {casilla.rol && (
            <span className="font-normal text-oficina-tenue">
              {" "}
              · {casilla.rol}
            </span>
          )}
        </p>
        <p
          className={`mt-0.5 text-[11px] leading-tight transition-colors duration-500 ${
            destino && listo ? "text-estado-entrego" : "text-oficina-tenue"
          }`}
        >
          {casilla.sub}
        </p>
      </div>
    </li>
  );
}
