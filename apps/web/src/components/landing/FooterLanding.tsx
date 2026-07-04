import Link from "next/link";

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
  { texto: "Prueba gratis", href: "/oficina" },
  { texto: "Entrar", href: "/oficina" },
];

const EMPRESA: Enlace[] = [{ texto: "Acerca de nosotros", href: "/nosotros" }];

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
      <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-oficina-tenue">
        {titulo}
      </h3>
      <ul className="space-y-2.5">
        {enlaces.map(({ texto, href }) => (
          <li key={texto}>
            <Link
              href={href}
              className="text-sm text-oficina-texto transition-colors hover:text-marca"
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
        <div className="grid grid-cols-2 gap-8 py-14 md:grid-cols-12">
          {/* Marca */}
          <div className="col-span-2 md:col-span-5">
            <div className="flex items-center gap-2.5">
              <span className="text-xl leading-none" aria-hidden>
                🐢
              </span>
              <span className="text-base font-black uppercase tracking-[0.2em] text-oficina-texto">
                SOCRATES
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-oficina-tenue">
              Un equipo completo para la oficina del asesor de crédito
              empresarial PYME.
            </p>
            <p className="mt-4 text-xs text-oficina-tenue">Hecho en México 🇲🇽</p>
          </div>

          {/* Menús */}
          <ColumnaFooter titulo="Producto" enlaces={PRODUCTO} className="md:col-span-3" />
          <ColumnaFooter titulo="Empezar" enlaces={EMPEZAR} className="md:col-span-2" />
          <ColumnaFooter titulo="Empresa" enlaces={EMPRESA} className="md:col-span-2" />
        </div>

        {/* Barra inferior */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-oficina-borde py-6 sm:flex-row">
          <p className="text-xs text-oficina-tenue">
            © 2026 SOCRATES. Todos los derechos reservados.
          </p>
          <p className="text-xs font-medium text-oficina-tenue">
            Un producto desarrollado por{" "}
            <span className="tracking-widest text-oficina-texto">SOC | TALENT</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
