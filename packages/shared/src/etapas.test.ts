/**
 * etapas.test.ts — la máquina de Etapas del Expediente (FR-7, E2-S7).
 *
 * La regla: el avance es de una Etapa a la SIGUIENTE (sin saltos), Ganado y
 * Perdido se marcan manualmente desde cualquier Etapa abierta, los estados
 * terminales no se reabren, y retroceder a una Etapa anterior es honesto
 * (corregir no es inflar). El prerrequisito por Entregable lo verifica la api
 * con la base; aquí vive el mapa y la regla pura.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { evaluarTransicionEtapa, PRERREQUISITO_ETAPA, ETAPAS_TERMINALES } from "./etapas";
import { ETAPAS_LINEALES } from "./glosario";

test("avanzar a la siguiente Etapa lineal es válido en toda la cadena", () => {
  for (let i = 0; i < ETAPAS_LINEALES.length - 1; i++) {
    const r = evaluarTransicionEtapa(ETAPAS_LINEALES[i]!, ETAPAS_LINEALES[i + 1]!);
    assert.equal(r.valida, true, `${ETAPAS_LINEALES[i]} → ${ETAPAS_LINEALES[i + 1]} debería ser válida`);
  }
});

test("saltarse Etapas hacia adelante es inválido, con motivo en lenguaje de oficina", () => {
  const r = evaluarTransicionEtapa("PROSPECTO", "RECOMENDADO");
  assert.equal(r.valida, false);
  if (!r.valida) {
    assert.match(r.motivo, /etapa/i);
    assert.doesNotMatch(r.motivo, /enum|invalid|state machine/i, "el motivo habla de oficina, no de técnica");
  }
});

test("quedarse en la misma Etapa es válido (PATCH que reenvía el estado actual)", () => {
  for (const etapa of ETAPAS_LINEALES) {
    assert.equal(evaluarTransicionEtapa(etapa, etapa).valida, true);
  }
});

test("Ganado y Perdido se pueden marcar desde cualquier Etapa abierta", () => {
  for (const etapa of ETAPAS_LINEALES) {
    assert.equal(evaluarTransicionEtapa(etapa, "GANADO").valida, true, `${etapa} → GANADO`);
    assert.equal(evaluarTransicionEtapa(etapa, "PERDIDO").valida, true, `${etapa} → PERDIDO`);
  }
});

test("los estados terminales no se reabren ni se cambian entre sí", () => {
  for (const terminal of ETAPAS_TERMINALES) {
    for (const destino of [...ETAPAS_LINEALES, ...ETAPAS_TERMINALES]) {
      if (destino === terminal) continue;
      const r = evaluarTransicionEtapa(terminal, destino);
      assert.equal(r.valida, false, `${terminal} → ${destino} debería rechazarse`);
    }
    // Reenviar el mismo terminal (no-op) sí es válido.
    assert.equal(evaluarTransicionEtapa(terminal, terminal).valida, true);
  }
});

test("retroceder a una Etapa anterior es válido (corregir es honesto)", () => {
  assert.equal(evaluarTransicionEtapa("RECOMENDADO", "INVESTIGADO").valida, true);
  assert.equal(evaluarTransicionEtapa("EN_CIERRE", "PROSPECTO").valida, true);
});

test("el mapa de prerrequisitos solo exige lo que el producto ya sabe producir", () => {
  // Default afinable con Carlos (PRD §8 Q-2): entrar a INVESTIGADO exige el
  // Reporte de Inteligencia APROBADO. Las demás etapas aún no tienen
  // Entregable prerrequisito (llegan con E4/E5).
  assert.equal(PRERREQUISITO_ETAPA.INVESTIGADO, "reporte_inteligencia");
  assert.equal(Object.keys(PRERREQUISITO_ETAPA).length, 1);
});
