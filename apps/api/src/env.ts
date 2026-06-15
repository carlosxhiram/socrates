/**
 * env.ts — bootstrap de entorno (debe importarse ANTES que el cliente de BD).
 *
 * 1) Carga el `.env` de la raíz del monorepo si existe (dev local).
 * 2) Si DATABASE_URL falta o es una ruta SQLite RELATIVA, la resuelve a la ruta
 *    ABSOLUTA del dev.db de packages/db — así `pnpm --filter api dev` corre sin
 *    configurar nada (la api abre el SQLite desde cualquier cwd).
 *
 * En producción (Railway/Postgres) DATABASE_URL siempre viene del entorno y este
 * archivo no la toca.
 */
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve, isAbsolute } from "node:path";

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

// 2) DATABASE_URL: default SQLite absoluto si falta o es relativo.
const DB_DEV_ABS = `file:${join(RAIZ, "packages", "db", "prisma", "dev.db")}`;
const actual = process.env.DATABASE_URL;
if (!actual) {
  process.env.DATABASE_URL = DB_DEV_ABS;
} else if (actual.startsWith("file:")) {
  const ruta = actual.slice("file:".length);
  if (!isAbsolute(ruta)) {
    process.env.DATABASE_URL = `file:${resolve(RAIZ, "packages", "db", "prisma", ruta.replace(/^\.\//, ""))}`;
  }
}
