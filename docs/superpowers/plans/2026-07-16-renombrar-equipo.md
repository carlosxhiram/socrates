# Renombrar equipo por oficina — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development (recomendado) o superpowers:executing-plans, task por task. Los pasos usan checkbox (`- [ ]`).

**Goal:** cada asesor (oficina) le pone nombre propio a sus 6 empleados; ese nombre se usa en todo el producto. Sin avatar. El gerente (Sócrates) no se renombra.

**Architecture:** el nombre por defecto (Diego…) y el cargo viven en el glosario (`@socrates/shared`, fuente única). El override por oficina se guarda en un campo `Asesor.nombresEquipo Json?` (mapa `{rol: nombre}`, solo lo cambiado). Un helper `nombreEmpleado(rol, nombresEquipo?)` resuelve override → default. La API resuelve al leer (conoce al asesor por el token); la web edita vía un `PATCH`.

**Tech Stack:** Prisma 6 (Postgres), Hono (API), Next 16 / React 19 (web), zod, node:test (integración `app.request`).

---

## Mapa de fábrica (glosario)

| rol | nombrePorDefecto | cargo |
|---|---|---|
| PROSPECTOR | Diego | Prospector |
| INVESTIGADOR | Hiram | Investigador |
| ASESOR_PRODUCTO | Jair | Asesor de Producto |
| NEGOCIADOR | Katya | Negociadora |
| TRAMITADOR | María | Trámites |
| GESTOR | Paula | Gestora |

Sócrates (gerente, rol `SOCRATES`) no tiene `nombrePorDefecto` ni es renombrable.

## Archivos que se tocan

- **Datos:** `packages/db/prisma/schema.prisma` (campo), nueva migración.
- **Shared:** `packages/shared/src/glosario.ts` (campos + helpers), `packages/shared/src/dto/index.ts` (zod + DTOs).
- **API:** `apps/api/src/rutas/empleados.ts` (resolver), `apps/api/src/rutas/yo.ts` (exponer + `PATCH /yo/equipo`).
- **Web:** `apps/web/src/lib/api-client.ts` (cliente), `apps/web/src/app/acciones/equipo.ts` (nueva server action), `apps/web/src/components/oficina/PanelEquipo.tsx` (editar + cargo), `apps/web/src/components/onboarding/Wizard.tsx` (PasoBienvenida editable), `apps/web/src/components/oficina/TarjetaExpediente.tsx` + `apps/web/src/app/expedientes/[id]/page.tsx` (propagación).
- **Tests:** `apps/api/tests-integracion/equipo.integracion.ts` (nuevo), test unitario del helper en `packages/shared`.

---

## Task 1 — Glosario: nombre de fábrica, cargo y helpers

**Files:** Modify `packages/shared/src/glosario.ts`; Test `packages/shared/src/glosario.test.ts`

- [ ] **Step 1 — Extender `PerfilEmpleado`** con dos campos opcionales:
```ts
export interface PerfilEmpleado {
  rol: RolEmpleado;
  nombre: string;               // nombre "de sistema" (Sócrates; o "El Prospector" legado)
  descripcion: string;
  icono: string;
  /** Nombre propio de fábrica del empleado del panel (Diego…). Ausente en SOCRATES. */
  nombrePorDefecto?: string;
  /** Puesto mostrado como cargo bajo el nombre (Prospector…). Ausente en SOCRATES. */
  cargo?: string;
}
```

- [ ] **Step 2 — Poblar los 6 del panel** en `EMPLEADOS` con `nombrePorDefecto` y `cargo` (tabla de fábrica arriba). No tocar `SOCRATES`. Ej. PROSPECTOR gana `nombrePorDefecto: "Diego", cargo: "Prospector"`.

- [ ] **Step 3 — Helpers de resolución** (exportar en glosario.ts):
```ts
/** Nombre a mostrar: override de la oficina > nombre de fábrica > nombre de sistema. */
export function nombreEmpleado(
  rol: RolEmpleado,
  nombresEquipo?: Record<string, string> | null,
): string {
  const override = nombresEquipo?.[rol]?.trim();
  if (override) return override;
  return EMPLEADOS[rol].nombrePorDefecto ?? EMPLEADOS[rol].nombre;
}
/** Cargo (puesto) del empleado, para el subtítulo. Vacío para SOCRATES. */
export function cargoEmpleado(rol: RolEmpleado): string {
  return EMPLEADOS[rol].cargo ?? "";
}
```

