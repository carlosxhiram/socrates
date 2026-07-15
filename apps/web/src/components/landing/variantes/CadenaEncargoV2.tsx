"use client";

import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

/**
 * "Cadena de encargo" (v2) — el gráfico estrella del Hero, versión con VIAJE.
 *
 * A diferencia de la v1 (una lista larga de nueve filas donde lo único que
 * pasaba eran palomitas encendiéndose), aquí el encargo es un OBJETO que se
 * mueve: un punto verde que se desliza por el riel de casilla en casilla, y
 * una sola casilla de especialista donde los seis rotan mientras hacen el
 * trabajo. Compacta (cuatro casillas visibles) y con espectáculo tranquilo.
 *
 * Isla DECORATIVA, pero el texto de cada casilla es real y legible para los
 * lectores de pantalla (riel, punto, nodos, halos y palomita van aria-hidden;
 * la casilla que rota expone su roster completo con un texto solo-lectura).
 *
 * Línea de tiempo del loop (~8.9 s, movimiento continuo, nunca frenético):
 *   0.00–0.85 s  el encargo aparece en "Tu encargo".
 *   0.85–1.70 s  el punto viaja a "Socratia · Gerente"; el riel se dibuja detrás.
 *   1.70–6.12 s  el punto llega a la casilla del especialista, que SE LEVANTA;
 *                los seis rotan (Diego → Hiram → Jair → Katya → María → Paula),
 *                ~0.72 s cada uno, con fundido y deslizamiento.
 *   6.12–8.32 s  el punto viaja al "Reporte…": la casilla se enciende con un
 *                brillo breve y la palomita se dibuja. Pausa de celebración.
 *   8.32–8.94 s  fundido suave; el punto regresa al inicio (invisible) y arranca.
 *
 * Doctrina de movimiento: un solo easing en todo lo decorativo, resorte suave
 * solo para el viaje del punto; se anima únicamente transform/opacity/pathLength;
 * el estado nunca depende solo del color (se refuerza con forma y elevación).
 */

// —— Geometría fija (px). El riel y las casillas comparten estas medidas para
//    que el punto aterrice EXACTO en el centro de cada casilla, sin medir el DOM.
const ALTURA_CASILLA = 60; // alto fijo de cada casilla
const ESPACIO = 20; // separación vertical entre casillas (gap-5)
const PASO_Y = ALTURA_CASILLA + ESPACIO; // 80: distancia entre centros
const centroDe = (nodo: number) => ALTURA_CASILLA / 2 + nodo * PASO_Y; // 30,110,190,270
const RIEL_INICIO = centroDe(0); // 30
const RIEL_LARGO = centroDe(3) - centroDe(0); // 240
const PUNTO = 14; // diámetro del punto viajero (coincide con h-3.5)

// —— Curvas: un solo easing decorativo; resorte suave solo para el viaje.
const SUAVE = [0.4, 0, 0.2, 1] as const;
const RESORTE = { type: "spring", stiffness: 130, damping: 22, mass: 0.9 } as const;

// —— La casilla de especialista rota entre estos seis (mismos roles y encargos
//    que la plantilla de la sección Equipo). Sin jerga técnica en superficie.
const ESPECIALISTAS = [
  { nombre: "Diego", rol: "Prospector", sub: "Califica al prospecto" },
  { nombre: "Hiram", rol: "Investigador", sub: "Arma el reporte con fuentes" },
  { nombre: "Jair", rol: "Asesor de Producto", sub: "Elige el financiamiento" },
  { nombre: "Katya", rol: "Negociadora", sub: "Prepara el acercamiento" },
  { nombre: "María", rol: "Trámites", sub: "Reúne los requisitos" },
  { nombre: "Paula", rol: "Gestora", sub: "Deja listo el seguimiento" },
];

