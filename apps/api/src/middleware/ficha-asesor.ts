/**
 * ficha-asesor.ts — lógica PURA (sin BD, sin red) para completar nombre/email
 * del Asesor a partir de lo que trae Clerk. Separada de auth.ts a propósito:
 * así el test unitario no arrastra `@socrates/db` (Prisma) y corre con
 * `node --test` liso, sin depender de `tsx` para resolver imports internos.
 *
 * Ver el porqué del bug (JWT sin claim de email) en el comentario de cabecera
 * de auth.ts.
 */

/** Datos de ficha (nombre/email) tal como los trae Clerk, ya limpios. */
export interface DatosFichaClerk {
  nombre?: string;
  email?: string;
}

/**
 * Decide qué escribir en el `update` del upsert para no pisar nunca un dato
 * ya guardado con null/undefined (idempotente).
 */
export function calcularActualizacionFicha(
  actual: { nombre: string | null; email: string | null } | null | undefined,
  datos: DatosFichaClerk | undefined,
): { nombre?: string; email?: string } {
  const cambios: { nombre?: string; email?: string } = {};
  if (datos?.nombre && !actual?.nombre) cambios.nombre = datos.nombre;
  if (datos?.email && !actual?.email) cambios.email = datos.email;
  return cambios;
}
