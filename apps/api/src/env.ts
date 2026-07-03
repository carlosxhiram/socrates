/**
 * env.ts — bootstrap de entorno (debe importarse ANTES que el cliente de BD).
 *
 * 1) Carga el `.env` de la raíz del monorepo si existe (dev local).
 * 2) Si DATABASE_URL falta, usa el Postgres local de desarrollo (rol/base
 *    `socrates`, ver README) — así `pnpm --filter api dev` corre sin configurar
 *    nada. Si viene una URL `file:` (SQLite de antes del cambio a Postgres),
 *    avisa y usa el default: el esquema ya no es SQLite.
 *
 * En producción (Railway/Postgres) DATABASE_URL siempre viene del entorno y este
 * archivo no la toca.
 */
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
// apps/api/src → raíz del monorepo
const RAIZ = resolve(__dirname, "..", "..", "..");

function cargarDotenv(ruta: string) {
  if (!existsSync(ruta)) return;
  const texto = readFileSync(ruta, "utf-8");
  for (const linea of texto.split("\n")) {
    const limpia = linea.trim();
    if (!limpia || limpia.startsWith("#")) continue;
    const idx = limpia.indexOf("=");
    if (idx === -1) continue;
    const clave = limpia.slice(0, idx).trim();
    let valor = limpia.slice(idx + 1).trim();
    if (
      (valor.startsWith('"') && valor.endsWith('"')) ||
      (valor.startsWith("'") && valor.endsWith("'"))
    ) {
      valor = valor.slice(1, -1);
    }
    if (process.env[clave] === undefined) process.env[clave] = valor;
  }
}

// 1) .env de la raíz
cargarDotenv(join(RAIZ, ".env"));

// 2) DATABASE_URL: default al Postgres local de desarrollo si falta.
const DB_DEV_POSTGRES = "postgresql://socrates:socrates@localhost:5432/socrates?schema=public";
const actual = process.env.DATABASE_URL;
if (!actual) {
  if (process.env.NODE_ENV === "production") {
    // En producción la base SIEMPRE viene del entorno (Railway); caer en
    // silencio a localhost sería un deploy "sano" sin base. Mejor claro y ya.
    throw new Error("Falta DATABASE_URL en producción (Railway la inyecta; revisa las variables del servicio).");
  }
  process.env.DATABASE_URL = DB_DEV_POSTGRES;
} else if (actual.startsWith("file:")) {
  console.warn(
    "[env] DATABASE_URL apunta a SQLite (file:...), pero el esquema es Postgres desde 2026-07-03. " +
      "Usando el Postgres local de desarrollo; actualiza tu .env (ver .env.example).",
  );
  process.env.DATABASE_URL = DB_DEV_POSTGRES;
}
