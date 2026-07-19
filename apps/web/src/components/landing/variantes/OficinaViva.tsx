"use client";

import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import { EASE } from "@/lib/motion";

/**
 * "Oficina viva" — variante del gráfico estrella del Hero.
 *
 * La historia: tu oficina nunca duerme. El equipo ORBITA el entregable y lo
 * va completando en vivo. En el centro, una tarjeta de "Reporte de
 * inteligencia" con renglones skeleton que se rellenan de verde suave; alrededor,
 * los seis empleados flotan sin parar (respira siempre) y por turnos se acercan,
 * "escriben" y sueltan una palomita que VUELA hasta la tarjeta y llena el
 * siguiente renglón. Sócrates, el gerente, ancla arriba y coordina cada turno.
 *
 * Doctrina de movimiento (Resend): un solo easing decorativo, loop lento y
 * silencioso, el estado nunca depende solo del color (se refuerza con forma:
 * barra hueca → palomita en vuelo → renglón lleno con su check). Solo se anima
 * transform/opacity. Pausa TOTAL en hover (WCAG 2.2.2), motor apagado fuera de
 * pantalla (useInView) y foto fija con "menos movimiento" (useReducedMotion).
 * La escena es decorativa (aria-hidden); una sola frase sr-only carga el sentido.
 */

// Centro de la tarjeta (sistema de coordenadas del lienzo, en px).
const CENTRO = { x: 192, y: 252 };
// Punto del chip desde donde despega la palomita (el distintivo, a la izquierda).
const ORIGEN = { x: 16, y: 18 };

interface Empleado {
  nombre: string;
  rol: string;
  x: number; // ancla top-left del chip dentro del lienzo
  y: number;
  dur: number; // duración de su flotación ambiental (fase propia)
  demora: number; // desfase para que ninguno respire igual
  amp: number; // amplitud del vaivén vertical
}

// Los seis empleados que promete el Hero ("seis empleados que se integran a tu
// oficina"). Flanquean la tarjeta en dos columnas de tres y la orbitan; cada uno
// entrega un renglón. El turno zigzaguea izq/der para variar la dirección de vuelo.
const EMPLEADOS: Empleado[] = [
  { nombre: "Diego", rol: "Prospector", x: 8, y: 90, dur: 4.6, demora: 0, amp: 6 },
  { nombre: "Hiram", rol: "Investigador", x: 288, y: 90, dur: 5.3, demora: 0.6, amp: 7 },
  { nombre: "Jair", rol: "Asesor de Producto", x: 8, y: 232, dur: 4.9, demora: 1.1, amp: 6 },
  { nombre: "Katya", rol: "Negociadora", x: 288, y: 232, dur: 5.6, demora: 0.3, amp: 7 },
  { nombre: "María", rol: "Trámites", x: 8, y: 374, dur: 4.4, demora: 0.9, amp: 6 },
  { nombre: "Paula", rol: "Gestora", x: 288, y: 374, dur: 5.0, demora: 1.4, amp: 7 },
];

const N = EMPLEADOS.length; // 6 renglones = 6 entregas

// Ritmos del loop (rango decorativo lento; feedback rápido dentro de cada turno).
const T_ACERCA = 380; // el chip en turno se acerca (scale + realce)
const T_ESCRIBE = 1050; // "escribiendo…" con sus tres puntitos
const T_VUELA = 760; // la palomita viaja y funde en la tarjeta
const T_CELEBRA = 2000; // pausa con el reporte completo y su badge
const T_VACIA = 620; // beat en vacío antes de reiniciar

// La escena avanza como una pequeña máquina de estados de un solo hilo.
type Escena =
  | { tipo: "turno"; i: number; fase: "acerca" | "escribe" | "vuela" }
  | { tipo: "celebra" }
  | { tipo: "vacia" };

const INICIO: Escena = { tipo: "turno", i: 0, fase: "acerca" };

