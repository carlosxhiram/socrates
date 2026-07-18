import { test } from "node:test";
import assert from "node:assert/strict";
import { nombreEmpleado, cargoEmpleado } from "./glosario.js";

test("nombreEmpleado usa el override de la oficina cuando existe", () => {
  assert.equal(nombreEmpleado("PROSPECTOR", { PROSPECTOR: "Toño" }), "Toño");
});

test("nombreEmpleado cae al nombre de fábrica sin override", () => {
  assert.equal(nombreEmpleado("PROSPECTOR", null), "Diego");
  assert.equal(nombreEmpleado("PROSPECTOR", {}), "Diego");
  assert.equal(nombreEmpleado("PROSPECTOR", undefined), "Diego");
});

test("nombreEmpleado ignora override vacío o de puros espacios", () => {
  assert.equal(nombreEmpleado("PROSPECTOR", { PROSPECTOR: "  " }), "Diego");
  assert.equal(nombreEmpleado("PROSPECTOR", { PROSPECTOR: "" }), "Diego");
});

test("nombreEmpleado recorta espacios alrededor del override", () => {
  assert.equal(nombreEmpleado("GESTOR", { GESTOR: "  Ana  " }), "Ana");
});

test("nombreEmpleado ignora roles ajenos en el mapa (datos viejos)", () => {
  assert.equal(nombreEmpleado("NEGOCIADOR", { PROSPECTOR: "Toño" }), "Katya");
});

test("SOCRATES no tiene nombre de fábrica: cae a su nombre de sistema", () => {
  assert.equal(nombreEmpleado("SOCRATES", null), "Sócrates");
});

test("cargoEmpleado devuelve el puesto del panel", () => {
  assert.equal(cargoEmpleado("PROSPECTOR"), "Prospector");
  assert.equal(cargoEmpleado("NEGOCIADOR"), "Negociadora");
});

test("cargoEmpleado es vacío para el gerente", () => {
  assert.equal(cargoEmpleado("SOCRATES"), "");
});
