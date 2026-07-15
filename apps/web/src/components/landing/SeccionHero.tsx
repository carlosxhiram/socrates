import Link from "next/link";

export function SeccionHero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-24 md:pt-40 md:pb-32">
      {/* Línea vertical de marca — columna editorial */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 h-full w-1 bg-marca"
      />

      {/* Cuadrícula de fondo muy sutil — papel milimétrico financiero */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, #e3e7ed 1px, transparent 1px), linear-gradient(to bottom, #e3e7ed 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          opacity: 0.35,
        }}
      />

      <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Texto principal — 7 columnas */}
          <div className="lg:col-span-7">
            {/* Etiqueta institucional */}
            <div className="mb-6 inline-flex items-center gap-2 rounded border border-oficina-borde bg-oficina-panel px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-estado-entrego" />
              <span className="text-[11px] font-medium uppercase tracking-widest text-oficina-tenue">
                Para asesores de crédito empresarial
              </span>
            </div>

            {/* Titular */}
            <h1 className="text-4xl font-black leading-[1.05] tracking-tight text-oficina-texto md:text-5xl xl:text-6xl">
              Contrata un equipo completo para tu oficina.{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-marca">Por $499 al mes.</span>
                {/* Subrayado editorial */}
                <span
                  aria-hidden
                  className="absolute -bottom-1 left-0 right-0 h-[3px] bg-marca/20"
                />
              </span>
            </h1>

            {/* Subtítulo */}
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-oficina-tenue">
              Un investigador, un negociador, un gestor y tres especialistas más:
              seis empleados que se integran a tu oficina y hacen el trabajo pesado
              que hoy haces tú —o le pagas a alguien—. Tú solo revisas y firmas.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/crear-cuenta"
                className="inline-flex items-center justify-center rounded-md bg-marca px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-marca-fuerte"
              >
                Empieza tu prueba gratis
              </Link>
              <span className="text-sm text-oficina-tenue">
                14 días gratis · Cancela cuando quieras
              </span>
            </div>
          </div>

          {/* Bloque decorativo derecho — 5 columnas */}
          <div className="hidden lg:col-span-5 lg:flex lg:items-start lg:justify-end lg:pt-4">
            <div className="relative">
              {/* Tarjeta principal decorativa: simula el reporte de inteligencia */}
              <div className="w-72 rounded-xl border border-oficina-borde bg-oficina-panel p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-oficina-tenue">
                    Reporte de Inteligencia
                  </span>
                  <span className="rounded-full bg-estado-entrego/10 px-2 py-0.5 text-[10px] font-semibold text-estado-entrego">
                    Listo
                  </span>
                </div>
                <div className="space-y-3">
                  {[
                    { label: "Empresa", valor: "Grupo Empresarial ····" },
                    { label: "Sector", valor: "Manufactura PYME" },
                    { label: "Producto sugerido", valor: "Crédito Revolvente" },
                    { label: "Institución", valor: "Catálogo SOC" },
                  ].map(({ label, valor }) => (
                    <div key={label}>
                      <p className="text-[10px] font-medium uppercase tracking-wider text-oficina-tenue">
                        {label}
                      </p>
                      <p className="text-sm font-semibold text-oficina-texto">{valor}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-5 border-t border-oficina-borde pt-4">
                  <p className="text-[10px] text-oficina-tenue">
                    Preparado por el equipo Socratia · Revisión pendiente del asesor
                  </p>
                </div>
              </div>

              {/* Chip flotante — el Negociador terminó */}
              <div className="absolute -bottom-4 -left-8 flex items-center gap-2 rounded-lg border border-oficina-borde bg-oficina-panel px-3 py-2 shadow-md">
                <span className="text-base" aria-hidden>🤝</span>
                <div>
                  <p className="text-[11px] font-semibold text-oficina-texto">El Negociador</p>
                  <p className="text-[10px] text-estado-entrego">Pitch listo</p>
                </div>
              </div>

              {/* Chip flotante — el Investigador trabajando */}
              <div className="absolute -top-4 -right-6 flex items-center gap-2 rounded-lg border border-oficina-borde bg-oficina-panel px-3 py-2 shadow-md">
                <span className="text-base" aria-hidden>🔍</span>
                <div>
                  <p className="text-[11px] font-semibold text-oficina-texto">El Investigador</p>
                  <p className="text-[10px] text-marca">En proceso</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
