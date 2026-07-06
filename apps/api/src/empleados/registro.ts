/**
 * registro.ts — el directorio de empleados IMPLEMENTADOS (D-3).
 *
 * El worker (worker/index.ts) consulta este registro por `RolEmpleado`; un rol
 * ausente aquí se resuelve como BLOQUEADA con motivo digno (NFR-11/NFR-14),
 * nunca como un 500. Los 6 empleados viven en su propio archivo.
 */
import type { Empleado, RolEmpleado } from "@socrates/shared";
import { investigador } from "./investigador.js";
import { prospector } from "./prospector.js";
import { asesorProducto } from "./asesor-producto.js";
import { negociador } from "./negociador.js";
import { tramitador } from "./tramitador.js";
import { gestor } from "./gestor.js";

export const registroEmpleados: Partial<Record<RolEmpleado, Empleado>> = {
  INVESTIGADOR: investigador,
  PROSPECTOR: prospector,
  ASESOR_PRODUCTO: asesorProducto,
  NEGOCIADOR: negociador,
  TRAMITADOR: tramitador,
  GESTOR: gestor,
};
