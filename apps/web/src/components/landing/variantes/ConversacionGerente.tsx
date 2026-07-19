"use client";

import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
  type Variants,
} from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { EASE } from "@/lib/motion";

/**
 * "Conversación con el gerente" — variante del gráfico estrella del Hero.
 *
 * Cuenta la experiencia real del producto: le pides algo a Sócrates, tu
 * gerente, como a cualquier colega en la mensajería interna de la oficina, y
 * la oficina ENTERA se mueve por ti. Entra tu encargo, Sócrates contesta,
 * reparte el trabajo entre el equipo (cada quien pasa de "trabajando" a
 * "listo") y te entrega el reporte. Luego la charla se desvanece y renace.
 *
 * Doctrina de movimiento: solo transform/opacity; un mismo easing en las
 * transiciones y springs suaves para las burbujas y la tarjeta. Se pausa al
 * pasar el cursor (WCAG 2.2.2), se apaga fuera de pantalla (useInView) y con
 * "menos movimiento" se congela en una foto con la conversación completa y la
 * tarjeta final. El texto de las burbujas es real y legible; lo decorativo va
 * marcado como aria-hidden. Es mensajería interna premium, NO un chatbot:
 * Sócrates es una persona (tu gerente), no un asistente.
 */

// Ritmo del guion (ms). Suma ≈ 11.75 s de principio a fin.
const T = {
  INICIO: 450, // beat en vacío antes de la primera burbuja
  LEER_ASESOR: 1300, // tu encargo en pantalla
  TIPEO: 1500, // Sócrates "escribiendo…"
  LEER_SOC1: 1500, // Sócrates reparte el trabajo
  DELEGACION: 2800, // los chips entran y pasan a "listo"
  LEER_SOC2: 1000, // Sócrates avisa que ya está
  PAUSA: 2600, // celebración con la tarjeta a la vista
  SALIDA: 600, // la conversación se desvanece antes de renacer
} as const;

// Dwell antes de avanzar desde cada paso (0..5). El paso 6 (tarjeta) usa PAUSA.
const DWELL = [
  T.INICIO,
  T.LEER_ASESOR,
  T.TIPEO,
  T.LEER_SOC1,
  T.DELEGACION,
  T.LEER_SOC2,
] as const;

const PASO_TARJETA = 6;

// Springs suaves reutilizables.
const RESORTE_BURBUJA = {
  type: "spring",
  stiffness: 340,
  damping: 30,
  mass: 0.9,
} as const;
const RESORTE_TARJETA = {
  type: "spring",
  stiffness: 300,
  damping: 24,
  mass: 1,
} as const;
const RESORTE_CHIP = { type: "spring", stiffness: 420, damping: 30 } as const;


interface Encargado {
  nombre: string;
  rol: string;
}

// Equipo ficticio. "Grupo Andrade" es un prospecto genérico de ejemplo; no se
// nombra ninguna institución ni producto financiero (el catálogo es sagrado).
const EQUIPO: Encargado[] = [
  { nombre: "Hiram", rol: "Investigador" },
  { nombre: "Jair", rol: "Asesor de Producto" },
  { nombre: "Katya", rol: "Negociadora" },
];

