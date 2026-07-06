/**
 * registro.ts — el directorio de empleados IMPLEMENTADOS (D-3).
 *
 * El worker (worker/index.ts) consulta este registro por `RolEmpleado`; un rol
 * ausente aquí se resuelve como BLOQUEADA con motivo digno (NFR-11/NFR-14),
 * nunca como un 500. Los 6 empleados reales viven en su propio archivo
 * (investigador.ts, prospector.ts, ...) y se registran aquí.
 */
import type { Empleado, RolEmpleado } from "@socrates/shared";

export const registroEmpleados: Partial<Record<RolEmpleado, Empleado>> = {};
