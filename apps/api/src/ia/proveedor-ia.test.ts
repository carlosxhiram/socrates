/**
 * Test co-locado del wrapper de IA (D-6, E1-S4). Corre con
 * `node --test --experimental-strip-types` — SIN BD, SIN red.
 *
 * Cubre el camino "sin claves" (NFR-11 / NFR-1): sin AI_GATEWAY_API_KEY,
 * `crearProveedorIA()` debe devolver un proveedor `disponible = false` cuyo
 * `generarTexto` resuelve { ok: false, motivo: "sin_claves" } — nunca un
 * string-centinela, nunca un throw.
 *
 * El camino REAL (con clave, contra el Gateway de verdad) se prueba aparte con
 * `scripts/verificar-gateway.ts` (tsx), porque requiere red saliente y una
 * AI_GATEWAY_API_KEY — no encaja en un unit test rápido y sin claves.
 */
import { test } from "node:test";
import assert from "node:assert/strict";

test("crearProveedorIA: sin AI_GATEWAY_API_KEY, disponible=false", async () => {
  const previa = process.env.AI_GATEWAY_API_KEY;
  delete process.env.AI_GATEWAY_API_KEY;
  try {
    const { crearProveedorIA } = await import("./proveedor-ia.ts");
    const proveedor = crearProveedorIA();
    assert.equal(proveedor.disponible, false);
  } finally {
    if (previa === undefined) delete process.env.AI_GATEWAY_API_KEY;
    else process.env.AI_GATEWAY_API_KEY = previa;
  }
});

test("crearProveedorIA: con AI_GATEWAY_API_KEY vacía o en blanco, sigue en fallback", async () => {
  const previa = process.env.AI_GATEWAY_API_KEY;
  process.env.AI_GATEWAY_API_KEY = "   ";
  try {
    const { crearProveedorIA } = await import("./proveedor-ia.ts");
    const proveedor = crearProveedorIA();
    assert.equal(proveedor.disponible, false);
  } finally {
    if (previa === undefined) delete process.env.AI_GATEWAY_API_KEY;
    else process.env.AI_GATEWAY_API_KEY = previa;
  }
});

test("ProveedorIAFallback.generarTexto: { ok: false, motivo: 'sin_claves' }, nunca string-centinela", async () => {
  const previa = process.env.AI_GATEWAY_API_KEY;
  delete process.env.AI_GATEWAY_API_KEY;
  try {
    const { crearProveedorIA } = await import("./proveedor-ia.ts");
    const proveedor = crearProveedorIA();
    const resultado = await proveedor.generarTexto({ prompt: "¿qué producto le conviene?" });
    assert.deepEqual(resultado, { ok: false, motivo: "sin_claves" });
    // Guardia NFR-1 explícita: el resultado nunca debe ser un string suelto.
    assert.equal(typeof resultado, "object");
    assert.equal("texto" in resultado, false);
  } finally {
    if (previa === undefined) delete process.env.AI_GATEWAY_API_KEY;
    else process.env.AI_GATEWAY_API_KEY = previa;
  }
});

test("esModoSinClaves: refleja AI_GATEWAY_API_KEY", async () => {
  const previa = process.env.AI_GATEWAY_API_KEY;
  try {
    delete process.env.AI_GATEWAY_API_KEY;
    const { esModoSinClaves } = await import("./proveedor-ia.ts");
    assert.equal(esModoSinClaves(), true);

    process.env.AI_GATEWAY_API_KEY = "clave-de-prueba";
    assert.equal(esModoSinClaves(), false);
  } finally {
    if (previa === undefined) delete process.env.AI_GATEWAY_API_KEY;
    else process.env.AI_GATEWAY_API_KEY = previa;
  }
});

test("MODELOS: ids anthropic/claude-* por defecto sin cambiar (contrato con el Gateway)", async () => {
  const { MODELOS } = await import("./proveedor-ia.ts");
  assert.equal(MODELOS.pesado, "anthropic/claude-opus-4.6");
  assert.equal(MODELOS.estandar, "anthropic/claude-sonnet-4.6");
  assert.equal(MODELOS.mecanico, "anthropic/claude-haiku-4.5");
});