export function ConversacionGerente() {
  const sinMovimiento = useReducedMotion();
  const estatico = Boolean(sinMovimiento);

  const [paso, setPaso] = useState(0);
  const [saliendo, setSaliendo] = useState(false);
  const [ciclo, setCiclo] = useState(0); // remonta la lista limpia en cada vuelta
  const [pausado, setPausado] = useState(false);

  const raiz = useRef<HTMLDivElement>(null);
  const enVista = useInView(raiz, { amount: 0.3 });

  // Los loops decorativos (puntitos, latido de presencia) solo laten cuando de
  // verdad se está viendo y no hay pausa: así el hover congela TODO el cuadro.
  const animar = !estatico && enVista && !pausado;

  // Motor del guion. La salida (desvanecido) se completa aunque haya hover,
  // para no quedar atorado en invisible; lo demás se congela con el cursor.
  useEffect(() => {
    if (estatico) return;
    if (saliendo) {
      const t = setTimeout(() => {
        setPaso(0);
        setCiclo((c) => c + 1);
        setSaliendo(false);
      }, T.SALIDA);
      return () => clearTimeout(t);
    }
    if (pausado || !enVista) return;
    if (paso >= PASO_TARJETA) {
      const t = setTimeout(() => setSaliendo(true), T.PAUSA);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setPaso((p) => p + 1), DWELL[paso]);
    return () => clearTimeout(t);
  }, [paso, saliendo, pausado, enVista, estatico]);

  // Qué se ve en cada momento (en foto fija se ve todo menos el "escribiendo…").
  const verAsesor = estatico || paso >= 1;
  const verTipeo = !estatico && paso === 2;
  const verSoc1 = estatico || paso >= 3;
  const verChips = estatico || paso >= 4;
  const verSoc2 = estatico || paso >= 5;
  const verTarjeta = estatico || paso >= 6;

  return (
    <div
      ref={raiz}
      className="w-80 overflow-hidden rounded-xl border border-oficina-borde bg-oficina-panel shadow-sm sm:w-96"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
    >
      {/* Encabezado: un mensaje directo con tu gerente */}
      <div className="flex items-center gap-3 border-b border-oficina-borde px-4 py-3">
        <Avatar tam="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="text-[13px] font-semibold text-oficina-texto">
              Sócrates
            </p>
            <PuntoPresencia animar={animar} />
          </div>
          <p className="text-[11px] text-oficina-tenue">
            Gerente · En la oficina
          </p>
        </div>
        <span
          aria-hidden
          className="text-[10px] font-medium uppercase tracking-widest text-oficina-tenue"
        >
          Interno
        </span>
      </div>

      {/* Cuerpo: la conversación. Anclada abajo; lo viejo sube y se recorta. */}
      <div className="relative">
        {/* Difuminado superior: los mensajes se desvanecen al subir */}
        {!estatico && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 z-10 h-8 bg-gradient-to-b from-oficina-panel to-transparent"
          />
        )}
        <motion.div
          animate={{ opacity: saliendo ? 0 : 1 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <ol
            key={ciclo}
            aria-label="Conversación con Sócrates, tu gerente"
            className={
              estatico
                ? "flex flex-col gap-3 px-4 py-4"
                : "flex h-[19rem] flex-col justify-end gap-3 overflow-hidden px-4 py-4"
            }
          >
            <AnimatePresence initial={false}>
              {verAsesor && (
                <Mensaje key="asesor" lado="asesor" estatico={estatico}>
                  Sócrates, prepárame a Grupo Andrade para el martes.
                </Mensaje>
              )}
              {verTipeo && <Tipeo key="tipeo" animar={animar} />}
              {verSoc1 && (
                <Mensaje key="soc1" lado="socrates" estatico={estatico}>
                  Claro. Le encargo la investigación a Hiram y el financiamiento
                  a Jair.
                </Mensaje>
              )}
              {verChips && (
                <Delegacion key="chips" estatico={estatico} animar={animar} />
              )}
              {verSoc2 && (
                <Mensaje key="soc2" lado="socrates" estatico={estatico}>
                  Listo, aquí lo tienes.
                </Mensaje>
              )}
              {verTarjeta && <Tarjeta key="tarjeta" estatico={estatico} />}
            </AnimatePresence>
          </ol>
        </motion.div>
      </div>

      {/* Redactor decorativo: refuerza que es mensajería, no un formulario */}
      <div
        aria-hidden
        className="flex items-center gap-2 border-t border-oficina-borde px-3 py-2.5"
      >
        <div className="flex-1 rounded-full border border-oficina-borde bg-oficina-fondo px-3.5 py-2 text-[12px] text-oficina-tenue">
          Escríbele a Sócrates…
        </div>
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-marca text-white">
          <IconoEnviar />
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Piezas                                                              */
/* ------------------------------------------------------------------ */

function Avatar({ tam }: { tam: "sm" | "lg" }) {
  const medida = tam === "lg" ? "h-8 w-8 text-[12px]" : "h-6 w-6 text-[10px]";
  return (
    <span
      aria-hidden
      className={`grid shrink-0 place-items-center rounded-full bg-marca font-bold text-white ${medida}`}
    >
      S
    </span>
  );
}

// Latido de presencia: "está en la oficina, disponible". Se detiene en pausa.
function PuntoPresencia({ animar }: { animar: boolean }) {
  return (
    <span aria-hidden className="relative flex h-2 w-2">
      {animar && (
        <motion.span
          className="absolute inline-flex h-full w-full rounded-full bg-estado-entrego/50"
          animate={{ scale: [1, 2.4], opacity: [0.55, 0] }}
          transition={{ duration: 1.9, ease: "easeOut", repeat: Infinity }}
        />
      )}
      <span className="relative inline-flex h-2 w-2 rounded-full bg-estado-entrego" />
    </span>
  );
}

interface MensajeProps {
  lado: "asesor" | "socrates";
  estatico: boolean;
  children: ReactNode;
}

function Mensaje({ lado, estatico, children }: MensajeProps) {
  const asesor = lado === "asesor";
  return (
    <motion.li
      initial={estatico ? false : { opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2, ease: EASE } }}
      transition={estatico ? { duration: 0 } : RESORTE_BURBUJA}
      className={`flex items-end gap-2 ${asesor ? "justify-end" : "justify-start"}`}
    >
      {!asesor && <Avatar tam="sm" />}
      <div
        className={`max-w-[80%] px-3.5 py-2.5 text-[13px] leading-snug ${
          asesor
            ? "rounded-2xl rounded-br-md bg-marca text-white"
            : "rounded-2xl rounded-bl-md border border-oficina-borde bg-oficina-fondo text-oficina-texto"
        }`}
      >
        {children}
      </div>
    </motion.li>
  );
}

// Indicador de "escribiendo…" de Sócrates — tres puntitos con plop escalonado.
function Tipeo({ animar }: { animar: boolean }) {
  return (
    <motion.li
      aria-hidden
      initial={{ opacity: 0, scale: 0.95, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.18, ease: EASE } }}
      transition={RESORTE_BURBUJA}
      className="flex items-end justify-start gap-2"
    >
      <Avatar tam="sm" />
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-oficina-borde bg-oficina-fondo px-3.5 py-3">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-oficina-tenue"
            animate={
              animar ? { y: [0, -3, 0], opacity: [0.4, 1, 0.4] } : { opacity: 0.5 }
            }
            transition={
              animar
                ? {
                    duration: 0.9,
                    ease: "easeInOut",
                    repeat: Infinity,
                    delay: i * 0.15,
                  }
                : { duration: 0 }
            }
          />
        ))}
      </div>
    </motion.li>
  );
}

