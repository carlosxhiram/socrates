/**
 * Tests de la lógica pura del onboarding (el "portero" y el mapeo de Stripe).
 * Corre con `node --test --experimental-strip-types`.
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

test("siguientePaso: perfil + acceso (prueba/activa) pero sin bienvenida → 'bienvenida'", () => {
  for (const estado of ["prueba", "activa"] as const) {
    assert.equal(
      derivarSiguientePaso({ perfilCompleto: true, estadoSuscripcion: estado, bienvenidaVista: false }),
      "bienvenida",
    );
  }
});

test("siguientePaso: todo listo → 'completo'", () => {
  assert.equal(
    derivarSiguientePaso({ perfilCompleto: true, estadoSuscripcion: "activa", bienvenidaVista: true }),
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

test("mapearEstadoStripe: estados de impago → vencida", () => {
  for (const s of ["past_due", "unpaid", "incomplete"]) {
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
