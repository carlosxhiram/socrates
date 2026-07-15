/**
 * /sesiones/[id] — pantalla propia de UNA conversación con Socratia.
 * Carga la sesión en el servidor y muestra el hilo + caja de redacción. La lista
 * de conversaciones vive en /sesiones.
 *
 * Honestidad operativa (como el detalle de Expediente): "no existe / no es tuya"
 * (404/403) es un problema DISTINTO a "no me pude conectar", y cada uno pide su
 * propio mensaje — nunca un genérico ni un vacío disfrazado.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { SesionDetalleDTO } from "@socrates/shared";
import { obtenerSesion } from "@/lib/sesiones-actions";
import { requerirAcceso } from "@/lib/portero";
import { ErrorSesion } from "@/lib/sesiones-error";
import { ConversacionSesion } from "@/components/socrates/ConversacionSesion";

export const dynamic = "force-dynamic";

type Parametros = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Parametros): Promise<Metadata> {
  const { id } = await params;
  try {
    const sesion = await obtenerSesion(id);
    return { title: sesion.titulo };
  } catch {
    return { title: "Conversación" };
  }
}

export default async function ConversacionPage({ params }: Parametros) {
  const { id } = await params;

  // Portero: sin acceso (o sin consentimiento) el asesor va a /bienvenida, no se
  // topa con un 409 crudo. Defensa en profundidad; el api valida igual.
  await requerirAcceso();

  let sesion: SesionDetalleDTO;
  try {
    sesion = await obtenerSesion(id);
  } catch (err) {
    const noEsTuya =
      err instanceof ErrorSesion && (err.status === 404 || err.status === 403);
    return (
      <main className="mx-auto min-h-screen max-w-[900px] px-6 py-8">
        <Volver />
        <p className="mt-6 text-sm text-oficina-tenue">
          🐢{" "}
          {noEsTuya
            ? "No encontré esa conversación, o no es tuya."
            : "No me pude conectar con tu oficina para abrir esta conversación. Revisa tu conexión y vuelve a intentarlo."}
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-[900px] px-6 py-8">
      <Volver />
      <h1 className="mb-4 mt-4 text-xl font-semibold tracking-tight text-oficina-texto">
        {sesion.titulo}
      </h1>
      <ConversacionSesion sesionInicial={sesion} />
    </main>
  );
}

function Volver() {
  return (
    <Link
      href="/sesiones"
      className="inline-flex items-center gap-1.5 text-sm font-medium text-oficina-tenue hover:text-marca"
    >
      <ArrowLeft size={15} aria-hidden /> Volver a Conversaciones
    </Link>
  );
}
