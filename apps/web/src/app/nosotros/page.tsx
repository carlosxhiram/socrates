import type { Metadata } from "next";
import Link from "next/link";
import { BarraSuperior } from "@/components/landing/BarraSuperior";
import { FooterLanding } from "@/components/landing/FooterLanding";

export const metadata: Metadata = {
  title: "Acerca de nosotros · SOCRATIA",
  description:
    "SOCRATIA es un equipo completo para la oficina del asesor de crédito empresarial en México.",
};

/**
 * Acerca de nosotros — página institucional, honesta y breve. Sin promesas
 * que no podamos cumplir; la metáfora es la oficina (NFR-14). Reusa el
 * encabezado y el pie del landing para mantener la identidad.
 */
export default function NosotrosPage() {
  return (
    <div className="min-h-screen bg-oficina-fondo">
      <BarraSuperior />
      <main className="mx-auto max-w-3xl px-6 pt-36 pb-24 lg:px-8">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-oficina-tenue">
          Acerca de nosotros
        </p>
        <h1 className="text-4xl font-black leading-[1.1] tracking-tight text-oficina-texto md:text-5xl">
          Le damos un equipo completo a la oficina del asesor.
        </h1>

        <div className="mt-10 space-y-6 text-lg leading-relaxed text-oficina-tenue">
          <p>
            El asesor de crédito empresarial hace de todo: prospecta, investiga,
            arma reportes, prepara el acercamiento, reúne requisitos y da
            seguimiento. Lo hace solo —a marchas forzadas— o le paga a alguien
            para delegarlo. Casi siempre, se queda sin tiempo para lo único que
            de verdad cierra tratos: sentarse con el cliente.
          </p>
          <p>
            <span className="font-semibold text-oficina-texto">Socratia</span>{" "}
            nació para eso: que cualquier asesor tenga, desde el primer día, un
            equipo de especialistas trabajando en su oficina. Le dices qué
            necesitas en lenguaje normal y cada quien hace su parte. Tú revisas y
            firmas —el criterio y la relación con el cliente siguen siendo tuyos,
            siempre.
          </p>
          <p>
            Somos <span className="font-semibold text-oficina-texto">SOC | TALENT</span>,
            y construimos herramientas para el asesor de crédito PYME en México.
            Creemos que la mejor tecnología no se siente como aprender un
            programa nuevo, sino como contratar a un buen equipo: llega, entiende
            el encargo y entrega.
          </p>
        </div>

        <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href="/crear-cuenta"
            className="inline-flex items-center justify-center rounded-md bg-marca px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-marca-fuerte"
          >
            Empieza tu prueba gratis
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-oficina-tenue transition-colors hover:text-marca"
          >
            ← Volver al inicio
          </Link>
        </div>
      </main>
      <FooterLanding />
    </div>
  );
}
