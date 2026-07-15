import { BarraSuperior } from "@/components/landing/BarraSuperior";
import { FooterLanding } from "@/components/landing/FooterLanding";

/**
 * PaginaLegal — el cascarón común de las páginas legales (/terminos y
 * /aviso-de-privacidad): encabezado del landing, título, línea de versión y
 * vigencia, cuerpo (children) y pie de página institucional. El TEXTO legal
 * vive en cada página; aquí solo la presentación.
 *
 * OJO al transcribir texto legal a JSX: cuando un texto sigue a un componente
 * inline (p. ej. <Fuerte>) y el salto de línea del código cae justo después,
 * el compilador puede comerse el espacio — usa {" "} explícito en esas
 * costuras.
 */
export function PaginaLegal({
  titulo,
  version,
  children,
}: {
  titulo: string;
  version: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-oficina-fondo">
      <BarraSuperior />
      <main className="mx-auto max-w-3xl px-6 pt-36 pb-24 lg:px-8">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-oficina-tenue">
          Legal
        </p>
        <h1 className="text-4xl font-black leading-[1.1] tracking-tight text-oficina-texto md:text-5xl">
          {titulo}
        </h1>
        <p className="mt-4 text-sm font-medium text-oficina-tenue">{version}</p>

        <div className="mt-8">{children}</div>
      </main>
      <FooterLanding />
    </div>
  );
}

/** Un párrafo del cuerpo legal, con la tipografía de la casa. */
export function Parrafo({ children }: { children: React.ReactNode }) {
  return <p className="mt-4 text-[15px] leading-relaxed text-oficina-tenue">{children}</p>;
}

/** Un título de sección (los H2 del documento legal). */
export function Subtitulo({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-10 text-lg font-bold text-oficina-texto">{children}</h2>;
}

/** Lista con viñetas del cuerpo legal (espaciado legible). */
export function Lista({ children }: { children: React.ReactNode }) {
  return (
    <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-oficina-tenue">
      {children}
    </ul>
  );
}

/** Pie institucional del documento (razón social y domicilio). */
export function PieLegal({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-12 border-t border-oficina-borde pt-6 text-sm italic text-oficina-tenue">
      {children}
    </p>
  );
}

/** Resalta texto dentro de una cláusula, sin cambiar el tono legal. */
export function Fuerte({ children }: { children: React.ReactNode }) {
  return <strong className="font-semibold text-oficina-texto">{children}</strong>;
}
