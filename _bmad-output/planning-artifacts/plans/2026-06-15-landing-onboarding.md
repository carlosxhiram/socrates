# Landing + Onboarding — Plan de implementación

> **For agentic workers:** plan denso (no duplica todo el código porque el autor lo
> ejecuta enseguida en esta misma sesión). Casilla `- [ ]` por tarea. Disciplina:
> DRY, YAGNI, TDD en la lógica pura, commits frecuentes. Spec fuente:
> `docs/superpowers/specs/2026-06-15-landing-onboarding-design.md`.

**Goal:** Portada pública que convence al asesor + recibimiento de 3 pasos (datos →
prueba gratis con tarjeta Stripe → bienvenida de Sócrates) que abre la oficina solo
con el pago verificado del lado seguro.

**Architecture:** El dinero vive en la API (Hono + Prisma): webhook firmado e
idempotente que escribe el estado de suscripción en la fila del Asesor; Checkout
alojado de Stripe. El frontend (Next) lee el estado por `GET /yo`, enruta con un
"portero" en las páginas protegidas, y muta vía Server Actions. Modo demo honesto
sin llaves, igual que los wrappers existentes (IA/Tavily/R2).

**Tech Stack:** Next 15 (App Router, Server Actions), Hono, Prisma (SQLite dev),
Stripe (Checkout subscription + trial), Clerk (auth), Tailwind (paleta existente),
Zod, Vitest.

---

## Estructura de archivos

**packages/db**
- Modify `prisma/schema.prisma` — campos nuevos en `Asesor` + modelo `EventoStripe`.
- Create migración (nombre `add_onboarding_y_suscripcion`).
- Modify seed (`packages/db/src/seed.ts`) — asesor demo: `estadoSuscripcion="activa"`, `onboardingEtapa="completo"`.

**packages/shared**
- Modify `src/glosario.ts` — `ETAPAS_ONBOARDING`, `ESTADOS_SUSCRIPCION`.
- Create `src/onboarding/paso.ts` — `derivarSiguientePaso(...)` (puro) + `mapearEstadoStripe(...)` (puro).
- Create `src/onboarding/paso.test.ts` — tests de ambos.
- Modify `src/dto/index.ts` — `GuardarPerfilSchema`, `YoDTOSchema`.
- Modify `src/index.ts` — re-exports.

**apps/api**
- Create `src/pago/proveedor-stripe.ts` — wrapper: `stripeHabilitado()`, `crearCheckoutSession()`, `verificarWebhook()`. Demo fallback.
- Create `src/rutas/yo.ts` — `GET /` (estado), `PATCH /perfil`, `POST /completar`.
- Create `src/rutas/pago.ts` — `POST /checkout` (authed).
- Create `src/pago/webhook.ts` — handler público `manejarWebhookStripe` (raw body, firma, idempotente).
- Modify `src/index.ts` — montar `/pago/webhook` ANTES del auth; `/yo` y `/pago` después.
- Modify `src/env.ts` — (no cambia; `.env` de raíz ya se carga) — nada.

**apps/web**
- Modify `src/app/page.tsx` — landing (reemplaza el redirect).
- Create `src/components/landing/*` — secciones.
- Create `src/app/bienvenida/page.tsx` — server: lee `/yo`, enruta, monta wizard.
- Create `src/components/onboarding/Wizard.tsx` (client) + pasos.
- Create `src/app/acciones/onboarding.ts` — Server Actions (`guardarPerfil`, `iniciarPrueba`, `completarBienvenida`).
- Modify `src/lib/api-client.ts` — `obtenerYo`, `guardarPerfil`, `iniciarCheckout`, `completarBienvenida`.
- Create `src/lib/portero.ts` — `requerirAcceso()` (server; redirige a /bienvenida si falta paso).
- Modify páginas protegidas (`oficina/page.tsx`, `expedientes/[id]/page.tsx`, `entregables/[id]/page.tsx`) — llamar `requerirAcceso()`.
- Modify `src/middleware.ts` — ruta pública `/` además de `/sign-in`.
- Modify raíz `.env.example` — llaves Stripe.

---

## Contratos clave (lo que fija decisiones)

**Glosario:**
```ts
export const ETAPAS_ONBOARDING = ["perfil","pago","bienvenida","completo"] as const;
export const ESTADOS_SUSCRIPCION = ["ninguna","prueba","activa","vencida","cancelada"] as const;
```

