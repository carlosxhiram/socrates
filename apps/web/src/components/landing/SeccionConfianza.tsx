import { ShieldCheck, BookOpen, MessageSquare } from "lucide-react";
import { RevelarAlScroll } from "@/components/movimiento/RevelarAlScroll";
import { Eyebrow } from "./Eyebrow";
import { Logo } from "@/components/marca/Logo";

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
    <section className="border-t border-oficina-borde bg-oficina-panel py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        {/* Encabezado — eyebrow → H2, dos columnas editoriales */}
        <RevelarAlScroll className="mb-14 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-6">
            <Eyebrow>tu resguardo</Eyebrow>
            <h2 className="mt-4 text-seccion text-oficina-texto">
              Rigor financiero desde
              <br />
              el primer reporte.
            </h2>
          </div>
          <div className="lg:col-span-6">
            <p className="max-w-md text-cuerpo-lg text-oficina-tenue">
              Diseñado para el crédito empresarial PYME en México. Cada proceso
              respeta el flujo real del asesor: primero explorar, luego proponer,
              siempre con el asesor en control.
            </p>
          </div>
        </RevelarAlScroll>

        {/* Pilares — panel único segmentado por hairlines (no tarjetas sueltas:
            composición distinta a la plantilla, para no repetir la misma reja). */}
        <RevelarAlScroll className="grid grid-cols-1 gap-px overflow-hidden rounded-tarjeta border border-oficina-borde bg-oficina-borde md:grid-cols-3">
          {PILARES.map(({ Icono, titulo, descripcion }) => (
            <div key={titulo} className="bg-oficina-panel p-7 md:p-8">
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-interno bg-marca/10 text-marca">
                <Icono size={20} aria-hidden />
              </div>
              <h3 className="text-base font-medium text-oficina-texto">
                {titulo}
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-oficina-tenue">
                {descripcion}
              </p>
            </div>
          ))}
        </RevelarAlScroll>

        {/* Nota institucional — el logomark real reemplaza al emoji */}
        <RevelarAlScroll className="mt-10 flex items-start gap-4 rounded-tarjeta border border-marca/20 bg-marca/[0.05] px-6 py-5">
          <Logo size={28} className="mt-0.5 shrink-0" />
          <p className="text-sm leading-relaxed text-oficina-texto">
            <span className="font-medium">Sócrates es tu gerente, no un oráculo.</span>{" "}
            Trabaja con la información que le das, cita sus fuentes y te dice cuando
            algo necesita verificación adicional. La experiencia y el juicio del asesor
            siempre tienen la última palabra.
          </p>
        </RevelarAlScroll>
      </div>
    </section>
  );
}
