/**
 * Test co-locado (E1-S1: demuestra el cableado de tests).
 * Corre con `node --test --experimental-strip-types`.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { derivarProgreso } from "./progreso";
import { ETAPAS_EXPEDIENTE, EMPLEADOS, ROLES_PANEL } from "./glosario";

test("derivarProgreso: PROSPECTO sin tareas = base 5", () => {
  assert.equal(derivarProgreso({ etapa: "PROSPECTO" }), 5);
});

test("derivarProgreso: GANADO siempre 100, PERDIDO siempre 0", () => {
  assert.equal(derivarProgreso({ etapa: "GANADO", tareasTotales: 0 }), 100);
  assert.equal(derivarProgreso({ etapa: "PERDIDO", tareasTotales: 9, tareasEntregadas: 9 }), 0);
});

test("derivarProgreso: nunca infla por encima de 99 antes de GANADO", () => {
  const p = derivarProgreso({ etapa: "EN_CIERRE", tareasTotales: 4, tareasEntregadas: 4 });
  assert.ok(p <= 99, `progreso ${p} no debe pasar de 99`);
  assert.ok(p >= 92, `progreso ${p} debe respetar la base de la etapa`);
});

test("glosario: hay 8 etapas y los 6 empleados del panel tienen perfil", () => {
  assert.equal(ETAPAS_EXPEDIENTE.length, 8);
  assert.equal(ROLES_PANEL.length, 6);
  for (const rol of ROLES_PANEL) {
    assert.ok(EMPLEADOS[rol], `falta perfil de ${rol}`);
    assert.ok(EMPLEADOS[rol].nombre.length > 0);
  }
});
