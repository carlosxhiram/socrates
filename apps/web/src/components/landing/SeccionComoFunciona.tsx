import { RevelarAlScroll } from "@/components/movimiento/RevelarAlScroll";
import {
  ListaEscalonada,
  ElementoEscalonado,
} from "@/components/movimiento/ListaEscalonada";
import { Eyebrow } from "./Eyebrow";
import { ConversacionGerente } from "./variantes/ConversacionGerente";

const PASOS = [
  {
    numero: "1",
    titulo: "Dile qué necesitas",
    descripcion:
      "Escríbele en lenguaje normal, como a un colega. Sin formularios ni categorías.",
  },
  {
    numero: "2",
    titulo: "Sócrates reparte el trabajo",
    descripcion:
      "Convoca a los especialistas correctos y supervisa que cada uno cumpla.",
  },
  {
    numero: "3",
    titulo: "Recibes el entregable listo",
    descripcion:
      "Llega a tu oficina con fuentes. Tú decides si lo usas o pides ajustes.",
  },
];

export function SeccionComoFunciona() {
  return (
    <section
      id="como-funciona"
      className="scroll-mt-16 border-t border-oficina-borde bg-oficina-fondo py-24 md:py-32"
    >
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        {/* Encabezado — eyebrow → H2 */}
        <RevelarAlScroll className="mb-16">
          <Eyebrow>cómo funciona</Eyebrow>
          <h2 className="mt-4 max-w-2xl text-seccion text-oficina-texto">
            Tan simple como hablar con tu gerente.
          </h2>
        </RevelarAlScroll>

        {/* Dos columnas: los tres pasos como flujo numerado vertical (izquierda)
            y la conversación con Sócrates (derecha). En móvil se apilan. */}
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-2 lg:items-center lg:gap-16">
          {/* Columna izquierda — flujo numerado con riel vertical. No son
              tarjetas en caja: es una secuencia, composición distinta a las
              demás secciones (rompe la monotonía de rejillas). */}
          <div className="relative">
            {/* Riel que conecta los números (centro del círculo de 44px = 22px). */}
            <span
              aria-hidden
              className="absolute left-[22px] top-[22px] bottom-[22px] w-px -translate-x-1/2 bg-oficina-borde"
            />
            <ListaEscalonada className="relative flex flex-col gap-8">
              {PASOS.map(({ numero, titulo, descripcion }) => (
                <ElementoEscalonado key={numero} className="flex gap-5">
                  {/* Número mono en círculo — bg sólido para tapar el riel. */}
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-marca/40 bg-oficina-fondo font-mono text-base text-marca">
                    {numero}
                  </span>
                  <div className="pt-1.5">
                    <h3 className="text-base font-medium text-oficina-texto">
                      {titulo}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-oficina-tenue">
                      {descripcion}
                    </p>
                  </div>
                </ElementoEscalonado>
              ))}
            </ListaEscalonada>
          </div>

          {/* Columna derecha — la experiencia real: una conversación con
              Sócrates. Se monta DIRECTA (sin RevelarAlScroll): la conversación
              ya arranca sola al entrar en vista con su propio useInView; anidarla
              dentro de otro observador de scroll impedía que su loop despertara y
              dejaba el chat vacío. Clip en X: nunca scroll horizontal. */}
          <div className="flex justify-center overflow-x-clip">
            <ConversacionGerente />
          </div>
        </div>
      </div>
    </section>
  );
}
