import Link from "next/link";

export function BarraSuperior() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-oficina-borde bg-oficina-panel/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        {/* Marca */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-xl leading-none" aria-hidden>🐢</span>
          <span className="text-sm font-semibold tracking-tight text-oficina-texto">
            Sócrates
          </span>
          <span className="hidden sm:inline-block text-[10px] font-medium uppercase tracking-widest text-oficina-tenue border border-oficina-borde rounded px-1.5 py-0.5">
            SOC | TALENT
          </span>
        </Link>

        {/* Acción */}
        <Link
          href="/oficina"
          className="rounded-md bg-marca px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-marca-fuerte"
        >
          Entrar
        </Link>
      </div>
    </header>
  );
}
