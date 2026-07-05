/**
 * Test co-locado de proveedor-stripe.ts. Corre con
 * `node --test --experimental-strip-types --experimental-test-module-mocks`
 * — SIN BD, SIN red (el SDK de Stripe se mockea con node:test para
 * inspeccionar el payload que armamos).
 *
 * Cubre el arreglo de la Caja en español (checkout de hoy salió en inglés y
 * con el email vacío):
 *  - la Checkout Session SIEMPRE pide locale: "es-419" (nunca depende del
 *    navegador del asesor).
 *  - el email del asesor se manda al CREAR el Customer (nunca como
 *    customer_email en la Session, porque ya mandamos `customer`).
 *  - sin email en nuestra fila, no se manda cadena vacía a Stripe.
 *
 * El camino "sin llave" (modo demo) y el resto del armado (precio, trial,
 * client_reference_id) no se tocan en este PR — no se vuelven a probar aquí.
 */
import { test, mock } from "node:test";
import assert from "node:assert/strict";

/** Arma un mock mínimo del SDK de Stripe y devuelve los payloads capturados. */
function mockearStripe() {
  const llamadas = {
    customersCreate: [] as Array<Record<string, unknown>>,
    sessionsCreate: [] as Array<Record<string, unknown>>,
  };

  class StripeMock {
    customers = {
      create: async (payload: Record<string, unknown>) => {
        llamadas.customersCreate.push(payload);
        return { id: "cus_mock_123" };
      },
    };
    checkout = {
      sessions: {
        create: async (payload: Record<string, unknown>) => {
          llamadas.sessionsCreate.push(payload);
          return { url: "https://checkout.stripe.com/mock", id: "cs_mock_123" };
        },
      },
    };
  }

  mock.module("stripe", {
    defaultExport: StripeMock,
  });

  return llamadas;
}

test("crearCheckoutSession: pide locale es-419 y NO manda customer_email (ya manda customer)", async () => {
  const previaKey = process.env.STRIPE_SECRET_KEY;
  const previaPrice = process.env.STRIPE_PRICE_ID;
  process.env.STRIPE_SECRET_KEY = "sk_test_mock";
  process.env.STRIPE_PRICE_ID = "price_mock";

  const llamadas = mockearStripe();

  try {
    const { crearCheckoutSession } = await import(
      `./proveedor-stripe.ts?t=${Date.now()}-a`
    );
    const resultado = await crearCheckoutSession({
      asesorId: "asesor_1",
      emailAsesor: "asesor@example.mx",
      stripeCustomerIdExistente: null,
      successUrl: "https://app.example.mx/bienvenida?paso=confirmando",
      cancelUrl: "https://app.example.mx/bienvenida?paso=pago",
    });

    assert.equal(resultado.modo, "stripe");
    assert.equal(llamadas.sessionsCreate.length, 1);
    const payloadSesion = llamadas.sessionsCreate[0];
    assert.ok(payloadSesion, "debió capturarse el payload de la Session");
    assert.equal(payloadSesion.locale, "es-419");
    assert.equal("customer_email" in payloadSesion, false);
    assert.equal(payloadSesion.customer, "cus_mock_123");

    // El email se fija al CREAR el Customer, no en la Session.
    assert.equal(llamadas.customersCreate.length, 1);
    const payloadCustomer = llamadas.customersCreate[0];
    assert.ok(payloadCustomer, "debió capturarse el payload del Customer");
    assert.equal(payloadCustomer.email, "asesor@example.mx");
  } finally {
    mock.reset();
    if (previaKey === undefined) delete process.env.STRIPE_SECRET_KEY;
    else process.env.STRIPE_SECRET_KEY = previaKey;
    if (previaPrice === undefined) delete process.env.STRIPE_PRICE_ID;
    else process.env.STRIPE_PRICE_ID = previaPrice;
  }
});

test("crearCheckoutSession: sin email en nuestra fila, no manda cadena vacía al crear el Customer", async () => {
  const previaKey = process.env.STRIPE_SECRET_KEY;
  const previaPrice = process.env.STRIPE_PRICE_ID;
  process.env.STRIPE_SECRET_KEY = "sk_test_mock";
  process.env.STRIPE_PRICE_ID = "price_mock";

  const llamadas = mockearStripe();

  try {
    const { crearCheckoutSession } = await import(
      `./proveedor-stripe.ts?t=${Date.now()}-b`
    );
    await crearCheckoutSession({
      asesorId: "asesor_2",
      emailAsesor: null,
      stripeCustomerIdExistente: null,
      successUrl: "https://app.example.mx/bienvenida?paso=confirmando",
      cancelUrl: "https://app.example.mx/bienvenida?paso=pago",
    });

    assert.equal(llamadas.customersCreate.length, 1);
    const payloadCustomer = llamadas.customersCreate[0];
    assert.ok(payloadCustomer, "debió capturarse el payload del Customer");
    assert.equal(payloadCustomer.email, undefined);

    const payloadSesion = llamadas.sessionsCreate[0];
    assert.ok(payloadSesion, "debió capturarse el payload de la Session");
    assert.equal(payloadSesion.locale, "es-419");
  } finally {
    mock.reset();
    if (previaKey === undefined) delete process.env.STRIPE_SECRET_KEY;
    else process.env.STRIPE_SECRET_KEY = previaKey;
    if (previaPrice === undefined) delete process.env.STRIPE_PRICE_ID;
    else process.env.STRIPE_PRICE_ID = previaPrice;
  }
});

test("crearCheckoutSession: con Customer YA existente, no crea uno nuevo y reusa el id", async () => {
  const previaKey = process.env.STRIPE_SECRET_KEY;
  const previaPrice = process.env.STRIPE_PRICE_ID;
  process.env.STRIPE_SECRET_KEY = "sk_test_mock";
  process.env.STRIPE_PRICE_ID = "price_mock";

  const llamadas = mockearStripe();

  try {
    const { crearCheckoutSession } = await import(
      `./proveedor-stripe.ts?t=${Date.now()}-c`
    );
    const resultado = await crearCheckoutSession({
      asesorId: "asesor_3",
      emailAsesor: "otro@example.mx",
      stripeCustomerIdExistente: "cus_ya_existente",
      successUrl: "https://app.example.mx/bienvenida?paso=confirmando",
      cancelUrl: "https://app.example.mx/bienvenida?paso=pago",
    });

    assert.equal(llamadas.customersCreate.length, 0);
    const payloadSesion = llamadas.sessionsCreate[0];
    assert.ok(payloadSesion, "debió capturarse el payload de la Session");
    assert.equal(payloadSesion.customer, "cus_ya_existente");
    assert.equal(payloadSesion.locale, "es-419");
    assert.equal("customer_email" in payloadSesion, false);
    assert.equal(resultado.customerId, "cus_ya_existente");
  } finally {
    mock.reset();
    if (previaKey === undefined) delete process.env.STRIPE_SECRET_KEY;
    else process.env.STRIPE_SECRET_KEY = previaKey;
    if (previaPrice === undefined) delete process.env.STRIPE_PRICE_ID;
    else process.env.STRIPE_PRICE_ID = previaPrice;
  }
});
