interface Props {
  /** El texto de la etiqueta, SIN la diagonal (se antepone aquí). */
  children: React.ReactNode;
  className?: string;
}

/**
 * Eyebrow — la unidad estructural más reutilizada del sistema (Tavily la repite
 * 15+ veces): una etiqueta monoespaciada con "/" inicial, en minúsculas y tinta
 * al 60%, que corona cada sección justo antes del H2. El registro mono la hace
 * sentir como un "endpoint" del propio producto; en Socratia respeta la voz de
 * oficina (NFR-14): "/tu equipo", "/cómo funciona", "/precio".
 */
export function Eyebrow({ children, className }: Props) {
  return (
    <p
      className={`font-mono text-eyebrow lowercase text-oficina-tinta/60${
        className ? ` ${className}` : ""
      }`}
    >
      <span aria-hidden>/</span>
      {children}
    </p>
  );
}
