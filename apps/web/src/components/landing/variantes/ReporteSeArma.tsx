"use client";

import { motion, useInView, useReducedMotion, type Variants } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { EASE } from "@/lib/motion";

/**
 * "El reporte que se arma solo" — variante del gráfico estrella del Hero.
 *
 * El protagonista es el ENTREGABLE. El asesor ve nacer su reporte de
 * inteligencia sección por sección: cada título aparece, sus líneas se DIBUJAN
 * creciendo de izquierda a derecha (se siente como texto escribiéndose) y, al
 * cerrar la sección, la FIRMA el especialista con un sello que entra deslizando
 * y aterriza con rebote. Completadas las cuatro, CAE el sello "Listo para tu
 * revisión" con física, un brillo lo barre, hay una pausa de celebración y el
 * documento se desvanece suave para renacer el ciclo (~11 s en total).
 *
 * Doctrina de movimiento (Resend): un solo easing en todo, loop lento y
 * silencioso, el estado se refuerza con forma (no solo color). Solo se anima
 * transform/opacity — nunca box-shadow (la "sombra que se asienta" es una capa
 * aparte cuya opacidad crece). El texto del reporte es real y legible para
 * lectores de pantalla; los adornos van aria-hidden. Se pausa en hover
 * (WCAG 2.2.2), se apaga fuera de pantalla y con "menos movimiento" queda una
 * foto fija: el reporte completo con su sello.
 */

interface Seccion {
  titulo: string;
  nombre: string;
  rol: string;
  lineas: number[]; // anchos (%) de las líneas que se dibujan — barras, nunca cifras
}

/**
 * Curaduría de 4 secciones: el arco natural de un reporte de inteligencia —
 * a quién le hablamos, qué encontramos con fuentes, qué le conviene y cómo
 * cerrar. Cada una firmada por el especialista del catálogo que la prepara
 * (María·Trámites y Paula·Gestora quedan fuera: su trabajo es operativo, no
 * autoría del documento).
 */
const SECCIONES: Seccion[] = [
  { titulo: "Perfil del prospecto", nombre: "Diego", rol: "Prospector", lineas: [90, 72, 55] },
  { titulo: "Investigación con fuentes", nombre: "Hiram", rol: "Investigador", lineas: [85, 94, 68] },
  { titulo: "Financiamiento sugerido", nombre: "Jair", rol: "Asesor de Producto", lineas: [88, 64] },
  { titulo: "Estrategia y siguiente paso", nombre: "Katya", rol: "Negociadora", lineas: [82, 76, 58] },
];

// Ritmo del loop. Siempre hay algo creciendo o entrando.
const MS_SECCION = 1850; // cada sección nace y se firma
const MS_SELLO = 2800; // cae el sello + pausa de celebración
const MS_SALIDA = 650; // el documento se desvanece
const MS_VACIO = 380; // respiro en vacío antes de renacer

// Fases del motor: 0..3 armado de secciones · 4 sello · 5 salida · 6 vacío.
const F_SELLO = SECCIONES.length; // 4
const F_SALIDA = SECCIONES.length + 1; // 5
const F_VACIO = SECCIONES.length + 2; // 6

// —— Coreografía de una sección (variantes reutilizables) ————————————————
// El <li> no cambia visualmente: solo propaga la etiqueta "oculto"/"vis" a sus
// hijos, que traen su propio tiempo. Así el título entra, luego se dibujan las
// líneas escalonadas y al final se estampa la firma.
const propagador: Variants = { oculto: {}, vis: {} };

const tituloVar: Variants = {
  oculto: { opacity: 0, x: -6 },
  vis: { opacity: 1, x: 0, transition: { duration: 0.3, ease: EASE } },
};

const lineasVar: Variants = {
  oculto: {},
  vis: { transition: { delayChildren: 0.3, staggerChildren: 0.13 } },
};

const barraVar: Variants = {
  oculto: { scaleX: 0 },
  vis: { scaleX: 1, transition: { duration: 0.42, ease: EASE } },
};