// —— Guion del loop. Cada beat fija dónde está el punto (nodo 0–3), qué
//    especialista se ve (esp 0–5), si la casilla trabaja (levantada), si el
//    reporte se enciende (listo) y si estamos en el fundido de reinicio.
interface Beat {
  nodo: number;
  esp: number;
  trabaja: boolean;
  listo: boolean;
  atenuar: boolean;
  ms: number;
}

const GUION: Beat[] = [
  { nodo: 0, esp: 0, trabaja: false, listo: false, atenuar: false, ms: 850 }, // el encargo nace
  { nodo: 1, esp: 0, trabaja: false, listo: false, atenuar: false, ms: 850 }, // el gerente reparte
  { nodo: 2, esp: 0, trabaja: true, listo: false, atenuar: false, ms: 720 }, // Diego
  { nodo: 2, esp: 1, trabaja: true, listo: false, atenuar: false, ms: 720 }, // Hiram
  { nodo: 2, esp: 2, trabaja: true, listo: false, atenuar: false, ms: 720 }, // Jair
  { nodo: 2, esp: 3, trabaja: true, listo: false, atenuar: false, ms: 720 }, // Katya
  { nodo: 2, esp: 4, trabaja: true, listo: false, atenuar: false, ms: 720 }, // María
  { nodo: 2, esp: 5, trabaja: true, listo: false, atenuar: false, ms: 820 }, // Paula (cierra)
  { nodo: 3, esp: 5, trabaja: false, listo: true, atenuar: false, ms: 2200 }, // reporte listo + pausa
  { nodo: 3, esp: 5, trabaja: false, listo: true, atenuar: true, ms: 620 }, // fundido de reinicio
];

const FRAME_FIJO = 8; // beat que se congela con "menos movimiento": el reporte listo

