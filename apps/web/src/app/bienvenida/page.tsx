/**
 * /bienvenida — el recibimiento (onboarding) del asesor nuevo.
 *
 * Server Component: lee el estado (GET /yo) y decide. Si el recibimiento ya está
 * completo, manda a La Oficina. Si no, monta el Wizard con el estado inicial y el
 * equipo (para presentarlo en el Paso 3). El paso visible lo deriva el Wizard de
 * `siguientePaso` (calculado por el servidor) + el query ?paso=confirmando.
 */
import { redirect } from "next/navigation";
import { obtenerYo, obtenerEquipo, apiViva } from "@/lib/api-client";
import { Wizard } from "@/components/onboarding/Wizard";

export const dynamic = "force-dynamic";

export default async function BienvenidaPage({
  searchParams,
}: {
  searchParams: Promise<{ paso?: string }>;
}) {
  // apiViva() en master devuelve "viva" | "degradada" | "caida". Solo cuando la
  // oficina ni siquiera contesta ("caida") no hay nada que hacer; en "degradada"
  // dejamos que /yo lo intente y, si falla, cae en el mismo aviso honesto.
  if ((await apiViva()) === "caida") return <AvisoApiCaida />;

  const yo = await obtenerYo().catch(() => null);
  if (!yo) return <AvisoApiCaida />;

  const { paso } = await searchParams;
  // Si todo está completo y NO venimos confirmando un pago, a La Oficina.
  if (yo.siguientePaso === "completo" && paso !== "confirmando") redirect("/oficina");

  const equipo = await obtenerEquipo().catch(() => []);

  return (
    <main className="min-h-screen bg-oficina-fondo">
      <Wizard yoInicial={yo} equipo={equipo} pasoQuery={paso ?? null} />
    </main>
  );
}

function AvisoApiCaida() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-oficina-fondo p-6">
      <div className="max-w-md rounded-xl border border-estado-alerta/30 bg-estado-alerta/5 p-8 text-center">
        <p className="text-2xl" aria-hidden>
          🐢
        </p>
        <p className="mt-2 text-sm text-oficina-texto">
          Ahora mismo no puedo prepararte la oficina. Confirma que el servicio esté
          encendido y vuelve a cargar.
        </p>
      </div>
    </main>
  );
}
