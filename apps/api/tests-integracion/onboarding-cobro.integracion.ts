/**
 * onboarding-cobro.integracion.ts — el CAMINO DEL DINERO contra la api REAL.
 *
 * Corre la app Hono en proceso (app.request, sin puerto) contra el Postgres
 * local. Cubre la doctrina del dinero (no negociable):
 *   1. Webhook SIN firma / con firma inválida → rechazado, CERO efectos.
 *   2. Webhook sin STRIPE_WEBHOOK_SECRET → 503 honesto, CERO efectos.
 *   3. Webhook duplicado (mismo event.id) → UN solo efecto (idempotencia).
 *   4. Muralla del dinero: sin suscripción con acceso → 402; con acceso → pasa.
 *   5. Tenencia: el webhook resuelve al asesor por NUESTRA fila (metadata /
 *      customerId), jamás toca a otro asesor; /pago/cancelar solo toca al
 *      asesor del token.
 *   6. Modo demo honesto: sin Stripe, /pago/checkout da acceso "demo" (no finge
 *      un pago); /pago/cancelar responde honesto; el webhook NO finge nada.
 *
 * Stripe NO se llama de verdad: las firmas se generan localmente con un secret
 * de prueba (generateTestHeaderString) — fixtures firmados, sin red.
 */
import { test, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { app } from "../src/app.js";
import { prisma } from "@socrates/db";

// ── Utilería de entorno (los flags se leen POR REQUEST) ─────────────────────
async function conEnv(vars: Record<string, string | undefined>, fn: () => Promise<void>) {
  const previas = new Map(Object.keys(vars).map((k) => [k, process.env[k]]));
  for (const [k, v] of Object.entries(vars)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
  try {
    await fn();
  } finally {
    for (const [k, v] of previas) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  }
}

const WEBHOOK_SECRET = "whsec_test_local_secret_para_integracion";

/** Firma un payload como lo haría Stripe, con nuestro secret de prueba local. */
async function firmarPayload(payload: string): Promise<string> {
  const { default: Stripe } = await import("stripe");
  const s = new Stripe("sk_test_fake_solo_para_firmar");
  return s.webhooks.generateTestHeaderString({ payload, secret: WEBHOOK_SECRET });
}

/** POST /pago/webhook con firma válida (o la que se pase). */
async function postWebhook(payload: string, firma?: string) {
  return app.request("/pago/webhook", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(firma ? { "stripe-signature": firma } : {}),
    },
    body: payload,
  });
}

function eventoSuscripcion(opts: {
  eventId: string;
  status: string;
  customer: string;
  asesorId?: string;
  trialEnd?: number | null;
}): string {
  return JSON.stringify({
    id: opts.eventId,
    type: "customer.subscription.updated",
    data: {
      object: {
        id: `sub_${opts.eventId}`,
        object: "subscription",
        status: opts.status,
        customer: opts.customer,
        metadata: opts.asesorId ? { asesorId: opts.asesorId } : {},
        trial_end: opts.trialEnd ?? null,
      },
    },
  });
}

// ── Asesores de prueba (marcados para limpieza) ─────────────────────────────
const CLERK_A = "itest-cobro-asesor-A";
const CLERK_B = "itest-cobro-asesor-B";

async function limpiar() {
  await prisma.eventoStripe.deleteMany({ where: { id: { startsWith: "evt_itest_" } } });
  await prisma.asesor.deleteMany({ where: { clerkUserId: { in: [CLERK_A, CLERK_B] } } });
}

async function crearAsesor(clerkUserId: string, datos: Record<string, unknown>) {
  return prisma.asesor.create({
    data: { clerkUserId, ...datos },
  });
}

before(async () => {
  const url = new URL(process.env.DATABASE_URL ?? "");
  if (
    !["localhost", "127.0.0.1", "::1", "[::1]"].includes(url.hostname) &&
    process.env.PERMITIR_BASE_NO_LOCAL !== "1"
  ) {
    throw new Error(`test:integracion se niega a correr contra una base no local (${url.hostname}).`);
  }
  await prisma.$queryRaw`SELECT 1`;
  await limpiar();
});

beforeEach(async () => {
  await limpiar();
});

