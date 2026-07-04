import Link from "next/link";
import { Check } from "lucide-react";

const INCLUYE = [
  "Acceso a los 6 especialistas del equipo",
  "Reportes de Inteligencia Financiera ilimitados",
  "Recomendaciones del catálogo SOC vigente",
  "Pitches y manejo de objeciones a medida",
  "Expedientes organizados por prospecto",
  "Soporte por correo en días hábiles",
];

export function SeccionPrecio() {
  return (
    <section className="border-t border-oficina-borde bg-oficina-fondo py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
          {/* Texto izquierdo */}
          <div className="lg:col-span-5">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-oficina-tenue">
              Tu plan
            </p>
            <h2 className="mb-4 text-3xl font-black tracking-tight text-oficina-texto md:text-4xl">
              Un solo plan.
              <br />
              Todo incluido.
            </h2>
            <p className="text-base leading-relaxed text-oficina-tenue">
              Sin niveles, sin módulos opcionales, sin sorpresas. Todo el equipo
              de Sócrates disponible desde el primer día.
            </p>
          </div>

          {/* Tarjeta de precio */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border-2 border-marca bg-oficina-panel p-8 shadow-sm">
              {/* Precio */}
              <div className="mb-6 flex items-baseline gap-2">
                <span className="text-5xl font-black text-oficina-texto">$499</span>
                <div>
                  <span className="text-sm font-medium text-oficina-tenue">MXN</span>
                  <p className="text-xs text-oficina-tenue">por mes</p>
                </div>
              </div>

              {/* Prueba gratis badge */}
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-estado-entrego/10 px-4 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-estado-entrego" />
                <span className="text-xs font-semibold text-estado-entrego">
                  14 días de prueba gratis · Se requiere tarjeta
                </span>
              </div>

              {/* Lo que incluye */}
              <ul className="mb-8 space-y-2.5">
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
                href="/oficina"
                className="block w-full rounded-md bg-marca px-6 py-3.5 text-center text-sm font-semibold text-white transition-colors hover:bg-marca-fuerte"
              >
                Empieza tu prueba gratis
              </Link>
              <p className="mt-3 text-center text-xs text-oficina-tenue">
                Cancela en cualquier momento. Sin penalización.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
