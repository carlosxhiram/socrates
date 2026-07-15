/**
 * /sesiones — tus conversaciones con Socratia (Sesiones).
 * Carga la lista en el servidor y la muestra con ListaSesiones. Desde aquí se
 * abre una conversación (/sesiones/[id]) o se empieza una nueva. Si la oficina
 * no responde, lo decimos tal cual (nunca lo disfrazamos de "no hay nada").
 */
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { SesionResumenDTO } from "@socrates/shared";
import { listarSesiones } from "@/lib/sesiones-actions";
import { ListaSesiones } from "@/components/socrates/ListaSesiones";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Conversaciones",
};

export default async function SesionesPage() {
  let sesiones: SesionResumenDTO[] | null = null;
  try {
    sesiones = await listarSesiones();
  } catch {
    sesiones = null; // no pudimos ver tus conversaciones (no es lo mismo que "no tienes")
  }

  return (
    <main className="mx-auto min-h-screen max-w-[900px] px-6 py-8">
      <Volver />
      <header className="mb-6 mt-4 flex items-center gap-3">
        <span className="text-2xl" aria-hidden>
          🐢
        </span>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-oficina-texto">
            Conversaciones
          </h1>
          <p className="text-sm text-oficina-tenue">
            Tu línea directa con Socratia. Aquí queda el hilo de todo lo que platican.
          </p>
        </div>
      </header>

      {sesiones === null ? (
        <div
          role="status"
          className="rounded-xl border border-estado-alerta/30 bg-estado-alerta/5 p-8 text-center"
        >
          <p className="text-sm text-oficina-texto">
            <span className="mr-1" aria-hidden>
              🐢
            </span>
            No pude traer tus conversaciones ahora mismo. Revisa tu conexión y vuelve a cargar.
          </p>
        </div>
      ) : (
        <ListaSesiones sesionesIniciales={sesiones} />
      )}
    </main>
  );
}

function Volver() {
  return (
    <Link
      href="/oficina"
      className="inline-flex items-center gap-1.5 text-sm font-medium text-oficina-tenue hover:text-marca"
    >
      <ArrowLeft size={15} aria-hidden /> Volver a La Oficina
    </Link>
  );
}