**Lógica pura (testeable, packages/shared/src/onboarding/paso.ts):**
```ts
// El "portero": de hechos → siguiente paso. La UI solo obedece.
export function derivarSiguientePaso(f: {
  perfilCompleto: boolean;
  estadoSuscripcion: EstadoSuscripcion;
  bienvenidaVista: boolean;
}): EtapaOnboarding {
  if (!f.perfilCompleto) return "perfil";
  if (!(f.estadoSuscripcion === "prueba" || f.estadoSuscripcion === "activa")) return "pago";
  if (!f.bienvenidaVista) return "bienvenida";
  return "completo";
}
export function mapearEstadoStripe(status: string): EstadoSuscripcion {
  switch (status) {
    case "trialing": return "prueba";
    case "active": return "activa";
    case "past_due": case "unpaid": case "incomplete": return "vencida";
    case "canceled": case "incomplete_expired": return "cancelada";
    default: return "ninguna";
  }
}
```

**Schema Asesor (campos nuevos, aditivos):**
```prisma
nombreOficina     String?
zona              String?
especialidad      String?
onboardingEtapa   String    @default("perfil")
stripeCustomerId  String?   @unique
estadoSuscripcion String    @default("ninguna")
pruebaTermina     DateTime?
```
```prisma
model EventoStripe { id String @id  tipo String  procesadoEn DateTime @default(now()) }
```

**Checkout (subscription + trial):**
```ts
mode:"subscription", customer|customer_email, client_reference_id: asesorId,
line_items:[{ price: STRIPE_PRICE_ID, quantity:1 }],
subscription_data:{ trial_period_days: Number(STRIPE_TRIAL_DIAS ?? 14) },
success_url, cancel_url
```

**Webhook (idempotente):** `stripe.webhooks.constructEvent(rawText, firma, STRIPE_WEBHOOK_SECRET)`;
`prisma.eventoStripe.create({id,tipo})` en try → si choca el `@id`, ya se procesó → 200;
resuelve asesor por `stripeCustomerId`/`client_reference_id` (nuestra fila), aplica `mapearEstadoStripe`.

**YoDTO:**
```ts
{ asesorId, esDemo, perfil:{nombre,email,nombreOficina,zona,especialidad}|nulls,
  onboardingEtapa, suscripcion:{estado, pruebaTermina|null}, siguientePaso }
```

---

## Tareas (orden de ejecución)

- [ ] **T1 · Cimiento de datos.** Campos en `Asesor` + `EventoStripe`; migración; seed demo a `activa`/`completo`. Verificar `pnpm db:generate` + migrate + seed OK.
- [ ] **T2 · Lógica pura + DTOs (TDD).** Escribir `paso.test.ts` (rojo) → `paso.ts` (verde) para `derivarSiguientePaso` y `mapearEstadoStripe`; glosario; `GuardarPerfilSchema`/`YoDTOSchema`; re-exports. `pnpm --filter @socrates/shared test` verde.
- [ ] **T3 · Wrapper Stripe (modo demo honesto).** `proveedor-stripe.ts` con import dinámico de `stripe`; sin llave → demo (checkout devuelve `successUrl?demo=1`). `stripeHabilitado()`.
- [ ] **T4 · Rutas API.** `yo.ts` (GET/PATCH/POST completar), `pago.ts` (POST checkout), `webhook.ts`; montar en `index.ts` (webhook público antes del auth). Typecheck verde.
- [ ] **T5 · Cliente + acciones web.** `api-client.ts` (nuevos métodos), Server Actions `onboarding.ts`, `portero.ts`, middleware `/` público.
- [ ] **T6 · Landing (frontend-design).** `page.tsx` + componentes; paleta existente; 5 secciones; CTA a Clerk; sin casos reales.
- [ ] **T7 · Onboarding (frontend-design).** `/bienvenida` server + `Wizard` client; 3 pasos derivados de `siguientePaso`; estado "confirmando" tras Stripe; bienvenida narrada por Sócrates con los 6 empleados.
- [ ] **T8 · Portero en páginas protegidas + `.env.example`.**
- [ ] **T9 · Verificación real.** `typecheck` + `build` verdes; `preview` de `/` y `/bienvenida` (snapshot/captura); flujo demo de punta a punta; idempotencia del webhook razonada/probada.
- [ ] **T10 · Panel adversarial del dinero.** Subagente revisor (silent-failure-hunter / code-reviewer) sobre el camino de pago; corregir hallazgos hasta ronda limpia.

## Self-review del plan
- **Cobertura del spec:** landing (T6), onboarding 3 pasos (T7), cobro Stripe+trial (T3/T4), doctrina del dinero —webhook firmado idempotente, verdad en nuestra fila— (T4), modo demo (T3/T5/T7), campos Asesor (T1), gating (T5/T8), env (T8), verificación real + YAGNI (T9). Cubierto.
- **Sin placeholders:** los contratos llevan firmas reales; el código de UI se materializa en T6/T7 con frontend-design.
- **Consistencia de tipos:** `EtapaOnboarding`/`EstadoSuscripcion` derivan de los `as const` del glosario; `siguientePaso` (servidor) = único origen de ruteo (cliente tonto).
