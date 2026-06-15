/**
 * /sesiones/[id] — pantalla propia de UNA conversación con Sócrates.
 * Carga la sesión en el servidor (404 si no existe o no es del asesor) y muestra
 * el hilo + caja de redacción. La lista de conversaciones vive en la Oficina.
 */
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { obtenerSesion } from "@/lib/sesiones-actions";
import { TopBar } from "@/components/oficina/TopBar";
import { ConversacionSesion } from "@/components/socrates/ConversacionSesion";

export const dynamic = "force-dynamic";

export default async function ConversacionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sesion = await obtenerSesion(id).catch(() => null);
  if (!sesion) notFound();

  return (
    <div className="min-h-screen">
      <TopBar />
      <main className="mx-auto max-w-[900px] px-6 py-8">
        <Link
          href="/oficina"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-oficina-tenue transition-colors hover:text-oficina-texto"
        >
          <ArrowLeft size={15} aria-hidden /> Volver a la oficina
        </Link>
        <h1 className="mb-4 text-xl font-semibold tracking-tight text-oficina-texto">
          {sesion.titulo}
        </h1>
        <ConversacionSesion sesionInicial={sesion} />
      </main>
    </div>
  );
}