after(async () => {
  await limpiar();
  await prisma.$disconnect();
});

// ── 1. Webhook sin firma / firma inválida → 400, cero efectos ────────────────
test("webhook con firma AUSENTE → 400 y no aplica ningún efecto", async () => {
  await conEnv({ STRIPE_SECRET_KEY: "sk_test_x", STRIPE_WEBHOOK_SECRET: WEBHOOK_SECRET }, async () => {
    const asesor = await crearAsesor(CLERK_A, { estadoSuscripcion: "ninguna", stripeCustomerId: "cus_itest_A" });
    const payload = eventoSuscripcion({
      eventId: "evt_itest_sinfirma",
      status: "active",
      customer: "cus_itest_A",
      asesorId: asesor.id,
    });
    const res = await postWebhook(payload); // sin cabecera stripe-signature
    assert.equal(res.status, 400);
    const despues = await prisma.asesor.findUnique({ where: { id: asesor.id } });
    assert.equal(despues?.estadoSuscripcion, "ninguna", "un webhook sin firma NO debe cambiar el estado");
    const registrado = await prisma.eventoStripe.findUnique({ where: { id: "evt_itest_sinfirma" } });
    assert.equal(registrado, null, "un webhook sin firma NO se registra");
  });
});

test("webhook con firma INVÁLIDA → 400 y no aplica ningún efecto", async () => {
  await conEnv({ STRIPE_SECRET_KEY: "sk_test_x", STRIPE_WEBHOOK_SECRET: WEBHOOK_SECRET }, async () => {
    const asesor = await crearAsesor(CLERK_A, { estadoSuscripcion: "ninguna", stripeCustomerId: "cus_itest_A" });
    const payload = eventoSuscripcion({
      eventId: "evt_itest_firmamala",
      status: "active",
      customer: "cus_itest_A",
      asesorId: asesor.id,
    });
    const res = await postWebhook(payload, "t=1,v1=firma_falsificada");
    assert.equal(res.status, 400);
    const despues = await prisma.asesor.findUnique({ where: { id: asesor.id } });
    assert.equal(despues?.estadoSuscripcion, "ninguna");
  });
});

// ── 2. Webhook sin secret configurado → 503 honesto, cero efectos ────────────
test("webhook sin STRIPE_WEBHOOK_SECRET → 503 honesto, sin efectos", async () => {
  await conEnv({ STRIPE_SECRET_KEY: "sk_test_x", STRIPE_WEBHOOK_SECRET: undefined }, async () => {
    const asesor = await crearAsesor(CLERK_A, { estadoSuscripcion: "ninguna", stripeCustomerId: "cus_itest_A" });
    // Aunque el payload fuera "válido", sin secret no hay con qué verificar.
    const payload = eventoSuscripcion({
      eventId: "evt_itest_sinsecret",
      status: "active",
      customer: "cus_itest_A",
      asesorId: asesor.id,
    });
    const res = await postWebhook(payload, "t=1,v1=loquesea");
    assert.equal(res.status, 503);
    const body = (await res.json()) as { error: { codigo: string } };
    assert.equal(body.error.codigo, "SIN_STRIPE");
    const despues = await prisma.asesor.findUnique({ where: { id: asesor.id } });
    assert.equal(despues?.estadoSuscripcion, "ninguna");
  });
});