// La delegación se VE: fila de chips que entran escalonados bajo la burbuja.
const CONTENEDOR_CHIPS: Variants = {
  oculto: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};
const ENTRADA_CHIP: Variants = {
  oculto: { opacity: 0, y: 8, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: RESORTE_CHIP },
};

function Delegacion({
  estatico,
  animar,
}: {
  estatico: boolean;
  animar: boolean;
}) {
  return (
    <motion.li
      initial={false}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.2, ease: EASE } }}
      transition={estatico ? { duration: 0 } : { duration: 0.3, ease: EASE }}
      className="flex justify-start pl-8"
    >
      <motion.div
        variants={estatico ? undefined : CONTENEDOR_CHIPS}
        initial={estatico ? false : "oculto"}
        animate={estatico ? undefined : "visible"}
        className="flex flex-wrap gap-1.5"
      >
        {EQUIPO.map((persona, i) => (
          <Chip
            key={persona.nombre}
            persona={persona}
            indice={i}
            estatico={estatico}
            animar={animar}
          />
        ))}
      </motion.div>
    </motion.li>
  );
}

function Chip({
  persona,
  indice,
  estatico,
  animar,
}: {
  persona: Encargado;
  indice: number;
  estatico: boolean;
  animar: boolean;
}) {
  // Cada encargado arranca "trabajando" y pasa a "listo" uno tras otro.
  const [listo, setListo] = useState(estatico);
  useEffect(() => {
    if (estatico) return;
    const t = setTimeout(() => setListo(true), 850 + indice * 500);
    return () => clearTimeout(t);
  }, [estatico, indice]);

  return (
    <motion.span
      variants={estatico ? undefined : ENTRADA_CHIP}
      className="inline-flex items-center gap-1.5 rounded-full border border-oficina-borde bg-oficina-fondo py-1 pl-1.5 pr-3"
    >
      <EstadoEncargo listo={listo} animar={animar} />
      <span className="text-[11px] leading-none">
        <span className="font-semibold text-oficina-texto">
          {persona.nombre}
        </span>
        <span className="text-oficina-tenue"> · {persona.rol}</span>
      </span>
    </motion.span>
  );
}

