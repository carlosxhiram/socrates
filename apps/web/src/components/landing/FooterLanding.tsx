export function FooterLanding() {
  return (
    <footer className="border-t border-oficina-borde bg-oficina-panel py-8">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="text-base" aria-hidden>🐢</span>
            <span className="text-sm font-semibold text-oficina-texto">Sócrates</span>
            <span className="text-[10px] font-medium uppercase tracking-widest text-oficina-tenue">
              · SOC | TALENT
            </span>
          </div>
          <p className="text-xs text-oficina-tenue">
            Producto para asesores de crédito empresarial PYME en México.
          </p>
        </div>
      </div>
    </footer>
  );
}
