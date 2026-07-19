import Link from "next/link";
import { ReporteSeArma } from "./variantes/ReporteSeArma";

export function SeccionHero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-24 md:pt-40 md:pb-32">
      {/* Glow ambiental — el ÚNICO gradiente del sitio, verde salvia a baja
          opacidad, solo en la parte alta del hero (truco Resend/Raycast). */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px]"
        style={{
          background:
            "radial-gradient(60% 60% at 28% -8%, rgba(129, 176, 154, 0.22), transparent 68%)",
        }}
      />

      {/* Línea vertical de marca — columna editorial */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 h-full w-[3px] bg-marca"
      />

      {/* Cuadrícula de fondo muy sutil — papel milimétrico, tinta cálida (no azul). */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(27, 38, 33, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(27, 38, 33, 0.05) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(120% 90% at 30% 0%, #000 40%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(120% 90% at 30% 0%, #000 40%, transparent 80%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Texto principal — 7 columnas */}
          <div className="lg:col-span-7">
            {/* Etiqueta institucional — pill hairline con registro mono */}
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-oficina-borde bg-oficina-panel px-3.5 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-estado-entrego" />
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-oficina-tinta/60">
                Para asesores de crédito empresarial
              </span>
            </div>

            {/* Titular — peso 500 (nunca bold), tracking negativo, line-height ~1 */}
            <h1 className="animate-entrada-hero text-display text-oficina-texto">
              Contrata un equipo completo para tu oficina.{" "}
              <span className="relative inline-block text-marca">
                Por $499 al mes.
                {/* Subrayado editorial suave */}
                <span
                  aria-hidden
                  className="absolute -bottom-1 left-0 right-0 h-[3px] rounded-full bg-marca/25"
                />
              </span>
            </h1>

            {/* Subtítulo */}
            <p className="animate-entrada-hero-tarde mt-6 max-w-xl text-cuerpo-lg text-oficina-tenue">
              Un investigador, un negociador, un gestor y tres especialistas más:
              seis empleados que se integran a tu oficina y hacen el trabajo pesado
              que hoy haces tú —o le pagas a alguien—. Tú solo revisas y firmas.
            </p>

            {/* CTAs */}
            <div className="animate-entrada-hero-tarde mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link
                href="/crear-cuenta"
                className="inline-flex h-control items-center justify-center rounded-full bg-marca px-7 text-[15px] font-medium text-white transition-colors duration-200 ease-suave hover:bg-marca-fuerte active:bg-marca-fuerte focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marca focus-visible:ring-offset-2 focus-visible:ring-offset-oficina-fondo"
              >
                Empieza tu prueba gratis
              </Link>
              <span className="font-mono text-[13px] text-oficina-tinta/60">
                14 días gratis · Cancela cuando quieras
              </span>
            </div>
          </div>

          {/* Bloque decorativo derecho — el Reporte que se arma solo (5 columnas).
              Centrado en el vacío de la derecha, no pegado al borde. */}
          <div className="hidden lg:col-span-5 lg:flex lg:items-center lg:justify-center">
            <ReporteSeArma />
          </div>
        </div>
      </div>
    </section>
  );
}
