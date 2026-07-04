import Link from "next/link";

export function BarraSuperior() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-oficina-borde bg-oficina-panel/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        {/* Logotipo — wordmark en mayúsculas (sin acento, es marca; el texto
            corrido conserva "Sócrates" con acento). */}
        <Link href="/" className="flex items-center gap-2.5" aria-label="SOCRATES — inicio">
          <span className="text-xl leading-none" aria-hidden>🐢</span>
          <span className="text-base font-black uppercase tracking-[0.2em] text-oficina-texto">
            SOCRATES
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