// El círculo de estado del encargo: puntito que late → palomita que aparece.
function EstadoEncargo({
  listo,
  animar,
}: {
  listo: boolean;
  animar: boolean;
}) {
  return (
    <span aria-hidden className="relative grid h-5 w-5 place-items-center">
      <AnimatePresence initial={false} mode="wait">
        {listo ? (
          <motion.span
            key="listo"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 22 }}
            className="grid h-5 w-5 place-items-center rounded-full bg-estado-entrego text-white"
          >
            <IconoPalomita className="h-3 w-3" />
          </motion.span>
        ) : (
          <motion.span
            key="trabajando"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.15 } }}
            className="grid h-5 w-5 place-items-center rounded-full border border-oficina-borde bg-oficina-panel"
          >
            <motion.span
              className="h-1.5 w-1.5 rounded-full bg-marca"
              animate={
                animar ? { scale: [1, 0.5, 1], opacity: [1, 0.4, 1] } : { scale: 1 }
              }
              transition={
                animar
                  ? { duration: 1, ease: "easeInOut", repeat: Infinity }
                  : { duration: 0 }
              }
            />
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

// LA ENTREGA: tarjeta de entregable, con presencia (spring, sombra, más grande).
function Tarjeta({ estatico }: { estatico: boolean }) {
  return (
    <motion.li
      initial={estatico ? false : { opacity: 0, scale: 0.9, y: 14 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2, ease: EASE } }}
      transition={estatico ? { duration: 0 } : RESORTE_TARJETA}
      className="flex justify-start pl-8"
    >
      <div className="w-full max-w-[92%] overflow-hidden rounded-xl border border-oficina-borde bg-oficina-panel shadow-md">
        <div className="flex items-start gap-3 px-3.5 pb-3 pt-3.5">
          <span
            aria-hidden
            className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-marca-suave text-marca"
          >
            <IconoReporte />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-oficina-tenue">
              Entregable
            </p>
            <p className="mt-0.5 text-[13px] font-bold leading-tight text-oficina-texto">
              Reporte de inteligencia
            </p>
            <p className="text-[12px] leading-tight text-oficina-tenue">
              Grupo Andrade
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 border-t border-oficina-borde bg-oficina-fondo px-3.5 py-2 text-estado-entrego">
          <IconoPalomita className="h-3.5 w-3.5" />
          <span className="text-[11px] font-semibold">
            Listo para tu revisión
          </span>
        </div>
      </div>
    </motion.li>
  );
}

/* ------------------------------------------------------------------ */
/* Íconos (decorativos)                                                */
/* ------------------------------------------------------------------ */

function IconoPalomita({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

function IconoReporte() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6M9 16.5h6" />
    </svg>
  );
}

function IconoEnviar() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M22 2 11 13" />
      <path d="M22 2 15 22l-4-9-9-4z" />
    </svg>
  );
}
