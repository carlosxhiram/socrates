"use client";
/**
 * usar-polling.ts — refresco automático del expediente (spec de la misión
 * §2.10, I-6). Números CERRADOS del plan:
 *  - 5 s mientras haya Tareas activas (ENCARGADA/EN_CURSO) o acción reciente.
 *  - Tras 3 sondeos seguidos SIN cambio y SIN Tareas activas → 30 s.
 *  - Cualquier Tarea activa (o volver a esta pestaña) → de vuelta a 5 s.
 *
 * Usa `router.refresh()` (revalida el Server Component sin recargar la página
 * ni perder el estado de los paneles abiertos — sin parpadeos).
 */
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const INTERVALO_ACTIVO_MS = 5_000;
const INTERVALO_REPOSO_MS = 30_000;
const SONDEOS_SIN_CAMBIO_PARA_REPOSO = 3;

export function usarPollingExpediente(opciones: {
  /** ¿Hay Tareas ENCARGADA/EN_CURSO en este expediente ahora mismo? */
  hayTareasActivas: boolean;
  /** Huella del estado visible (progresoPct/estado de cada tarea unidos) para
   * detectar cambios entre sondeos sin comparar objetos completos. */
  huellaEstado: string;
}) {
  const { hayTareasActivas, huellaEstado } = opciones;
  const router = useRouter();
  const sondeosSinCambio = useRef(0);
  const huellaAnterior = useRef(huellaEstado);
  const idIntervalo = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (huellaEstado !== huellaAnterior.current) {
      sondeosSinCambio.current = 0;
      huellaAnterior.current = huellaEstado;
    }
  }, [huellaEstado]);

  useEffect(() => {
    function programar() {
      if (idIntervalo.current) clearInterval(idIntervalo.current);
      const enReposo = !hayTareasActivas && sondeosSinCambio.current >= SONDEOS_SIN_CAMBIO_PARA_REPOSO;
      const intervalo = enReposo ? INTERVALO_REPOSO_MS : INTERVALO_ACTIVO_MS;
      idIntervalo.current = setInterval(() => {
        if (!hayTareasActivas) sondeosSinCambio.current += 1;
        router.refresh();
      }, intervalo);
    }
    programar();
    return () => {
      if (idIntervalo.current) clearInterval(idIntervalo.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hayTareasActivas, sondeosSinCambio.current >= SONDEOS_SIN_CAMBIO_PARA_REPOSO]);
}