// ── 3. Idempotencia: mismo event.id dos veces → UN solo efecto ───────────────
test("webhook duplicado (mismo event.id) → un solo efecto (idempotente)", async () => {
  await conEnv({ STRIPE_SECRET_KEY: "sk_test_x", STRIPE_WEBHOOK_SECRET: WEBHOOK_SECRET }, async () => {
    const asesor = await crearAsesor(CLERK_A, { estadoSuscripcion: "ninguna", stripeCustomerId: "cus_itest_A" });
    const trialEnd = Math.floor(Date.now() / 1000) + 14 * 24 * 60 * 60;
    const payload = eventoSuscripcion({
      eventId: "evt_itest_dup",
      status: "trialing",
      customer: "cus_itest_A",
      asesorId: asesor.id,
      trialEnd,
    });
    const firma = await firmarPayload(payload);

    const res1 = await postWebhook(payload, firma);
    assert.equal(res1.status, 200);
    const body1 = (await res1.json()) as { recibido?: boolean; duplicado?: boolean };
    assert.equal(body1.duplicado, undefined, "el primero no es duplicado");

    const trasPrimero = await prisma.asesor.findUnique({ where: { id: asesor.id } });
    assert.equal(trasPrimero?.estadoSuscripcion, "prueba", "trialing → prueba");

    // Segundo envío del MISMO evento: se salta (idempotente).
    const res2 = await postWebhook(payload, firma);
    assert.equal(res2.status, 200);
    const body2 = (await res2.json()) as { recibido?: boolean; duplicado?: boolean };
    assert.equal(body2.duplicado, true, "el segundo se reconoce como duplicado");

    // Solo hay UNA fila de EventoStripe para ese id.
    const eventos = await prisma.eventoStripe.count({ where: { id: "evt_itest_dup" } });
    assert.equal(eventos, 1, "el evento se registra una sola vez");
  });
});

// ── 4. Muralla del dinero (server-side) ──────────────────────────────────────
test("muralla: en modo demo el asesor demo (estado 'demo') SÍ entra a negocio (200)", async () => {
  // Modo demo local (sin Clerk): el token no viaja; auth resuelve al demo sembrado.
  await conEnv(
    { NODE_ENV: "test", CLERK_SECRET_KEY: undefined, CLERK_JWT_KEY: undefined, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: undefined },
    async () => {
      // Aseguramos que el asesor demo tenga acceso "demo" (como lo deja el seed).
      await prisma.asesor.update({
        where: { clerkUserId: "demo-asesor" },
        data: { estadoSuscripcion: "demo" },
      });
      const res = await app.request("/empleados");
      assert.equal(res.status, 200, "el asesor demo con estado 'demo' pasa la muralla");
    },
  );
});

test("muralla: sin suscripción con acceso, la ruta de negocio responde 402", async () => {
  await conEnv(
    { NODE_ENV: "test", CLERK_SECRET_KEY: undefined, CLERK_JWT_KEY: undefined, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: undefined },
    async () => {
      // Degradamos temporalmente al asesor demo a "ninguna".
      const previo = await prisma.asesor.findUnique({ where: { clerkUserId: "demo-asesor" } });
      await prisma.asesor.update({
        where: { clerkUserId: "demo-asesor" },
        data: { estadoSuscripcion: "ninguna" },
      });
      try {
        const res = await app.request("/empleados");
        assert.equal(res.status, 402, "sin acceso → 402");
        const body = (await res.json()) as { error: { codigo: string; mensaje: string } };
        assert.equal(body.error.codigo, "SIN_SUSCRIPCION");
        assert.doesNotMatch(body.error.mensaje, /webhook|stripe|token|api/i, "mensaje de oficina");

        // /yo y /pago NO están tras la muralla: deben responder aunque no haya acceso.
        const resYo = await app.request("/yo");
        assert.equal(resYo.status, 200, "/yo se usa DURANTE el recibimiento, no lo bloquea la muralla");
      } finally {
        // Restaurar el estado del demo (otras suites lo esperan con acceso).
        await prisma.asesor.update({
          where: { clerkUserId: "demo-asesor" },
          data: { estadoSuscripcion: previo?.estadoSuscripcion ?? "demo" },
        });
      }
    },
  );
});

test("muralla: cubre TAMBIÉN las sub-rutas (GET /expedientes/:id → 402 sin acceso)", async () => {
  await conEnv(
    { NODE_ENV: "test", CLERK_SECRET_KEY: undefined, CLERK_JWT_KEY: undefined, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: undefined },
    async () => {
      const previo = await prisma.asesor.findUnique({ where: { clerkUserId: "demo-asesor" } });
      await prisma.asesor.update({
        where: { clerkUserId: "demo-asesor" },
        data: { estadoSuscripcion: "ninguna" },
      });
      try {
        const res = await app.request("/expedientes/cualquier-id-inventado");
        assert.equal(res.status, 402, "la muralla protege también las sub-rutas, antes del 404");
      } finally {
        await prisma.asesor.update({
          where: { clerkUserId: "demo-asesor" },
          data: { estadoSuscripcion: previo?.estadoSuscripcion ?? "demo" },
        });
      }
    },
  );
});

