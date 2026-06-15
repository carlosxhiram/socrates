/**
 * index.ts — el servidor Hono de Sócrates (api en Railway, long-running).
 *
 * Orden de middleware (arquitectura §6.1): CORS → Auth → Validación (por ruta) →
 * Errores. Rutas públicas (GET /health) se montan ANTES del Auth.
 *
 * Lee process.env.PORT (Railway lo inyecta; en local default 8787).
 * Arranca SIN claves (Modo sin claves / asesor demo) — NFR-11.
 */
import "./env.js"; // ⬅ DEBE ir primero: configura DATABASE_URL antes de cargar la BD.
import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { prisma } from "@socrates/db";
import { authMiddleware, type AuthedVars } from "./middleware/auth.js";
import { manejadorErrores } from "./middleware/errors.js";
import { expedientesRouter } from "./rutas/expedientes.js";
import { empleadosRouter } from "./rutas/empleados.js";
import { catalogoRouter } from "./rutas/catalogo.js";
import { entregablesRouter } from "./rutas/entregables.js";
import { yoRouter } from "./rutas/yo.js";
import { pagoRouter } from "./rutas/pago.js";
import { manejarWebhookStripe } from "./pago/webhook.js";
import { stripeHabilitado } from "./pago/proveedor-stripe.js";
import { esModoSinClaves } from "./ia/proveedor-ia.js";
import { crearProveedorBusqueda } from "./busqueda/proveedor-busqueda.js";
import { crearAlmacenR2 } from "./storage/r2-client.js";

const app = new Hono<{ Variables: AuthedVars }>();

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
app.get("/health", async (c) => {
  let db = "ok";
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    db = "error";
  }
  return c.json({
    estado: "vivo",
    db,
    modoSinClavesIA: esModoSinClaves(),
    busqueda: crearProveedorBusqueda().nombre,
    almacenamiento: crearAlmacenR2().disponible ? "configurado" : "modo-sin-claves",
    cobro: stripeHabilitado() ? "stripe" : "modo-demo",
  });
});

// ── Webhook de Stripe (PÚBLICO: Stripe no manda token; va ANTES del auth) ─────
// Verifica firma + idempotente. Necesita el cuerpo CRUDO (c.req.text()), por eso
// se monta antes de cualquier middleware que pudiera consumir el body.
app.post("/pago/webhook", manejarWebhookStripe);

// ── Auth (todo lo demás requiere identidad) ──────────────────────────────────
app.use("*", authMiddleware);

// ── Rutas ────────────────────────────────────────────────────────────────────
app.route("/expedientes", expedientesRouter);
app.route("/empleados", empleadosRouter);
app.route("/catalogo", catalogoRouter);
app.route("/entregables", entregablesRouter);
app.route("/yo", yoRouter);
app.route("/pago", pagoRouter);

const port = Number(process.env.PORT ?? 8787);

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`🐢 Sócrates api escuchando en http://localhost:${info.port}`);
  console.log(`   Modo sin claves IA: ${esModoSinClaves() ? "SÍ (fallback)" : "no"}`);
  console.log(`   Almacenamiento R2: ${crearAlmacenR2().disponible ? "configurado" : "modo-sin-claves"}`);
});

export { app };
