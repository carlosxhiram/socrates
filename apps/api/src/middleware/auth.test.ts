/**
 * Test co-locado de la lógica pura de la ficha del asesor (nombre/email).
 * Corre con `node --test --experimental-strip-types` — SIN BD, SIN red.
 *
 * Cubre el bug real detectado en un recorrido E2E: un asesor nuevo quedaba con
 * nombre/email en null porque el JWT de sesión de Clerk no trae esos claims
 * por defecto y el upsert original nunca los completaba después. Esta prueba
 * fija el contrato de `calcularActualizacionFicha`: idempotente, nunca pisa un
 * dato ya guardado con null/undefined, y sí completa una fila que llegó vacía.
 *
 * Se importa de `ficha-asesor.ts` (no de `auth.ts`) a propósito: ese archivo
 * es puro (sin `@socrates/db`), así el test corre con `node --test` liso sin
 * arrastrar la resolución de imports de Prisma (que solo `tsx` sabe resolver).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { calcularActualizacionFicha } from "./ficha-asesor.ts";

test("fila nueva (sin registro previo): usa los datos que traiga Clerk", () => {
  const cambios = calcularActualizacionFicha(undefined, {
    nombre: "Ana Pérez",
    email: "ana@example.com",
  });
  assert.deepEqual(cambios, { nombre: "Ana Pérez", email: "ana@example.com" });
});

test("fila existente sin email: lo completa en el siguiente arranque de sesión", () => {
  const cambios = calcularActualizacionFicha(
    { nombre: null, email: null },
    { nombre: "Ana Pérez", email: "ana@example.com" },
  );
  assert.deepEqual(cambios, { nombre: "Ana Pérez", email: "ana@example.com" });
});

test("fila existente CON email: nunca lo pisa, aunque lleguen datos nuevos", () => {
  const cambios = calcularActualizacionFicha(
    { nombre: "Ana Pérez", email: "ana@example.com" },
    { nombre: "Otro Nombre", email: "otro@example.com" },
  );
  assert.deepEqual(cambios, {});
});

test("no llegan datos de Clerk (modo demo/sin llaves): no rompe, no escribe null", () => {
  const cambios = calcularActualizacionFicha({ nombre: null, email: null }, undefined);
  assert.deepEqual(cambios, {});
});

test("Clerk trae email pero no nombre: completa solo lo que trae", () => {
  const cambios = calcularActualizacionFicha(
    { nombre: null, email: null },
    { email: "solo-correo@example.com" },
  );
  assert.deepEqual(cambios, { email: "solo-correo@example.com" });
});

test("string vacío no cuenta como dato válido (no pisa ni completa)", () => {
  const cambios = calcularActualizacionFicha({ nombre: null, email: null }, { nombre: "", email: "" });
  assert.deepEqual(cambios, {});
});
