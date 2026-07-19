import Link from "next/link";
import { Logo } from "@/components/marca/Logo";

interface Enlace {
  texto: string;
  href: string;
}

const PRODUCTO: Enlace[] = [
  { texto: "Cómo funciona", href: "/#como-funciona" },
  { texto: "Tu plantilla", href: "/#equipo" },
  { texto: "Precio", href: "/#precio" },
];

const EMPEZAR: Enlace[] = [
  { texto: "Prueba gratis", href: "/crear-cuenta" },
  { texto: "Entrar", href: "/entrar" },
];

const EMPRESA: Enlace[] = [{ texto: "Acerca de nosotros", href: "/nosotros" }];

const LEGAL: Enlace[] = [
  { texto: "Términos y Condiciones", href: "/terminos" },
  { texto: "Aviso de Privacidad", href: "/aviso-de-privacidad" },
];

function ColumnaFooter({
  titulo,
  enlaces,
  className = "",
}: {
  titulo: string;
  enlaces: Enlace[];
  className?: string;
}) {
  return (
    <div className={className}>
      <h3 className="mb-4 font-mono text-[11px] uppercase tracking-[0.14em] text-oficina-tinta/60">
        {titulo}
      </h3>
      <ul className="space-y-2.5">
        {enlaces.map(({ texto, href }) => (
          <li key={texto}>
            <Link
              href={href}
              className="text-sm text-oficina-texto transition-colors duration-200 ease-suave hover:text-marca"
            >
              {texto}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function FooterLanding() {
  return (
    <footer className="border-t border-oficina-borde bg-oficina-panel">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        {/* Cuerpo */}
        <div className="grid grid-cols-2 gap-8 py-16 md:grid-cols-12">
          {/* Marca */}
          <div className="col-span-2 md:col-span-4">
            <div className="flex items-center gap-2.5">
              <Logo size={28} />
              <span className="text-base font-medium uppercase tracking-[0.18em] text-oficina-texto">
                SOCRATIA
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-oficina-tenue">
              Un equipo completo para la oficina del asesor financiero.
            </p>
            <p className="mt-4 text-xs text-oficina-tenue">Hecho en México 🇲🇽</p>
          </div>

          {/* Menús */}
          <ColumnaFooter titulo="Producto" enlaces={PRODUCTO} className="md:col-span-2" />
          <ColumnaFooter titulo="Empezar" enlaces={EMPEZAR} className="md:col-span-2" />
          <ColumnaFooter titulo="Empresa" enlaces={EMPRESA} className="md:col-span-2" />
          <ColumnaFooter titulo="Legal" enlaces={LEGAL} className="md:col-span-2" />
        </div>

        {/* Barra inferior */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-oficina-borde py-6 sm:flex-row">
          <p className="text-xs text-oficina-tenue">
            © 2026 SOCRATIA. Todos los derechos reservados.
          </p>
          <p className="text-xs font-medium text-oficina-tenue">
            Un producto desarrollado por{" "}
            <span className="tracking-widest text-oficina-texto">Mate Innovation</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