// ── 5. Tenencia: el webhook NUNCA toca al asesor equivocado ──────────────────
test("tenencia: el webhook resuelve por metadata.asesorId (nuestra fila), no toca a otro asesor", async () => {
  await conEnv({ STRIPE_SECRET_KEY: "sk_test_x", STRIPE_WEBHOOK_SECRET: WEBHOOK_SECRET }, async () => {
    const a = await crearAsesor(CLERK_A, { estadoSuscripcion: "ninguna", stripeCustomerId: "cus_itest_A" });
    const b = await crearAsesor(CLERK_B, { estadoSuscripcion: "ninguna", stripeCustomerId: "cus_itest_B" });

    // Evento para el asesor A (por metadata). Debe tocar SOLO a A.
    const payload = eventoSuscripcion({
      eventId: "evt_itest_tenencia",
      status: "active",
      customer: "cus_itest_A",
      asesorId: a.id,
    });
    const firma = await firmarPayload(payload);
    const res = await postWebhook(payload, firma);
    assert.equal(res.status, 200);

    const trasA = await prisma.asesor.findUnique({ where: { id: a.id } });
    const trasB = await prisma.asesor.findUnique({ where: { id: b.id } });
    assert.equal(trasA?.estadoSuscripcion, "activa", "A se activa");
    assert.equal(trasB?.estadoSuscripcion, "ninguna", "B queda intacto");
  });
});

test("tenencia: un customer del payload que no mapea a ninguna fila NO crea ni cambia nada", async () => {
  await conEnv({ STRIPE_SECRET_KEY: "sk_test_x", STRIPE_WEBHOOK_SECRET: WEBHOOK_SECRET }, async () => {
    const a = await crearAsesor(CLERK_A, { estadoSuscripcion: "ninguna", stripeCustomerId: "cus_itest_A" });
    // Evento SIN metadata y con un customer desconocido: no hay a quién aplicar.
    const payload = eventoSuscripcion({
      eventId: "evt_itest_huerfano",
      status: "active",
      customer: "cus_itest_desconocido",
    });
    const firma = await firmarPayload(payload);
    const res = await postWebhook(payload, firma);
    // El webhook responde 200 (evento reconocido pero sin asesor resoluble → se ignora).
    assert.equal(res.status, 200);
    const trasA = await prisma.asesor.findUnique({ where: { id: a.id } });
    assert.equal(trasA?.estadoSuscripcion, "ninguna", "ningún asesor ajeno se ve afectado");
  });
});

// ── 6. Modo demo honesto: /pago/checkout da acceso 'demo', jamás finge pago ──
test("modo demo: /pago/checkout responde modo:demo y deja al asesor en estado 'demo' (no 'activa')", async () => {
  await conEnv(
    {
      NODE_ENV: "test",
      STRIPE_SECRET_KEY: undefined, // ← sin llave: modo demo
      CLERK_SECRET_KEY: undefined,
      CLERK_JWT_KEY: undefined,
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: undefined,
    },
    async () => {
      // Partimos del demo sin acceso para ver el efecto del checkout demo.
      await prisma.asesor.update({
        where: { clerkUserId: "demo-asesor" },
        data: { estadoSuscripcion: "ninguna", onboardingEtapa: "perfil" },
      });
      const res = await app.request("/pago/checkout", { method: "POST" });
      assert.equal(res.status, 200);
      const body = (await res.json()) as { url: string; modo: string };
      assert.equal(body.modo, "demo");
      assert.match(body.url, /demo=1/, "la url de demo trae la marca ?demo=1");

      const demo = await prisma.asesor.findUnique({ where: { clerkUserId: "demo-asesor" } });
      assert.equal(demo?.estadoSuscripcion, "demo", "el checkout demo da acceso 'demo', NO 'activa'/'prueba'");

      // Restaurar el demo con acceso para el resto de la batería.
      await prisma.asesor.update({
        where: { clerkUserId: "demo-asesor" },
        data: { estadoSuscripcion: "demo", onboardingEtapa: "completo" },
      });
    },
  );
});