- [ ] **Step 4 — Test unitario** `glosario.test.ts`:
```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { nombreEmpleado, cargoEmpleado } from "./glosario.js";

test("nombreEmpleado usa el override de la oficina cuando existe", () => {
  assert.equal(nombreEmpleado("PROSPECTOR", { PROSPECTOR: "Toño" }), "Toño");
});
test("nombreEmpleado cae al nombre de fábrica sin override", () => {
  assert.equal(nombreEmpleado("PROSPECTOR", null), "Diego");
  assert.equal(nombreEmpleado("PROSPECTOR", {}), "Diego");
});
test("nombreEmpleado ignora override vacío o de espacios", () => {
  assert.equal(nombreEmpleado("PROSPECTOR", { PROSPECTOR: "  " }), "Diego");
});
test("cargoEmpleado devuelve el puesto del panel", () => {
  assert.equal(cargoEmpleado("PROSPECTOR"), "Prospector");
});
```
- [ ] **Step 5** — `pnpm --filter @socrates/shared test` → PASS. Commit: `feat(shared): nombre de fábrica, cargo y helper de resolución del equipo`.

---

## Task 2 — Shared DTO/zod: schema de nombres y campos de DTO

**Files:** Modify `packages/shared/src/dto/index.ts`

- [ ] **Step 1 — Schema de override** (validación del PATCH). Solo roles del panel, nombre 1–40 tras trim:
```ts
export const NombresEquipoSchema = z
  .record(RolEmpleadoSchema, z.string().trim().min(1, "El nombre no puede ir vacío.").max(40, "Máximo 40 caracteres."))
  .refine((m) => Object.keys(m).every((r) => ROLES_PANEL.includes(r as RolEmpleado)), {
    message: "Solo puedes renombrar a los 6 del panel.",
  });
export type NombresEquipo = z.infer<typeof NombresEquipoSchema>;
```
(Requiere importar `ROLES_PANEL`; `RolEmpleadoSchema` ya existe.)

- [ ] **Step 2 — `EmpleadoEstadoDTOSchema` gana `cargo`:** añadir `cargo: z.string()` junto a `nombre`.

- [ ] **Step 3 — `YoDTOSchema` expone los overrides** para la propagación en la web: añadir en el objeto raíz `nombresEquipo: z.record(z.string(), z.string())` (mapa resuelto-o-crudo; ver Task 4). Actualizar el tipo `YoDTO`.

- [ ] **Step 4** — `pnpm --filter @socrates/shared typecheck` → PASS. Commit: `feat(shared): DTO de nombres de equipo (zod + cargo + YoDTO)`.

---

## Task 3 — Datos: campo `nombresEquipo` en Asesor + migración

**Files:** Modify `packages/db/prisma/schema.prisma`; Create `packages/db/prisma/migrations/<ts>_equipo_nombres/migration.sql`

- [ ] **Step 1 — Schema:** en `model Asesor`, tras `especialidad`, añadir:
```prisma
  // Nombres propios que la oficina le puso a sus 6 empleados (glosario ROLES_PANEL).
  // Mapa { rol: nombre }; solo los cambiados. Cosmético, sin FK. Ver nombreEmpleado().
  nombresEquipo Json?
```
- [ ] **Step 2 — Migración.** Si hay Postgres local (`service postgresql start`): `pnpm db:migrate --name equipo_nombres`. Si no, crear el archivo manualmente `migrations/<YYYYMMDDHHMMSS>_equipo_nombres/migration.sql` con:
```sql
ALTER TABLE "Asesor" ADD COLUMN "nombresEquipo" JSONB;
```
y registrar en el mismo formato de las migraciones existentes.
- [ ] **Step 3** — `pnpm db:generate` (regenera el cliente con el campo). `pnpm --filter @socrates/db typecheck` → PASS.
- [ ] **Step 4** — Commit: `feat(db): Asesor.nombresEquipo (override de nombres por oficina)`.

**Nota:** el seed (`sembrarEmpleados`) NO cambia — la tabla `Empleado` sigue siendo el catálogo global de roles; los nombres personalizados viven en `Asesor`, no ahí.

---

