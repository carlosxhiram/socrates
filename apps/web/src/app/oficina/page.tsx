/**
 * P-1 La Oficina — la vista raíz (FR-5, UX P-2).
 * Panel "Tu equipo" + lista de Expedientes con progreso + barra de Sócrates.
 * Renderiza el seed (Las Aliadas, Probemedic) vía la api.
 */
import { obtenerExpedientes, obtenerEquipo, apiViva } from "@/lib/api-client";
import { PanelEquipo } from "@/components/oficina/PanelEquipo";
import { TarjetaExpediente } from "@/components/oficina/TarjetaExpediente";
import { NuevoExpediente } from "@/components/oficina/NuevoExpediente";
import { BarraComando } from "@/components/socrates/BarraComando";

export const dynamic = "force-dynamic";

export default async function OficinaPage() {
  const viva = await apiViva();

  if (!viva) {
    return (
      <Marco>
        <AvisoApiCaida />
      </Marco>
    );
  }

  const [expedientes, equipo] = await Promise.all([
    obtenerExpedientes().catch(() => []),
    obtenerEquipo().catch(() => []),
  ]);

  return (
    <Marco>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
        {/* Columna izquierda: el equipo */}
        <aside>
          <PanelEquipo equipo={equipo} />
        </aside>

        {/* Columna derecha: los expedientes */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-oficina-tenue">
              Expedientes
            </h2>
            <span className="text-xs text-oficina-tenue">
              {expedientes.length} {expedientes.length === 1 ? "carpeta" : "carpetas"}
            </span>
          </div>

          <NuevoExpediente />

          {expedientes.length === 0 ? (
            <EstadoVacio />
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {expedientes.map((e) => (
                <TarjetaExpediente key={e.id} expediente={e} />
              ))}
            </div>
          )}

          <div className="pt-2">
            <BarraComando contexto="oficina" />
          </div>
        </div>
      </div>
    </Marco>
  );
}

function Marco({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto min-h-screen max-w-[1400px] px-6 py-8">
      <header className="mb-8 flex items-center gap-3">
        <span className="text-2xl" aria-hidden>
          🐢
        </span>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-oficina-texto">
            Tu oficina
          </h1>
          <p className="text-sm text-oficina-tenue">
            Sócrates y tu equipo, organizados por prospecto.
          </p>
        </div>
      </header>
      {children}
    </main>
  );
}

function EstadoVacio() {
  return (
    <div className="rounded-xl border border-dashed border-oficina-borde bg-oficina-panel p-8 text-center">
      <p className="text-sm text-oficina-texto">
        <span className="mr-1" aria-hidden>
          🐢
        </span>
        Aún no hay expedientes. Abre el primero o escríbeme aquí abajo y lo armamos juntos.
      </p>
    </div>
  );
}

function AvisoApiCaida() {
  return (
    <div className="rounded-xl border border-estado-alerta/30 bg-estado-alerta/5 p-8 text-center">
      <p className="text-sm text-oficina-texto">
        <span className="mr-1" aria-hidden>
          🐢
        </span>
        Ahora mismo no puedo conectarme con tu equipo. Confirma que el servicio de la
        oficina esté encendido (apps/api) y vuelve a cargar.
      </p>
    </div>
  );
}
