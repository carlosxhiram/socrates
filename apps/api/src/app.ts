/**
 * app.ts — la app Hono de Sócrates, SIN levantar servidor.
 *
 * Separada de index.ts para poder probarla en proceso (app.request) desde los
 * tests de integración. Orden de middleware (arquitectura §6.1): CORS → Auth →
 * Validación (por ruta) → Errores. Rutas públicas (GET /health) van ANTES del Auth.
 */
import "./env.js"; // ⬅ DEBE ir primero: configura DATABASE_URL antes de cargar la BD.
import { Hono } from "hono";
import { cors } from "hono/cors";
import { prisma } from "@socrates/db";
import { authMiddleware, type AuthedVars } from "./middleware/auth.js";
import { requiereSuscripcion } from "./middleware/suscripcion.js";
import { manejadorErrores } from "./middleware/errors.js";
import { expedientesRouter } from "./rutas/expedientes.js";
import { empleadosRouter } from "./rutas/empleados.js";
import { catalogoRouter } from "./rutas/catalogo.js";
import { entregablesRouter } from "./rutas/entregables.js";
import { yoRouter } from "./rutas/yo.js";
import { pagoRouter } from "./rutas/pago.js";
import { manejarWebhookStripe } from "./pago/webhook.js";
import { stripeHabilitado } from "./pago/proveedor-stripe.js";
import { sesionesRouter } from "./rutas/sesiones.js";
import { esModoSinClaves } from "./ia/proveedor-ia.js";
import { crearProveedorBusqueda } from "./busqueda/proveedor-busqueda.js";
import { crearAlmacenR2 } from "./storage/r2-client.js";

export const app = new Hono<{ Variables: AuthedVars }>();

app.onError(manejadorErrores);

// ── CORS (origen de web permitido) ───────────────────────────────────────────
const webOrigin = process.env.WEB_ORIGIN ?? "http://localhost:3000";
app.use(
  "*",
  cors({
    origin: webOrigin,
    allowHeaders: ["Authorization", "Content-Type"],
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  }),
);

// ── Salud (pública, DB-aware) ────────────────────────────────────────────────
// Con la base caída responde 503: un healthcheck (Railway) debe reprobar un
// servicio que no puede servir datos — "vivo pero degradado" se reporta, no se
// disfraza de sano. El proceso NO truena (NFR-11): sigue respondiendo honesto.
app.get("/health", async (c) => {
  let db = "ok";
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    db = "error";
  }
  return c.json(
    {
      estado: "vivo",
      db,
      modoSinClavesIA: esModoSinClaves(),
      busqueda: crearProveedorBusqueda().nombre,
      almacenamiento: crearAlmacenR2().disponible ? "configurado" : "modo-sin-claves",
      cobro: stripeHabilitado() ? "stripe" : "modo-demo",
    },
    db === "ok" ? 200 : 503,
  );
});

// ── Webhook de Stripe (PÚBLICO: Stripe no manda token; va ANTES del auth) ─────
// Verifica firma + idempotente. Necesita el cuerpo CRUDO (c.req.text()), por eso
// se monta antes de cualquier middleware que pudiera consumir el body. Sin
// STRIPE_WEBHOOK_SECRET responde 503 honesto y cero efectos.
app.post("/pago/webhook", manejarWebhookStripe);

// ── 404 dentro del contrato de error (nada de texto plano) ──────────────────
app.notFound((c) =>
  c.json({ error: { codigo: "NO_EXISTE", mensaje: "Esa ruta no existe en la oficina." } }, 404),
);

// ── Auth (todo lo demás requiere identidad) ──────────────────────────────────
app.use("*", authMiddleware);

// ── Recibimiento (identidad SÍ, suscripción NO): se usan DURANTE el onboarding,
// antes de tener acceso. Por eso se montan ANTES de la muralla del dinero. ─────
app.route("/yo", yoRouter);
app.route("/pago", pagoRouter);

// ── Muralla del dinero: las rutas de NEGOCIO exigen suscripción con acceso ────
// (demo/prueba/activa), no solo identidad. Un JWT válido sin suscripción NO lee
// datos de negocio. Se aplica ANTES de montar sus routers.
app.use("/expedientes/*", requiereSuscripcion);
app.use("/expedientes", requiereSuscripcion);
app.use("/empleados/*", requiereSuscripcion);
app.use("/empleados", requiereSuscripcion);
app.use("/catalogo/*", requiereSuscripcion);
app.use("/catalogo", requiereSuscripcion);
app.use("/entregables/*", requiereSuscripcion);
app.use("/entregables", requiereSuscripcion);

// ── Rutas de negocio ─────────────────────────────────────────────────────────
app.route("/expedientes", expedientesRouter);
app.route("/empleados", empleadosRouter);
app.route("/catalogo", catalogoRouter);
app.route("/entregables", entregablesRouter);
app.route("/sesiones", sesionesRouter);