// La firma entra deslizando desde el borde y ATERRIZA con spring corto
// (rebota más allá de 1 y se asienta), como un sello que se estampa.
const chipVar: Variants = {
  oculto: { opacity: 0, x: 20, scale: 0.8, rotate: -6 },
  vis: {
    opacity: 1,
    x: 0,
    scale: 1,
    rotate: 0,
    transition: {
      opacity: { delay: 0.95, duration: 0.22, ease: EASE },
      x: { delay: 0.95, duration: 0.3, ease: EASE },
      scale: { delay: 0.95, type: "spring", stiffness: 500, damping: 14, mass: 0.6 },
      rotate: { delay: 0.95, type: "spring", stiffness: 500, damping: 14, mass: 0.6 },
    },
  },
};

// La palomita que deja la firma al aterrizar.
const palomitaVar: Variants = {
  oculto: { pathLength: 0, opacity: 0 },
  vis: { pathLength: 1, opacity: 1, transition: { delay: 1.2, duration: 0.3, ease: EASE } },
};

// —— El remate: el sello que cae sobre el documento ————————————————————
const selloVar: Variants = {
  oculto: { opacity: 0, scale: 1.5, rotate: -6 },
  caido: {
    opacity: 1,
    scale: 1,
    rotate: -3,
    transition: {
      opacity: { duration: 0.2, ease: EASE },
      scale: { type: "spring", stiffness: 420, damping: 13, mass: 0.9 },
      rotate: { type: "spring", stiffness: 420, damping: 13, mass: 0.9 },
    },
  },
};

// La sombra "se asienta" sin animar box-shadow: es una capa borrosa aparte
// cuya opacidad y tamaño crecen al aterrizar el sello.
const sombraVar: Variants = {
  oculto: { opacity: 0, scale: 0.6 },
  caido: { opacity: 0.16, scale: 1, transition: { delay: 0.12, duration: 0.5, ease: EASE } },
};

// Brillo breve que barre el sello una vez.
const brilloVar: Variants = {
  oculto: { x: "-150%", opacity: 0 },
  caido: { x: "150%", opacity: [0, 0.7, 0], transition: { delay: 0.5, duration: 0.7, ease: EASE } },
};

const selloPalomitaVar: Variants = {
  oculto: { pathLength: 0 },
  caido: { pathLength: 1, transition: { delay: 0.35, duration: 0.35, ease: EASE } },
};

