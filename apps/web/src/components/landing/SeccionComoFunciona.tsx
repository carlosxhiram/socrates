import { RevelarAlScroll } from "@/components/movimiento/RevelarAlScroll";
import {
  ListaEscalonada,
  ElementoEscalonado,
} from "@/components/movimiento/ListaEscalonada";

const PASOS = [
  {
    numero: "1",
    titulo: "Dile qué necesitas",
    descripcion:
      "Escríbele a Sócrates en lenguaje normal: el nombre del prospecto, la oportunidad, lo que quieres lograr. Sin formularios ni categorías.",
    ejemplo: '"Analiza a Transportes Garza y dime qué producto le conviene."',
  },
  {
    numero: "2",
    titulo: "Sócrates reparte el trabajo",
    descripcion:
      "Él identifica qué especialistas necesita, los convoca en el orden correcto y supervisa que cada uno entregue lo que prometió.",
    ejemplo: "Hiram, Jair y Katya.",
  },
  {
    numero: "3",
    titulo: "Recibes el entregable listo para revisar",
    descripcion:
      "Cada entregable llega a tu oficina numerado, con fuentes y con una nota de Sócrates sobre lo que revisó. Tú decides si lo usas tal cual o pides ajustes.",
    ejemplo: "Reporte de Inteligencia Financiera · Catálogo de productos · Pitch.",
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
            Tan simple como hablar con un gerente.
          </h2>
        </RevelarAlScroll>

        {/* Pasos */}
        <ListaEscalonada className="grid grid-cols-1 gap-0 lg:grid-cols-3 lg:gap-px lg:bg-oficina-borde lg:rounded-xl lg:overflow-hidden">
          {PASOS.map(({ numero, titulo, descripcion, ejemplo }) => (
            <ElementoEscalonado
              key={numero}
              className="relative bg-oficina-panel p-8 lg:p-10"
            >
              {/* Barra lateral de acento en el primer paso */}
              {numero === "1" && (
                <div
                  aria-hidden
                  className="absolute left-0 top-8 bottom-8 w-[3px] bg-marca rounded-r-full"
                />
              )}

              {/* Número */}
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-full border-2 border-marca text-sm font-black text-marca">
                {numero}
              </div>

              <h3 className="mb-3 text-base font-bold text-oficina-texto">
                {titulo}
              </h3>
              <p className="mb-4 text-sm leading-relaxed text-oficina-tenue">
                {descripcion}
              </p>

              {/* Cita de ejemplo */}
              <div className="rounded-lg border border-oficina-borde bg-oficina-fondo px-4 py-3">
                <p className="text-xs italic text-oficina-tenue">{ejemplo}</p>
              </div>
            </ElementoEscalonado>
          ))}
        </ListaEscalonada>
      </div>
    </section>
  );
}
