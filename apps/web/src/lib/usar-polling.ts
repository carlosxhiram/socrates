"use client";
/**
 * usar-polling.ts — refresco automático del expediente (spec 2.10, I-6).
 *
 * Números CERRADOS del plan:
 *  - 5 s mientras haya Tareas activas (ENCARGADA/EN_CURSO) o acción reciente
 *    del usuario.
 *  - Tras 3 sondeos seguidos SIN cambio y SIN Tareas activas → 30 s (deja de
 *    incomodar cuando ya no hay nada que mover).
 *  - Cualquier acción del usuario o Tarea activa → de vuelta a 5 s.
 *
 * Usa `router.refresh()` (revalida el Server Component sin recargar la
 * página ni perder el estado de los paneles abiertos — sin parpadeos).
 */
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const INTERVALO_ACTIVO_MS = 5_000;
const INTERVALO_REPOSO_MS = 30_000;
const SONDEOS_SIN_CAMBIO_PARA_REPOSO = 3;

export function usarPollingExpediente(opciones: {
  /** ¿Hay Tareas ENCARGADA/EN_CURSO en este expediente ahora mismo? */
  hayTareasActivas: boolean;
  /** Huella del estado visible (p.ej. progresoPct/estado de cada tarea unidos)
   * para detectar cambios entre sondeos sin comparar objetos completos. */
  huellaEstado: string;
}) {
  const { hayTareasActivas, huellaEstado } = opciones;
  const router = useRouter();
  const sondeosSinCambioRef = useRef(0);
  const huellaAnteriorRef = useRef(huellaEstado);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Un cambio de huella (llegó progreso nuevo, una tarea entregó, etc.)
  // reinicia el contador de reposo — sigue en modo activo.
  useEffect(() => {
    if (huellaEstado !== huellaAnteriorRef.current) {
      sondeosSinCambioRef.current = 0;
      huellaAnteriorRef.current = huellaEstado;
    }
  }, [huellaEstado]);

  useEffect(() => {
    function programarSiguiente() {
      const enReposo =
        !hayTareasActivas && sondeosSinCambioRef.current >= SONDEOS_SIN_CAMBIO_PARA_REPOSO;
      const espera = enReposo ? INTERVALO_REPOSO_MS : INTERVALO_ACTIVO_MS;
      timerRef.current = setTimeout(() => {
        if (!hayTareasActivas) sondeosSinCambioRef.current += 1;
        router.refresh();
        programarSiguiente();
      }, espera);
    }

    programarSiguiente();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hayTareasActivas, router]);

  /** Llamar tras una acción del usuario (encargar/reintentar): vuelve a 5 s. */
  function notificarAccionUsuario() {
    sondeosSinCambioRef.current = 0;
  }

  return { notificarAccionUsuario };
}
