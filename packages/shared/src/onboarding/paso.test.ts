/**
 * Tests de la lógica pura del onboarding (el "portero" y el mapeo de Stripe).
 * Corre con `tsx --test` (igual que etapas.test.ts / progreso.test.ts).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { derivarSiguientePaso, mapearEstadoStripe } from "./paso";

// ── derivarSiguientePaso: de hechos → siguiente paso ───────────────────────
test("siguientePaso: sin perfil completo → 'perfil'", () => {
  assert.equal(
    derivarSiguientePaso({ perfilCompleto: false, estadoSuscripcion: "prueba", bienvenidaVista: true }),
    "perfil",
  );
});

test("siguientePaso: perfil ok pero sin suscripción con acceso → 'pago'", () => {
  for (const estado of ["ninguna", "vencida", "cancelada"] as const) {
    assert.equal(
      derivarSiguientePaso({ perfilCompleto: true, estadoSuscripcion: estado, bienvenidaVista: false }),
      "pago",
      `estado ${estado} debe mandar a pago`,
    );
  }
});

test("siguientePaso: perfil + acceso (demo/prueba/activa) pero sin bienvenida → 'bienvenida'", () => {
  for (const estado of ["demo", "prueba", "activa"] as const) {
    assert.equal(
      derivarSiguientePaso({ perfilCompleto: true, estadoSuscripcion: estado, bienvenidaVista: false }),
      "bienvenida",
      `estado ${estado} con perfil y sin bienvenida debe mandar a bienvenida`,
    );
  }
});

test("siguientePaso: todo listo → 'completo'", () => {
  assert.equal(
    derivarSiguientePaso({ perfilCompleto: true, estadoSuscripcion: "activa", bienvenidaVista: true }),
    "completo",
  );
});

test("siguientePaso: la demo explícita da acceso igual que un pago (no bloquea en 'pago')", () => {
  assert.equal(
    derivarSiguientePaso({ perfilCompleto: true, estadoSuscripcion: "demo", bienvenidaVista: true }),
    "completo",
  );
});

test("siguientePaso: en gracia (renovación rebotada) NO se rebota a 'pago' — entra a su oficina", () => {
  // gracia = acceso de lectura: el asesor devuelto entra a la oficina (completo),
  // no lo mandamos a re-onboardear. La restricción de escritura la aplica la muralla.
  assert.equal(
    derivarSiguientePaso({ perfilCompleto: true, estadoSuscripcion: "gracia", bienvenidaVista: true }),
    "completo",
  );
});

test("siguientePaso: el pago tiene prioridad sobre la bienvenida (orden correcto)", () => {
  // perfil ok, sin acceso, bienvenida ya vista → aún así debe cobrar primero.
  assert.equal(
    derivarSiguientePaso({ perfilCompleto: true, estadoSuscripcion: "vencida", bienvenidaVista: true }),
    "pago",
  );
});

// ── mapearEstadoStripe: status de Stripe → nuestro vocabulario ─────────────
test("mapearEstadoStripe: trialing → prueba, active → activa", () => {
  assert.equal(mapearEstadoStripe("trialing"), "prueba");
  assert.equal(mapearEstadoStripe("active"), "activa");
});

test("mapearEstadoStripe: past_due → gracia (Stripe aún reintenta; acceso de lectura)", () => {
  assert.equal(mapearEstadoStripe("past_due"), "gracia");
});

test("mapearEstadoStripe: impago sin gracia (unpaid/incomplete) → vencida", () => {
  for (const s of ["unpaid", "incomplete"]) {
    assert.equal(mapearEstadoStripe(s), "vencida");
  }
});

test("mapearEstadoStripe: cancelaciones → cancelada", () => {
  assert.equal(mapearEstadoStripe("canceled"), "cancelada");
  assert.equal(mapearEstadoStripe("incomplete_expired"), "cancelada");
});

test("mapearEstadoStripe: desconocido → ninguna (degradación segura)", () => {
  assert.equal(mapearEstadoStripe("algo_que_stripe_invente_mañana"), "ninguna");
});

test("mapearEstadoStripe: NUNCA devuelve 'demo' (la demo no viene de Stripe)", () => {
  for (const s of ["trialing", "active", "past_due", "canceled", "loquesea"]) {
    assert.notEqual(mapearEstadoStripe(s), "demo");
  }
});