export function ReporteSeArma() {
  const sinMovimiento = useReducedMotion();
  // fase = etapa del loop. 0..3 arman secciones · 4 sello · 5 salida · 6 vacío.
  const [fase, setFase] = useState(0);
  const [pausado, setPausado] = useState(false);
  // El motor solo late a la vista: en móvil el contenedor es display:none
  // (nunca intersecta) y no gasta batería.
  const raiz = useRef<HTMLDivElement>(null);
  const enVista = useInView(raiz);

  // Con "menos movimiento": foto fija con el reporte completo y su sello.
  useEffect(() => {
    if (sinMovimiento) setFase(F_SELLO);
  }, [sinMovimiento]);

  // El motor del loop. Se detiene en hover (WCAG 2.2.2), con reduced-motion y
  // fuera de pantalla.
  useEffect(() => {
    if (sinMovimiento || pausado || !enVista) return;
    const espera =
      fase < F_SELLO
        ? MS_SECCION
        : fase === F_SELLO
          ? MS_SELLO
          : fase === F_SALIDA
            ? MS_SALIDA
            : MS_VACIO;
    const t = setTimeout(() => setFase((f) => (f >= F_VACIO ? 0 : f + 1)), espera);
    return () => clearTimeout(t);
  }, [fase, pausado, sinMovimiento, enVista]);

  // El documento está a la vista hasta el sello; luego se desvanece (salida y
  // vacío) y renace al volver a la fase 0.
  const docVisible = fase <= F_SELLO;
  const selloCaido = fase === F_SELLO || fase === F_SALIDA;
  const revelada = (i: number) => fase >= i && fase <= F_SALIDA;

  return (
    <motion.div
      ref={raiz}
      className="relative w-80 overflow-hidden rounded-xl border border-oficina-borde bg-oficina-panel shadow-sm"
      initial={false}
      animate={{ opacity: docVisible ? 1 : 0, y: docVisible ? 0 : 8 }}
      transition={{ duration: 0.55, ease: EASE }}
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
    >
      {/* Membrete del documento */}
      <div className="border-b border-oficina-borde px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span aria-hidden className="h-4 w-4 shrink-0 rounded-[4px] bg-marca" />
            <p className="text-[13px] font-bold leading-none text-oficina-texto">
              Reporte de inteligencia
            </p>
          </div>
          <p className="shrink-0 text-[9px] font-medium uppercase tracking-[0.18em] text-oficina-tenue">
            Folio OF-0428
          </p>
        </div>
        <p className="mt-2 text-[11px] leading-tight text-oficina-tenue">
          Preparado por tu equipo, sección por sección.
        </p>
      </div>

      {/* El cuerpo del reporte — lista real y legible para lectores de pantalla.
          Deja abajo una zona de aterrizaje para el sello (pb-16). */}
      <ul
        aria-label="Reporte de inteligencia preparado por tu equipo"
        className="divide-y divide-oficina-borde/70 px-5 pb-16 pt-1"
      >
        {SECCIONES.map((seccion, i) => (
          <SeccionReporte
            key={seccion.titulo}
            seccion={seccion}
            revelada={revelada(i)}
            sinMovimiento={Boolean(sinMovimiento)}
          />
        ))}
      </ul>

      {/* El sello que cae sobre el documento. Centrado por el contenedor para
          que el <motion.div> solo haga scale/rotate/opacity sobre su propio eje. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-center px-5">
        <motion.div
          className="relative"
          initial={sinMovimiento ? "caido" : "oculto"}
          animate={selloCaido ? "caido" : "oculto"}
          variants={selloVar}
        >
          {/* Sombra que se asienta (capa aparte — nunca box-shadow animado) */}
          <motion.span
            aria-hidden
            variants={sombraVar}
            className="absolute inset-0 translate-y-1 rounded-lg bg-oficina-texto blur-md"
          />

          {/* El sello de goma */}
          <div className="relative overflow-hidden rounded-lg border-2 border-estado-entrego bg-oficina-panel px-4 py-2">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-1 rounded-md border border-estado-entrego/35"
            />
            <div className="relative flex items-center gap-2">
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="h-4 w-4 shrink-0 text-estado-entrego"
                fill="none"
                stroke="currentColor"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <motion.path d="M5 13l4 4L19 7" variants={selloPalomitaVar} />
              </svg>
              <span className="text-[12px] font-black uppercase leading-none tracking-[0.12em] text-estado-entrego">
                Listo para
                <br />
                tu revisión
              </span>
            </div>

            {/* Brillo breve que barre el sello */}
            <motion.span
              aria-hidden
              variants={brilloVar}
              className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-white/60"
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

interface SeccionReporteProps {
  seccion: Seccion;
  revelada: boolean;
  sinMovimiento: boolean;
}

function SeccionReporte({ seccion, revelada, sinMovimiento }: SeccionReporteProps) {
  const estado = revelada ? "vis" : "oculto";

  return (
    <motion.li
      className="flex items-start justify-between gap-2 py-3.5"
      variants={propagador}
      initial={sinMovimiento ? "vis" : "oculto"}
      animate={estado}
    >
      {/* Título real + las líneas que se dibujan (decorativas) */}
      <div className="min-w-0 flex-1">
        <motion.p
          variants={tituloVar}
          className="text-[12px] font-semibold leading-tight text-oficina-texto"
        >
          {seccion.titulo}
        </motion.p>
        <motion.div aria-hidden variants={lineasVar} className="mt-2 space-y-1.5">
          {seccion.lineas.map((ancho, i) => (
            <motion.span
              key={`${i}-${ancho}`}
              variants={barraVar}
              style={{ width: `${ancho}%` }}
              className={`block h-2 origin-left rounded-full ${
                i === 0 ? "bg-marca-suave/55" : "bg-marca-suave/35"
              }`}
            />
          ))}
        </motion.div>
      </div>

      {/* La firma que se estampa junto al título */}
      <motion.span
        variants={chipVar}
        className="mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-full border border-marca-suave/50 bg-marca-suave/15 px-2 py-0.5"
      >
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="h-2.5 w-2.5 text-estado-entrego"
          fill="none"
          stroke="currentColor"
          strokeWidth={3.4}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <motion.path d="M5 13l4 4L19 7" variants={palomitaVar} />
        </svg>
        <span className="sr-only">preparado por </span>
        <span className="text-[10px] font-semibold leading-none text-marca-fuerte">
          {seccion.nombre}
        </span>
        <span className="sr-only">, {seccion.rol}</span>
      </motion.span>
    </motion.li>
  );
}
