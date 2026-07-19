interface Props {
  /** Lado del logomark en px (es cuadrado). Por defecto 28. */
  size?: number;
  className?: string;
  /**
   * Si se pasa, el logo es un elemento con significado propio (alt con este
   * texto). Si se omite, es decorativo (aria-hidden) — el caso normal, porque
   * siempre va junto al wordmark "SOCRATIA".
   */
  titulo?: string;
}

/**
 * Logomark de Socratia — la tortuga de perfil, el mismo dibujo del favicon
 * (app/icon.png), montado en la interfaz. Reemplaza al emoji 🐢 en la
 * superficie: la mascota en verde pino (#006430) sobre fondo transparente, se
 * lee nítida sobre cualquier fondo cálido.
 */
export function Logo({ size = 28, className, titulo }: Props) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/marca/tortuga.png"
      width={size}
      height={size}
      className={className}
      alt={titulo ?? ""}
      aria-hidden={titulo ? undefined : true}
      draggable={false}
    />
  );
}
