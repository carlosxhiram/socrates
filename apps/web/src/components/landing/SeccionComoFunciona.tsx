import { RevelarAlScroll } from "@/components/movimiento/RevelarAlScroll";
import {
  ListaEscalonada,
  ElementoEscalonado,
} from "@/components/movimiento/ListaEscalonada";
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
    titulo: "Socratia reparte el trabajo",
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
    <section id="como-funciona" className="scroll-mt-14 border-t border-oficina-borde bg-oficina-fondo py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        {/* Encabezado */}
        <RevelarAlScroll className="mb-14">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-oficina-tenue">
            Cómo se siente usarlo
          </p>
          <h2 className="text-3xl font-black tracking-tight text-oficina-texto md:text-4xl">
            Tan simple como hablar con tu gerente.
          </h2>
        </RevelarAlScroll>

        {/* Layout de dos columnas: los tres pasos apilados verticalmente
            (izquierda) y la conversación con Socratia acompañándolos (derecha).
            En móvil se apilan: primero los pasos, luego la conversación. */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          {/* Columna izquierda — los tres pasos en cascada vertical. No
              colapsan: cada uno es su propia tarjeta, apiladas una sobre otra. */}
          <ListaEscalonada className="flex flex-col gap-4">
            {PASOS.map(({ numero, titulo, descripcion }) => (
              <ElementoEscalonado
                key={numero}
                className="relative rounded-xl border border-oficina-borde bg-oficina-panel p-5 lg:p-6"
              >
                {/* Barra lateral de acento en el primer paso */}
                {numero === "1" && (
                  <div
                    aria-hidden
                    className="absolute left-0 top-6 bottom-6 w-[3px] bg-marca rounded-r-full"
                  />
                )}

                {/* Número + título en la misma línea para compactar la altura */}
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-marca text-sm font-black text-marca">
                    {numero}
                  </div>
                  <h3 className="text-base font-bold text-oficina-texto">
                    {titulo}
                  </h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-oficina-tenue">
                  {descripcion}
                </p>
              </ElementoEscalonado>
            ))}
          </ListaEscalonada>

          {/* Columna derecha — la experiencia real: una conversación con
              Socratia. Se monta DIRECTA (sin RevelarAlScroll): la conversación
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