export function OficinaViva() {
  const sinMovimiento = useReducedMotion();
  const estatico = Boolean(sinMovimiento);

  const [escena, setEscena] = useState<Escena>(INICIO);
  const [pausado, setPausado] = useState(false);

  // El motor solo late a la vista: en móvil el wrapper es hidden (nunca
  // intersecta) y el loop no gasta batería.
  const raiz = useRef<HTMLDivElement>(null);
  const enVista = useInView(raiz, { amount: 0.3 });
  const motor = !estatico && !pausado && enVista;

  // El reloj del loop: según la escena en curso, programa la siguiente. Se
  // detiene en hover (WCAG 2.2.2), con reduced-motion y fuera de pantalla.
  useEffect(() => {
    if (!motor) return;

    let ms: number;
    let siguiente: Escena;

    if (escena.tipo === "turno") {
      if (escena.fase === "acerca") {
        ms = T_ACERCA;
        siguiente = { ...escena, fase: "escribe" };
      } else if (escena.fase === "escribe") {
        ms = T_ESCRIBE;
        siguiente = { ...escena, fase: "vuela" };
      } else {
        ms = T_VUELA;
        siguiente =
          escena.i + 1 < N
            ? { tipo: "turno", i: escena.i + 1, fase: "acerca" }
            : { tipo: "celebra" };
      }
    } else if (escena.tipo === "celebra") {
      ms = T_CELEBRA;
      siguiente = { tipo: "vacia" };
    } else {
      ms = T_VACIA;
      siguiente = INICIO;
    }

    const t = setTimeout(() => setEscena(siguiente), ms);
    return () => clearTimeout(t);
  }, [escena, motor]);

  // Estado derivado de la escena (la foto fija muestra el reporte completo).
  const llenos =
    estatico || escena.tipo === "celebra"
      ? N
      : escena.tipo === "turno"
        ? escena.i
        : 0;
  const activo =
    !estatico && escena.tipo === "turno" ? escena.i : -1;
  const escribiendo =
    !estatico && escena.tipo === "turno" && escena.fase === "escribe";
  const volando =
    !estatico && escena.tipo === "turno" && escena.fase === "vuela";
  const completo = estatico || escena.tipo === "celebra";
  const vaciando = escena.tipo === "vacia";

  return (
    <div
      ref={raiz}
      className="relative h-[452px] w-96 select-none"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
    >
      {/* El sentido para lectores de pantalla, en una sola frase honesta. */}
      <p className="sr-only">
        Tu equipo arma tu Reporte de inteligencia en vivo. Sócrates, gerente,
        coordina; Diego (prospector), Hiram (investigador), Jair (asesor de
        producto), Katya (negociadora), María (trámites) y Paula (gestora)
        entregan cada parte.
      </p>

      {/* Toda la escena es decorativa. */}
      <div aria-hidden className="absolute inset-0">
        {/* Halo de "escenario" — profundidad suave detrás de la tarjeta. */}
        <div
          className="absolute h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-marca-suave/10 blur-2xl"
          style={{ left: CENTRO.x, top: CENTRO.y }}
        />

        {/* Brillo breve cuando el reporte queda completo. */}
        <AnimatePresence>
          {completo && !estatico && (
            <motion.div
              key="brillo"
              className="absolute h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-estado-entrego/20 blur-2xl"
              style={{ left: CENTRO.x, top: CENTRO.y }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: [0, 0.7, 0.35], scale: 1.12 }}
              exit={{ opacity: 0, scale: 1 }}
              transition={{ duration: 0.8, ease: EASE }}
            />
          )}
        </AnimatePresence>

        {/* La tarjeta central: el Reporte de inteligencia que se arma solo. */}
        <TarjetaReporte
          llenos={llenos}
          completo={completo}
          vaciando={vaciando}
          estatico={estatico}
        />

        {/* Sócrates — chip distinguido que ancla arriba y coordina. */}
        <Gerente
          escena={escena}
          motor={motor}
          estatico={estatico}
        />

        {/* Los seis empleados en órbita. */}
        {EMPLEADOS.map((emp, i) => (
          <Chip
            key={emp.nombre}
            emp={emp}
            activo={activo === i}
            escribiendo={escribiendo && activo === i}
            motor={motor}
            estatico={estatico}
          />
        ))}

        {/* La palomita en vuelo: del chip en turno hasta la tarjeta. */}
        <AnimatePresence>
          {volando && escena.tipo === "turno" && (
            <Palomita key={`vuelo-${escena.i}`} emp={EMPLEADOS[escena.i]} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

interface TarjetaProps {
  llenos: number;
  completo: boolean;
  vaciando: boolean;
  estatico: boolean;
}

function TarjetaReporte({ llenos, completo, vaciando, estatico }: TarjetaProps) {
  return (
    <div
      className="absolute"
      style={{ left: 108, top: 170, width: 168 }}
    >
      <div className="rounded-xl border border-oficina-borde bg-oficina-panel p-4 shadow-sm">
        {/* Encabezado editorial */}
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full transition-colors duration-500 ${
              completo ? "bg-estado-entrego" : "bg-marca-suave"
            }`}
          />
          <p className="text-[11px] font-bold leading-none text-oficina-texto">
            Reporte de inteligencia
          </p>
        </div>
        <p className="mt-1 text-[10px] leading-tight text-oficina-tenue">
          Tu equipo lo arma en vivo.
        </p>

        {/* Los renglones skeleton que se rellenan de verde suave. */}
        <div className="mt-3 space-y-2">
          {Array.from({ length: N }).map((_, i) => (
            <Renglon
              key={i}
              lleno={i < llenos}
              vaciando={vaciando}
              estatico={estatico}
              corto={i === N - 1}
            />
          ))}
        </div>

        {/* Badge de cierre — aparece cuando el reporte queda completo. */}
        <div className="mt-3 h-5">
          <AnimatePresence>
            {completo && (
              <motion.div
                key="badge"
                className="inline-flex items-center gap-1 rounded-full border border-estado-entrego/30 bg-estado-entrego/10 px-2 py-0.5"
                initial={
                  estatico
                    ? false
                    : { opacity: 0, y: 4, scale: 0.94 }
                }
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -2, scale: 0.96 }}
                transition={{ duration: 0.4, ease: EASE }}
              >
                <Check className="h-2.5 w-2.5 text-estado-entrego" />
                <span className="text-[9px] font-semibold text-estado-entrego">
                  Listo para tu revisión
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

interface RenglonProps {
  lleno: boolean;
  vaciando: boolean;
  estatico: boolean;
  corto: boolean;
}

function Renglon({ lleno, vaciando, estatico, corto }: RenglonProps) {
  // El relleno verde suave nace a la izquierda (scaleX, solo transform).
  const anim = estatico
    ? { scaleX: 1, opacity: 1 }
    : vaciando
      ? { scaleX: 0, opacity: 0 } // se vacía con fundido
      : lleno
        ? { scaleX: 1, opacity: 1 }
        : { scaleX: 0, opacity: 1 };

  return (
    <div className={`flex items-center gap-1.5 ${corto ? "pr-6" : ""}`}>
      {/* La pista hueca del skeleton (siempre visible). */}
      <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-oficina-borde">
        <motion.div
          className="absolute inset-0 origin-left rounded-full bg-marca-suave"
          initial={false}
          animate={anim}
          transition={{ duration: estatico ? 0 : 0.5, ease: EASE }}
        />
      </div>
      {/* Palomita del renglón: refuerza el estado con forma, no solo color. */}
      <motion.span
        className="shrink-0 text-estado-entrego"
        initial={false}
        animate={{
          opacity: !estatico && vaciando ? 0 : lleno ? 1 : 0,
          scale: lleno ? 1 : 0.6,
        }}
        transition={{ duration: estatico ? 0 : 0.3, ease: EASE }}
      >
        <Check className="h-2.5 w-2.5" />
      </motion.span>
    </div>
  );
}

/* ------------------------------------------------------------------ */

interface GerenteProps {
  escena: Escena;
  motor: boolean;
  estatico: boolean;
}

function Gerente({ escena, motor, estatico }: GerenteProps) {
  const x = 110;
  const y = 6;
  // El gerente coordina cada turno: da un asentimiento breve al arrancarlo.
  const turnoId = escena.tipo === "turno" ? escena.i : -1;

  return (
    <div className="absolute" style={{ left: x, top: y }}>
      <motion.div
        className="relative"
        initial={false}
        // Ancla arriba: respira apenas (el gerente no orbita, coordina).
        animate={estatico ? { y: 0 } : { y: motor ? [0, -3, 0] : 0 }}
        transition={
          motor && !estatico
            ? { duration: 6.5, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0.5, ease: EASE }
        }
      >
        {/* Pulso de coordinación: un anillo por cada turno que arranca. */}
        <AnimatePresence>
          {motor && escena.tipo === "turno" && (
            <motion.span
              key={turnoId}
              className="absolute -inset-1 rounded-2xl bg-marca/25"
              initial={{ opacity: 0.5, scale: 0.9 }}
              animate={{ opacity: 0, scale: 1.25 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.4, ease: "easeOut" }}
            />
          )}
        </AnimatePresence>

        <div className="relative inline-flex items-center gap-2 rounded-2xl bg-marca px-3 py-2 shadow-sm">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[10px] font-bold text-white">
            S
          </span>
          <span className="whitespace-nowrap text-[12px] font-bold leading-none text-white">
            Sócrates
            <span className="ml-1 font-medium text-white/70">· Gerente</span>
          </span>
        </div>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

interface ChipProps {
  emp: Empleado;
  activo: boolean;
  escribiendo: boolean;
  motor: boolean;
  estatico: boolean;
}

function Chip({ emp, activo, escribiendo, motor, estatico }: ChipProps) {
  return (
    <div
      className={`absolute ${activo ? "z-20" : "z-10"}`}
      style={{ left: emp.x, top: emp.y }}
    >
      <motion.div
        className="relative"
        initial={false}
        // Flotación ambiental (fase propia) + acercamiento en turno. Ambas son
        // transform; la flotación es infinita, el scale es un tween de una vez.
        animate={
          estatico
            ? { y: 0, scale: 1 }
            : {
                y: motor ? [0, -emp.amp, 0, emp.amp * 0.6, 0] : 0,
                scale: activo ? 1.06 : 1,
              }
        }
        transition={{
          y:
            motor && !estatico
              ? {
                  duration: emp.dur,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: emp.demora,
                }
              : { duration: 0.5, ease: EASE },
          scale: { duration: 0.35, ease: EASE },
        }}
      >
        {/* Realce suave del chip en turno (opacity, no sombra animada). */}
        <motion.span
          className="absolute -inset-1 rounded-2xl bg-marca-suave/25"
          initial={false}
          animate={{ opacity: activo ? 1 : 0 }}
          transition={{ duration: 0.35, ease: EASE }}
        />

        {/* En su turno, el empleado "se presenta": su especialidad aparece
            (solo opacity; no cambia el ancho, así que nunca invade la tarjeta). */}
        <span className="pointer-events-none absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <motion.span
            className="text-[9px] font-medium text-oficina-tenue"
            initial={false}
            animate={{ opacity: activo ? 1 : 0, y: activo ? 0 : 3 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            {emp.rol}
          </motion.span>
        </span>

        <div
          className={`relative inline-flex items-center gap-2 rounded-2xl border bg-oficina-panel px-3 py-2 ${
            activo
              ? "border-marca-suave shadow-md"
              : "border-oficina-borde shadow-sm"
          }`}
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-marca-suave/20 text-[10px] font-bold text-marca">
            {emp.nombre[0]}
          </span>
          <span className="whitespace-nowrap text-[12px] font-semibold leading-none text-oficina-texto">
            {emp.nombre}
          </span>
        </div>

        {/* "escribiendo…" — tres puntitos con plop escalonado (patrón Resend). */}
        <AnimatePresence>
          {escribiendo && (
            <motion.div
              className="absolute -bottom-2 right-2 flex items-center gap-1 rounded-full border border-oficina-borde bg-oficina-panel px-1.5 py-1 shadow-sm"
              initial={{ opacity: 0, y: -2, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.25, ease: EASE }}
            >
              {[0, 1, 2].map((d) => (
                <motion.span
                  key={d}
                  className="h-1 w-1 rounded-full bg-marca"
                  // Los puntitos también se congelan en hover (pausa TOTAL).
                  animate={
                    motor
                      ? { y: [0, -3, 0], opacity: [0.4, 1, 0.4] }
                      : { y: 0, opacity: 0.5 }
                  }
                  transition={
                    motor
                      ? {
                          duration: 0.6,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: d * 0.14,
                        }
                      : { duration: 0.2, ease: EASE }
                  }
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Palomita({ emp }: { emp: Empleado }) {
  const desde = { x: emp.x + ORIGEN.x, y: emp.y + ORIGEN.y };
  const dx = CENTRO.x - desde.x;
  const dy = CENTRO.y - desde.y;

  return (
    <motion.div
      className="absolute z-30"
      style={{ left: desde.x, top: desde.y }}
      initial={{ x: 0, y: 0, scale: 0.5, opacity: 0 }}
      animate={{
        x: dx,
        y: dy,
        scale: [0.5, 1, 0.95, 0.6],
        opacity: [0, 1, 1, 0], // funde al llegar
      }}
      transition={{
        x: { type: "spring", stiffness: 110, damping: 16 },
        y: { type: "spring", stiffness: 110, damping: 16 },
        opacity: { duration: T_VUELA / 1000, times: [0, 0.15, 0.7, 1] },
        scale: { duration: T_VUELA / 1000, times: [0, 0.3, 0.7, 1] },
      }}
    >
      <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-estado-entrego shadow-sm">
        <Check className="h-2.5 w-2.5 text-white" />
      </span>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */

function Check({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={3.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}
