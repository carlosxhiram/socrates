/** Formateo es-MX (fechas, montos). La UI formatea; la api guarda ISO. */

export function fechaCorta(iso: string): string {
  try {
    return new Intl.DateTimeFormat("es-MX", {
      day: "numeric",
      month: "short",
      year: "numeric",
      // Fija la zona del negocio (Monterrey): sin esto, una fecha guardada
      // como medianoche UTC se puede leer un día antes según dónde corra el
      // servidor que renderiza.
      timeZone: "America/Monterrey",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
