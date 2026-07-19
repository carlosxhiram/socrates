import Link from "next/link";
import { Logo } from "@/components/marca/Logo";

const NAV = [
  { texto: "Tu equipo", href: "/#equipo" },
  { texto: "Cómo funciona", href: "/#como-funciona" },
  { texto: "Precio", href: "/#precio" },
];

export function BarraSuperior() {
  return (
    // Header SÓLIDO (sin vidrio esmerilado): Tavily nunca usa backdrop-blur en el
    // navbar. Un solo hairline cálido lo separa del contenido.
    <header className="fixed inset-x-0 top-0 z-50 border-b border-oficina-borde bg-oficina-panel">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 lg:px-8">
        {/* Logotipo — logomark real (la tortuga) + wordmark en peso medium. */}
        <Link
          href="/"
          className="group flex items-center gap-2.5 rounded-interno focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marca focus-visible:ring-offset-4 focus-visible:ring-offset-oficina-panel"
          aria-label="SOCRATIA — inicio"
        >
          <Logo size={28} />
          <span className="text-base font-medium uppercase tracking-[0.18em] text-oficina-texto transition-colors duration-200 ease-suave group-hover:text-marca">
            SOCRATIA
          </span>
        </Link>

        {/* Navegación — se oculta en móvil (las anclas siguen en el footer). */}
        <nav className="hidden items-center gap-8 md:flex" aria-label="Secciones">
          {NAV.map(({ texto, href }) => (
            <Link
              key={href}
              href={href}
              className="text-sm text-oficina-tenue transition-colors duration-200 ease-suave hover:text-oficina-texto"
            >
              {texto}
            </Link>
          ))}
        </nav>

        {/* Acciones — iniciar sesión (discreto) + prueba (primario, pill). */}
        <div className="flex items-center gap-2">
          <Link
            href="/entrar"
            className="hidden h-9 items-center rounded-full px-3.5 text-sm font-medium text-oficina-texto transition-colors duration-200 ease-suave hover:bg-oficina-tinta/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marca focus-visible:ring-offset-2 focus-visible:ring-offset-oficina-panel sm:inline-flex"
          >
            Entrar
          </Link>
          <Link
            href="/crear-cuenta"
            className="inline-flex h-9 items-center rounded-full bg-marca px-4 text-sm font-medium text-white transition-colors duration-200 ease-suave hover:bg-marca-fuerte active:bg-marca-fuerte focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marca focus-visible:ring-offset-2 focus-visible:ring-offset-oficina-panel"
          >
            Empieza gratis
          </Link>
        </div>
      </div>
    </header>
  );
}
