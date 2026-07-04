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
import { manejadorErrores } from "./middleware/errors.js";
import { expedientesRouter } from "./rutas/expedientes.js";
import { empleadosRouter } from "./rutas/empleados.js";
import { catalogoRouter } from "./rutas/catalogo.js";
import { entregablesRouter } from "./rutas/entregables.js";
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
    },
    db === "ok" ? 200 : 503,
  );
});

// ── 404 dentro del contrato de error (nada de texto plano) ──────────────────
app.notFound((c) =>
  c.json({ error: { codigo: "NO_EXISTE", mensaje: "Esa ruta no existe en la oficina." } }, 404),
);

// ── Auth (todo lo demás requiere identidad) ──────────────────────────────────
app.use("*", authMiddleware);

// ── Rutas ────────────────────────────────────────────────────────────────────
app.route("/expedientes", expedientesRouter);
app.route("/empleados", empleadosRouter);
app.route("/catalogo", catalogoRouter);
app.route("/entregables", entregablesRouter);
app.route("/sesiones", sesionesRouter);
