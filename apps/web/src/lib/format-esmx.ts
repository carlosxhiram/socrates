/** Formateo es-MX (fechas, montos). La UI formatea; la api guarda ISO. */

export function fechaCorta(iso: string): string {
  try {
    return new Intl.DateTimeFormat("es-MX", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