## Task 4 — API: resolver al leer y guardar

**Files:** Modify `apps/api/src/rutas/empleados.ts`, `apps/api/src/rutas/yo.ts`; Test `apps/api/tests-integracion/equipo.integracion.ts`

- [ ] **Step 1 — `GET /empleados` resuelve nombre + cargo.** Cargar el asesor para leer `nombresEquipo`, y usar los helpers:
```ts
const asesor = await prisma.asesor.findUnique({ where: { id: asesorId }, select: { nombresEquipo: true } });
const nombres = (asesor?.nombresEquipo ?? {}) as Record<string, string>;
// en el map:
nombre: nombreEmpleado(rol, nombres),
cargo: cargoEmpleado(rol),
```
(importar `nombreEmpleado`, `cargoEmpleado` de `@socrates/shared`.)

- [ ] **Step 2 — `GET /yo` expone `nombresEquipo`.** En `AsesorRow` añadir `nombresEquipo: Prisma.JsonValue | null`; en `aYoDTO` añadir `nombresEquipo: (a.nombresEquipo ?? {}) as Record<string,string>`.

- [ ] **Step 3 — `PATCH /yo/equipo`** (nuevo handler en `yoRouter`), valida con `NombresEquipoSchema`, hace **merge** con lo existente (no reemplaza todo), guarda:
```ts
yoRouter.patch("/equipo", validarJson(NombresEquipoSchema), async (c) => {
  const cambios = c.req.valid("json");
  const actual = await cargarAsesor(c.get("asesorId"));
  if (!actual) return c.json({ error: { codigo: "NO_EXISTE", mensaje: "No encontré tu cuenta." } }, 404);
  const previos = (actual.nombresEquipo ?? {}) as Record<string, string>;
  const fusion = { ...previos, ...cambios };
  const a = await prisma.asesor.update({ where: { id: actual.id }, data: { nombresEquipo: fusion } });
  return c.json(aYoDTO(a, c.get("esDemo")));
});
```
(añadir `nombresEquipo` al `select`/tipo de `cargarAsesor`.)

- [ ] **Step 4 — Test de integración** `equipo.integracion.ts` (patrón `app.request`, modo demo, guardia anti-producción como `expedientes.integracion.ts`). Casos:
  - `GET /empleados` sin override → nombres de fábrica (Diego…) y `cargo` presente.
  - `PATCH /yo/equipo {PROSPECTOR:"Toño"}` → 200; luego `GET /empleados` muestra "Toño" en PROSPECTOR y los demás de fábrica.
  - `PATCH` parcial dos veces (merge): {PROSPECTOR} luego {GESTOR} → ambos persisten.
  - `PATCH {SOCRATES:"x"}` → 400/422 (rol fuera del panel, lo rechaza zod).
  - `PATCH {PROSPECTOR:"  "}` → rechazado (vacío tras trim).
  - Tenencia: el override de un asesor no aparece para otro (sembrar 2 asesores demo si el patrón lo permite; si el modo demo es asesor único, dejar documentado y cubrir con el resto).
- [ ] **Step 5** — `pnpm --filter @socrates/api test:integracion` → PASS (requiere Postgres local migrado). `pnpm --filter @socrates/api typecheck` → PASS.
- [ ] **Step 6** — Commit: `feat(api): resolver nombres del equipo por oficina + PATCH /yo/equipo`.

---

## Task 5 — Web: cliente + server action

**Files:** Modify `apps/web/src/lib/api-client.ts`; Create `apps/web/src/app/acciones/equipo.ts`

- [ ] **Step 1 — api-client:** añadir `guardarNombresEquipo(nombres: NombresEquipo): Promise<YoDTO>` que hace `PATCH /yo/equipo` con el patrón `enviar<T>` existente (token de Clerk adjunto). Y confirmar que `obtenerYo()` devuelve el `YoDTO` ya con `nombresEquipo`.
- [ ] **Step 2 — Server action** `apps/web/src/app/acciones/equipo.ts`:
```ts
"use server";
import { guardarNombresEquipo } from "@/lib/api-client";
import { NombresEquipoSchema, type NombresEquipo } from "@socrates/shared";
export interface ResultadoEquipo { ok: boolean; error?: string }
export async function guardarNombresEquipoAction(nombres: NombresEquipo): Promise<ResultadoEquipo> {
  const parsed = NombresEquipoSchema.safeParse(nombres);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Revisa los nombres." };
  try { await guardarNombresEquipo(parsed.data); return { ok: true }; }
  catch (e) { return { ok: false, error: e instanceof Error ? e.message : "No se pudo guardar." }; }
}
```
- [ ] **Step 3** — `pnpm --filter @socrates/web typecheck` → PASS. Commit: `feat(web): cliente y server action para nombres del equipo`.

