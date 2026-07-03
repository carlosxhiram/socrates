/** Barra de progreso honesta (UX C-6, P-3). role=progressbar para accesibilidad. */
export function BarraProgreso({
  progreso,
  bloqueado,
}: {
  progreso: number;
  bloqueado?: boolean;
}) {
  const color = bloqueado ? "bg-estado-bloqueo" : "bg-marca";
  return (
    <div
      role="progressbar"
      aria-valuenow={progreso}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Progreso ${progreso}%`}
      className="flex items-center gap-3"
    >
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-oficina-borde">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          // En 0% no pintamos un ~2% falso: sin avance real, la barra se ve
          // vacía de verdad (honestidad del progreso, UX C-6).
          style={{ width: progreso <= 0 ? "0%" : `${Math.max(2, progreso)}%` }}
        />
      </div>
      <span className="w-10 text-right text-xs font-medium tabular-nums text-oficina-tenue">
        {progreso}%
      </span>
    </div>
  );
}
