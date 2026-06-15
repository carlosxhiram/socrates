/**
 * P-1 La Oficina — la vista raíz.
 * Barra superior (marca + espacio + tema) · hero de Sócrates con chips ·
 * pestañas Expedientes/Sesiones · panel "Tu equipo". Renderiza el seed vía api.
 */
import { obtenerExpedientes, obtenerEquipo, apiViva } from "@/lib/api-client";
import { listarSesiones } from "@/lib/sesiones-actions";
import { PanelEquipo } from "@/components/oficina/PanelEquipo";
import { TopBar } from "@/components/oficina/TopBar";
import { BotonNuevoExpediente } from "@/components/oficina/BotonNuevoExpediente";
import { VistasOficina } from "@/components/oficina/VistasOficina";
import { BarraComando, type AccionRapida } from "@/components/socrates/BarraComando";

export const dynamic = "force-dynamic";

/** Chips de acción rápida: rellenan la barra con un arranque en lenguaje natural. */
const ACCIONES: AccionRapida[] = [
  { etiqueta: "Investigar", plantilla: "Investiga a " },
  { etiqueta: "Prospectar", plantilla: "Prospecta a " },
  { etiqueta: "Recomendar", plantilla: "Recomienda un producto para " },
  { etiqueta: "Redactar", plantilla: "Redacta " },
  { etiqueta: "Tramitar", plantilla: "Arma la cotización de " },
  { etiqueta: "Seguir", plantilla: "Dale seguimiento a " },
];

export default async function OficinaPage() {
  const viva = await apiViva();

  if (!viva) {
    return (
      <Marco>
        <AvisoApiCaida />
      </Marco>
    );
  }

  const [expedientes, equipo, sesiones] = await Promise.all([
    obtenerExpedientes().catch(() => []),
    obtenerEquipo().catch(() => []),
    listarSesiones().catch(() => []),
  ]);

  return (
    <Marco>
      {/* Hero: la línea directa con Sócrates */}
      <section className="mb-10 mt-2 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-oficina-texto sm:text-4xl">
          ¿Qué preparamos hoy?
        </h1>
        <p className="mt-2 text-sm text-oficina-tenue">
          Dile a Sócrates qué necesitas y reparte el trabajo entre tu equipo.
        </p>
        <div className="mx-auto mt-6 max-w-2xl text-left">
          <BarraComando contexto="oficina" acciones={ACCIONES} />
        </div>
      </section>

      {/* Dos columnas: expedientes/sesiones (ancho) + tu equipo (angosto) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        <div>
          <VistasOficina expedientes={expedientes} sesionesIniciales={sesiones} />
        </div>
        <aside>
          <PanelEquipo equipo={equipo} />
        </aside>
      </div>
    </Marco>
  );
}

function Marco({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <TopBar extra={<BotonNuevoExpediente />} />
      <main className="mx-auto max-w-[1400px] px-6 py-8">{children}</main>
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
