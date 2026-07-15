import { ShieldCheck, BookOpen, MessageSquare } from "lucide-react";
import { RevelarAlScroll } from "@/components/movimiento/RevelarAlScroll";
import {
  ListaEscalonada,
  ElementoEscalonado,
} from "@/components/movimiento/ListaEscalonada";

const PILARES = [
  {
    Icono: BookOpen,
    titulo: "Anclado al catálogo real",
    descripcion:
      "Cada recomendación de producto está amarrada al catálogo vigente de instituciones aliadas de SOC. Sócrates no inventa opciones: propone lo que existe y lo que es elegible para ese prospecto.",
  },
  {
    Icono: ShieldCheck,
    titulo: "Revisión humana antes de entregar",
    descripcion:
      "Todo entregable llega a tu oficina con estado \"Pendiente de revisión\". Nada sale al prospecto sin tu visto bueno. Tú firmas, tú decides.",
  },
  {
    Icono: MessageSquare,
    titulo: "Lenguaje de oficina, no de software",
    descripcion:
      "Los reportes y cotizaciones usan el vocabulario que ya conoce tu prospecto: tasa, plazo, garantía, requisitos. Sin tecnicismos de tecnología, sin plantillas genéricas.",
  },
];

export function SeccionConfianza() {
  return (
    <section className="border-t border-oficina-borde bg-oficina-panel py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        {/* Encabezado — dos columnas editoriales */}
        <RevelarAlScroll className="mb-14 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-6">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-oficina-tenue">
              Por qué confiar
            </p>
            <h2 className="text-3xl font-black leading-tight tracking-tight text-oficina-texto md:text-4xl">
              Rigor financiero desde
              <br />
              el primer reporte.
            </h2>
          </div>
          <div className="lg:col-span-6">
            <p className="max-w-md text-base leading-relaxed text-oficina-tenue">
              Diseñado para el crédito empresarial PYME en México. Cada proceso
              respeta el flujo real del asesor: primero explorar, luego proponer,
              siempre con el asesor en control.
            </p>
          </div>
        </RevelarAlScroll>

        {/* Pilares */}
        <ListaEscalonada className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {PILARES.map(({ Icono, titulo, descripcion }) => (
            <ElementoEscalonado
              key={titulo}
              className="rounded-xl border border-oficina-borde bg-oficina-fondo p-6"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-marca text-white">
                <Icono size={20} aria-hidden />
              </div>
              <h3 className="mb-2 text-sm font-bold text-oficina-texto">
                {titulo}
              </h3>
              <p className="text-sm leading-relaxed text-oficina-tenue">
                {descripcion}
              </p>
            </ElementoEscalonado>
          ))}
        </ListaEscalonada>

        {/* Nota institucional */}
        <RevelarAlScroll className="mt-10 flex items-start gap-3 rounded-xl border border-marca/20 bg-marca/5 px-6 py-5">
          <span className="mt-0.5 text-xl" aria-hidden>🐢</span>
          <p className="text-sm leading-relaxed text-oficina-texto">
            <span className="font-semibold">Sócrates es un gerente, no un oráculo.</span>{" "}
            Trabaja con la información que le das, cita sus fuentes y te dice cuando
            algo necesita verificación adicional. La experiencia y el juicio del asesor
            siempre tienen la última palabra.
          </p>
        </RevelarAlScroll>
      </div>
    </section>
  );
}
