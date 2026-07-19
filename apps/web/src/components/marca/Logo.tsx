interface Props {
  /** Lado del logomark en px (es cuadrado). Por defecto 28. */
  size?: number;
  className?: string;
  /**
   * Si se pasa, el logo es un elemento con significado propio (role="img" y
   * este texto alterno). Si se omite, es decorativo (aria-hidden) — el caso
   * normal, porque siempre va junto al wordmark "SOCRATIA".
   */
  titulo?: string;
}

/**
 * Logomark de Socratia — la tortuga vista desde arriba (caparazón hexagonal),
 * el mismo dibujo del favicon (app/icon.svg), ahora montado en la interfaz.
 * Reemplaza al emoji 🐢 en la superficie: un chip autocontenido (tortuga verde
 * salvia sobre crema) que se lee nítido sobre cualquier fondo cálido.
 */
export function Logo({ size = 28, className, titulo }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role={titulo ? "img" : undefined}
      aria-label={titulo}
      aria-hidden={titulo ? undefined : true}
    >
      {titulo ? <title>{titulo}</title> : null}
      <rect width="32" height="32" rx="7" fill="#FEFCF5" />
      {/* Tortuga, mascota de Socratia, vista desde arriba */}
      <g fill="#3E7D5A">
        {/* patas */}
        <circle cx="7" cy="10" r="2.6" />
        <circle cx="25" cy="10" r="2.6" />
        <circle cx="7" cy="22" r="2.6" />
        <circle cx="25" cy="22" r="2.6" />
        {/* cabeza */}
        <circle cx="16" cy="6.5" r="3" />
        {/* caparazón */}
        <path d="M16 8.5c-5.8 0-9.5 3.9-9.5 9.5s3.7 9.5 9.5 9.5 9.5-3.9 9.5-9.5-3.7-9.5-9.5-9.5Z" />
      </g>
      {/* patrón hexagonal del caparazón, en crema */}
      <g stroke="#FEFCF5" strokeWidth="1.1" strokeLinejoin="round" fill="none">
        <path d="M16 11.2 19 13v3.6l-3 1.8-3-1.8V13Z" />
        <path d="M16 19.4 19 21.2v3.4l-3 1.8-3-1.8v-3.4Z" />
        <path d="M9.6 15.2l3-1.7v3.6l-3 1.8-2.6-1.6" />
        <path d="M22.4 15.2l-3-1.7v3.6l3 1.8 2.6-1.6" />
      </g>
    </svg>
  );
}