---

## Task 6 — Web: Panel de Equipo editable (ver + renombrar)

**Files:** Modify `apps/web/src/components/oficina/PanelEquipo.tsx`

- [ ] **Step 1 — Mostrar cargo:** bajo `emp.nombre`, cuando el empleado no está trabajando, mostrar `emp.cargo` como subtítulo (en vez de/además de `descripcion`, según cabe). El DTO ya trae `cargo` (Task 4).
- [ ] **Step 2 — Editar inline:** convertir la tarjeta en isla cliente (`"use client"`), añadir un botón lápiz que abre un input con el nombre actual; al Guardar, llama `guardarNombresEquipoAction({ [rol]: valor })`, y `router.refresh()` para re-hidratar. Estados: guardando (spinner), error (mensaje corto). Cancelar restaura. Validación en cliente: 1–40 chars (el server revalida).
- [ ] **Step 3 — Verificación funcional:** con la app corriendo (`pnpm --filter @socrates/web dev`, modo demo), renombrar un empleado en el panel y ver el cambio persistir tras refresh. (Registrar el clic exacto en el PR.)
- [ ] **Step 4** — `pnpm --filter @socrates/web typecheck && pnpm --filter @socrates/web build` → PASS. Commit: `feat(web): renombrar empleados desde el Panel de Equipo`.

---

## Task 7 — Web: onboarding (PasoBienvenida) editable + propagación a expedientes

**Files:** Modify `apps/web/src/components/onboarding/Wizard.tsx`, `apps/web/src/components/oficina/TarjetaExpediente.tsx`, `apps/web/src/app/expedientes/[id]/page.tsx`

- [ ] **Step 1 — PasoBienvenida editable:** en la grilla de especialistas, cada nombre editable (mismo patrón de input+guardar que Task 6, reutilizar el componente de edición). Opcional: botón "Así está bien" ya existe (Entrar). El DTO `equipo` ya trae el nombre resuelto (Task 4), así que muestra Diego… de entrada.
- [ ] **Step 2 — Propagación:** `TarjetaExpediente` y `expedientes/[id]/page.tsx` hoy hacen `EMPLEADOS[rol].nombre`. Cambiar a `nombreEmpleado(rol, nombresEquipo)`. Obtener `nombresEquipo` del asesor vía `obtenerYo()` en el server component contenedor (lista de expedientes y página de expediente) y pasarlo como prop. (Import `nombreEmpleado` de `@socrates/shared`.)
- [ ] **Step 3 — Verificación funcional:** renombrar en el panel, abrir un expediente con ese empleado, ver el nombre nuevo junto a su tarea/entregable. Y en onboarding, renombrar y confirmar que persiste.
- [ ] **Step 4** — `pnpm --filter @socrates/web typecheck && build` → PASS. Commit: `feat(web): renombrar en onboarding y propagar el nombre a expedientes`.

---

## Task 8 — Verificación integral + cierre

- [ ] **Step 1 — Batería verde raíz:** `pnpm turbo run typecheck build test` y `pnpm test:integracion` (Postgres local) → todo PASS.
- [ ] **Step 2 — Flujo en vivo** (modo demo): (a) panel renombra y persiste; (b) onboarding renombra; (c) el nombre aparece en un expediente; (d) validación rechaza vacío/>40.
- [ ] **Step 3 — Revisión adversarial** del diff (buscar: fugas de tenencia, override no fusionado, jerga de IA en superficie NFR-14, nombres del gerente intactos).
- [ ] **Step 4 — PR + merge** a master; verificar el deploy de producción Ready; podar el carril.

---

## Fuera de alcance (recordatorio)
Avatares; renombrar a Sócrates; nombres por-expediente; multiusuario por oficina. El nombre de sistema `EMPLEADOS[rol].nombre` legado ("El Prospector") queda como respaldo del helper; no se borra en este plan.
