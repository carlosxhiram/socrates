import Link from "next/link";
import { Check } from "lucide-react";
import { RevelarAlScroll } from "@/components/movimiento/RevelarAlScroll";
import { Eyebrow } from "./Eyebrow";

const INCLUYE = [
  "Tu equipo completo: los 6 especialistas",
  "Reportes de Inteligencia Financiera ilimitados",
  "Recomendaciones del catálogo SOC vigente",
  "Pitches y manejo de objeciones a medida",
  "Expedientes organizados por prospecto",
  "Soporte por correo en días hábiles",
];

export function SeccionPrecio() {
  return (
    <section
      id="precio"
      className="scroll-mt-16 border-t border-oficina-borde bg-oficina-fondo py-24 md:py-32"
    >
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <RevelarAlScroll className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
          {/* Texto izquierdo */}
          <div className="lg:col-span-5">
            <Eyebrow>precio</Eyebrow>
            <h2 className="mt-4 text-seccion text-oficina-texto">
              Un solo plan.
              <br />
              Todo incluido.
            </h2>
            <p className="mt-5 text-cuerpo-lg text-oficina-tenue">
              Sin niveles, sin módulos opcionales, sin sorpresas. Todo el equipo
              disponible desde el primer día.
            </p>
            {/* Ancla de valor: el precio contra la alternativa real */}
            <p className="mt-6 border-l-2 border-marca pl-4 text-base leading-relaxed text-oficina-texto">
              Un solo analista de verdad te costaría un sueldo. Aquí tienes al
              equipo completo por{" "}
              <span className="font-medium text-marca">$499 al mes</span>.
            </p>
          </div>

          {/* Tarjeta de precio */}
          <div className="lg:col-span-7">
            <div className="rounded-tarjeta border border-marca/30 bg-oficina-panel p-8">
              {/* Precio — cifra en mono tabular (precisión financiera) */}
              <div className="mb-6 flex items-baseline gap-2">
                <span className="font-mono text-5xl font-medium tabular-nums tracking-tight text-oficina-texto">
                  $499
                </span>
                <div className="leading-tight">
                  <span className="font-mono text-sm text-oficina-tenue">MXN</span>
                  <p className="text-xs text-oficina-tenue">por mes</p>
                </div>
              </div>

              {/* Prueba gratis badge */}
              <div className="mb-7 inline-flex items-center gap-2 rounded-full bg-estado-entrego/10 px-4 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-estado-entrego" />
                <span className="text-xs font-medium text-estado-entrego">
                  14 días de prueba gratis · Se requiere tarjeta
                </span>
              </div>

              {/* Lo que incluye */}
              <ul className="mb-8 space-y-3">
                {INCLUYE.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <Check
                      size={16}
                      className="mt-0.5 shrink-0 text-estado-entrego"
                      aria-hidden
                    />
                    <span className="text-sm text-oficina-texto">{item}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href="/crear-cuenta"
                className="flex h-control w-full items-center justify-center rounded-full bg-marca px-6 text-[15px] font-medium text-white transition-colors duration-200 ease-suave hover:bg-marca-fuerte active:bg-marca-fuerte focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marca focus-visible:ring-offset-2 focus-visible:ring-offset-oficina-panel"
              >
                Empieza tu prueba gratis
              </Link>
              <p className="mt-3 text-center text-xs text-oficina-tenue">
                Cancela en cualquier momento. Sin penalización.
              </p>
            </div>
          </div>
        </RevelarAlScroll>
      </div>
    </section>
  );
}