export function CadenaEncargoV2() {
  const sinMovimiento = useReducedMotion();
  const [beat, setBeat] = useState(0);
  const [pausado, setPausado] = useState(false);
  const raiz = useRef<HTMLDivElement>(null);
  const enVista = useInView(raiz);
  // Recordamos el nodo anterior para distinguir el salto de reinicio (3 → 0),
  // que debe ser instantáneo e invisible (nunca un vuelo de regreso).
  const nodoPrevio = useRef(0);

  // Motor del loop: se detiene en hover (WCAG 2.2.2), con "menos movimiento" y
  // fuera de pantalla. Con "menos movimiento" congela la foto del reporte listo.
  useEffect(() => {
    if (sinMovimiento) {
      setBeat(FRAME_FIJO);
      return;
    }
    if (pausado || !enVista) return;
    const t = setTimeout(() => setBeat((b) => (b + 1) % GUION.length), GUION[beat].ms);
    return () => clearTimeout(t);
  }, [beat, pausado, enVista, sinMovimiento]);

  const g = GUION[beat];
  const animar = !sinMovimiento && !pausado && enVista;
  const retrocede = g.nodo < nodoPrevio.current; // solo el reinicio va hacia atrás
  useEffect(() => {
    nodoPrevio.current = g.nodo;
  }, [g.nodo]);

  const puntoY = centroDe(g.nodo) - PUNTO / 2;
  const rellenoFrac = sinMovimiento ? 1 : g.nodo / 3; // 0, ⅓, ⅔, 1

  return (
    <div
      ref={raiz}
      className="w-80 rounded-xl border border-oficina-borde bg-oficina-panel shadow-sm"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
    >
      {/* Encabezado editorial (mismo tono que el resto de la landing) */}
      <div className="border-b border-oficina-borde px-5 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-oficina-tenue">
          Cadena de encargo
        </p>
        <p className="mt-1 text-[12px] leading-snug text-oficina-tenue">
          De tu encargo al reporte, sin que muevas un dedo.
        </p>
      </div>

      {/* Escenario: el riel decorativo a la izquierda y las casillas reales a la
          derecha comparten la misma geometría fija. */}
      <div className="relative px-5 py-6">
        {/* —— Capa del riel + punto viajero (decorativa) —— */}
        <div aria-hidden className="pointer-events-none absolute inset-y-6 left-5 w-7">
          {/* Riel base (gris cálido) */}
          <span
            className="absolute w-[2px] -translate-x-1/2 rounded-full bg-oficina-borde"
            style={{ left: "50%", top: RIEL_INICIO, height: RIEL_LARGO }}
          />
          {/* Riel que se DIBUJA detrás del punto conforme avanza */}
          <motion.span
            className="absolute w-[2px] rounded-full bg-marca"
            style={{ left: "50%", top: RIEL_INICIO, height: RIEL_LARGO, transformOrigin: "top" }}
            initial={false}
            animate={{ x: "-50%", scaleY: rellenoFrac, opacity: g.atenuar ? 0 : 1 }}
            transition={{
              x: { duration: 0 },
              scaleY: retrocede || sinMovimiento ? { duration: 0 } : { duration: 0.7, ease: SUAVE },
              opacity: { duration: sinMovimiento ? 0 : 0.35, ease: SUAVE },
            }}
          />

          {/* Nodos-estación: se encienden (opacity) al ser alcanzados */}
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="absolute flex h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-oficina-borde bg-oficina-panel"
              style={{ left: "50%", top: centroDe(i) }}
            >
              <motion.span
                className={`absolute inset-0 rounded-full ${i === 3 ? "bg-estado-entrego" : "bg-marca"}`}
                initial={false}
                animate={{ opacity: sinMovimiento || g.nodo >= i ? 1 : 0 }}
                transition={{ duration: sinMovimiento ? 0 : 0.3, ease: SUAVE }}
              />
            </span>
          ))}

          {/* El encargo: el punto verde que viaja por el riel */}
          <motion.div
            className="absolute z-10 flex items-center justify-center rounded-full bg-marca shadow-sm"
            style={{ left: "50%", top: 0, height: PUNTO, width: PUNTO }}
            initial={false}
            animate={{ x: "-50%", y: puntoY, opacity: g.atenuar ? 0 : 1 }}
            transition={{
              x: { duration: 0 },
              y: retrocede || sinMovimiento ? { duration: 0 } : RESORTE,
              opacity: { duration: sinMovimiento ? 0 : 0.4, ease: SUAVE },
            }}
          >
            {/* Halo que respira mientras el encargo está en camino */}
            <motion.span
              className="absolute inset-0 rounded-full bg-marca/30"
              animate={animar ? { scale: [1, 1.9], opacity: [0.5, 0] } : { scale: 1, opacity: 0 }}
              transition={
                animar
                  ? { duration: 1.7, ease: "easeOut", repeat: Infinity }
                  : { duration: 0.3 }
              }
            />
            {/* Núcleo blanco: el punto no depende solo del color */}
            <span className="relative h-1.5 w-1.5 rounded-full bg-white" />
          </motion.div>
        </div>

        {/* —— Casillas reales (lista ordenada, texto accesible) —— */}
        <ol
          aria-label="Cadena de encargo: de tu encargo al reporte de inteligencia"
          className="relative flex flex-col gap-5 pl-10"
        >
          {[0, 1, 2, 3].map((i) => {
            const activa = sinMovimiento ? i === 3 : g.nodo === i;
            const esEspecialista = i === 2;
            const trabajando = esEspecialista && !sinMovimiento && g.trabaja;
            const levantada = esEspecialista ? trabajando : activa;
            const escala = trabajando ? 1.03 : activa ? 1.02 : 1;

            return (
              <motion.li
                key={i}
                className="relative flex items-center"
                style={{ height: ALTURA_CASILLA }}
                initial={false}
                animate={{ scale: escala, y: levantada ? -2 : 0 }}
                transition={{ duration: sinMovimiento ? 0 : 0.4, ease: SUAVE }}
              >
                {/* Sombra de elevación (aparece por opacity al levantarse) */}
                <motion.span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-xl shadow-[0_10px_26px_-8px_rgba(30,42,35,0.22)]"
                  initial={false}
                  animate={{ opacity: levantada ? 1 : 0 }}
                  transition={{ duration: sinMovimiento ? 0 : 0.4, ease: SUAVE }}
                />

                {/* La tarjeta */}
                <div className="relative flex h-full w-full items-center rounded-xl border border-oficina-borde bg-oficina-fondo px-4">
                  {i === 0 && (
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold leading-tight text-oficina-texto">
                        Tu encargo
                      </p>
                      <p className="mt-0.5 text-[11px] leading-tight text-oficina-tenue">
                        Tú lo pides
                      </p>
                    </div>
                  )}

                  {i === 1 && (
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold leading-tight text-oficina-texto">
                        Socratia
                        <span className="font-normal text-oficina-tenue"> · Gerente</span>
                      </p>
                      <p className="mt-0.5 text-[11px] leading-tight text-oficina-tenue">
                        Reparte el trabajo
                      </p>
                    </div>
                  )}

                  {i === 2 && (
                    <div className="relative h-full w-full">
                      {/* Roster completo, estable para lectores de pantalla */}
                      <span className="sr-only">
                        Tu equipo de especialistas: Diego, Hiram, Jair, Katya, María y Paula
                        hacen el trabajo.
                      </span>
                      {/* Rotación visual (decorativa): un especialista a la vez */}
                      <div aria-hidden className="absolute inset-0">
                        <AnimatePresence initial={false}>
                          <motion.div
                            key={g.esp}
                            className="absolute inset-0 flex flex-col justify-center"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: sinMovimiento ? 0 : 0.38, ease: SUAVE }}
                          >
                            <p className="text-[13px] font-semibold leading-tight text-oficina-texto">
                              {ESPECIALISTAS[g.esp].nombre}
                              <span className="font-normal text-oficina-tenue">
                                {" "}
                                · {ESPECIALISTAS[g.esp].rol}
                              </span>
                            </p>
                            <p className="mt-0.5 text-[11px] leading-tight text-oficina-tenue">
                              {ESPECIALISTAS[g.esp].sub}
                            </p>
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    </div>
                  )}

                  {i === 3 && (
                    <>
                      {/* Brillo breve cuando el reporte queda listo */}
                      {g.listo && !sinMovimiento && (
                        <motion.span
                          aria-hidden
                          className="pointer-events-none absolute -inset-1 rounded-2xl bg-estado-entrego/15"
                          initial={{ opacity: 0, scale: 0.92 }}
                          animate={{ opacity: [0, 0.55, 0], scale: [0.92, 1.05, 1.02] }}
                          transition={{ duration: 1.3, ease: SUAVE, times: [0, 0.35, 1] }}
                        />
                      )}
                      <div className="relative flex w-full items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[13px] font-bold leading-tight text-oficina-texto">
                            Reporte de inteligencia
                          </p>
                          <p className="mt-0.5 text-[11px] leading-tight text-estado-entrego">
                            Listo para tu revisión
                          </p>
                        </div>
                        {/* Sello de entrega: la palomita se dibuja al llegar */}
                        <span
                          aria-hidden
                          className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-oficina-borde"
                        >
                          <motion.span
                            className="absolute inset-0 rounded-full bg-estado-entrego"
                            initial={false}
                            animate={{ opacity: sinMovimiento || g.listo ? 1 : 0 }}
                            transition={{ duration: sinMovimiento ? 0 : 0.3, ease: SUAVE }}
                          />
                          <svg
                            viewBox="0 0 24 24"
                            className="relative h-4 w-4 text-white"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={3}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <motion.path
                              d="M5 13l4 4L19 7"
                              initial={{ pathLength: sinMovimiento ? 1 : 0 }}
                              animate={{ pathLength: sinMovimiento || g.listo ? 1 : 0 }}
                              transition={{
                                duration: g.listo && !sinMovimiento ? 0.42 : 0,
                                ease: SUAVE,
                              }}
                            />
                          </svg>
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
