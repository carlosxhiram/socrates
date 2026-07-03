# Diseño — Landing pública + Onboarding con cobro (SOCRATES)

Fecha: 2026-06-15 · Autor: Opus (silla de Director, modo interino) · Estado: aprobado por Carlos

> Resumen de una línea: **darle a SOCRATES una portada pública que convence al
> asesor de entrar, y un recibimiento de 3 pasos (datos → prueba gratis con
> tarjeta vía Stripe → bienvenida de Sócrates) que abre la oficina solo cuando el
> pago está verificado del lado seguro.**

---

## 1. Contexto y problema

Hoy la app no tiene puerta ni recibimiento:

- `apps/web/src/app/page.tsx` redirige `/` → `/oficina` directo (no hay landing).
- `apps/web/src/app/sign-in/...` usa el `<SignIn/>` de Clerk o un "modo demo".
- Un asesor nuevo cae entre expedientes sembrados, sin que nadie lo reciba, sin
  capturar quién es, y **sin ningún cobro**.
- El modelo `Asesor` (en `packages/db/prisma/schema.prisma`) es una cáscara:
  `id`, `clerkUserId`, `nombre?`, `email?`, `expedientes[]`, fechas. No sabe de
  qué oficina es el asesor, ni si pagó, ni si ya se le dio la bienvenida.

Este diseño agrega: (a) una **landing** pública y (b) un **onboarding** con
**cobro real** vía Stripe.

## 2. Decisiones tomadas (con Carlos)

| Tema | Decisión |
|---|---|
| Landing | Mezcla las 3 intenciones, **peso en "convencer al asesor"**. Sin nombrar casos reales ni testimonios todavía. Tono institucional presente (vitrina sutil para el corporativo). Incluye la puerta al producto. |
| Onboarding | 3 pasos: **(1)** datos mínimos → **(2)** prueba gratis con tarjeta (Stripe) → **(3)** bienvenida de Sócrates que explica la dinámica usuario↔gerente. |
| Cobro | **Un plan, suscripción mensual.** |
| Entrada | **Prueba gratis con tarjeta** (`trial`): Stripe captura la tarjeta, no cobra hasta terminar la prueba, y cobra solo al vencer. |
| Precio | **$499 MXN / mes.** |
| Prueba | **14 días.** |
| Plomería de pago | **Stripe Checkout alojado** (no formulario embebido). Menos código, menos superficie de error con dinero, PCI/SCA delegado a Stripe. |

## 3. Doctrina del dinero (no negociable)

1. **La verdad del acceso vive en NUESTRA fila** (`Asesor.estadoSuscripcion`), no
   en el payload del navegador que regresa de Stripe.
2. **El acceso se abre solo cuando Stripe nos confirma por canal firmado**
   (webhook con verificación de firma). El redirect del cliente NO abre nada por
   sí mismo; a lo sumo muestra "estamos confirmando…".
3. **Idempotencia:** el webhook procesa cada evento de Stripe una sola vez
   (de-dup por `event.id`); reintentos de Stripe nunca causan doble efecto.
4. **Tenencia desde nuestra fila:** el `stripeCustomerId` se amarra al `Asesor`
   resuelto del JWT de Clerk, nunca de un campo manipulable del cliente.

## 4. Arquitectura del flujo (gating)

```
Visitante anónimo
  → /                         LANDING (pública)
     └ "Entrar / Empezar"     → Clerk sign-up / sign-in
        └ (con sesión)        → el "portero" decide a dónde según el estado guardado:

  Estado del Asesor                         Destino
  ─────────────────────────────────────────────────────────
  perfil incompleto                         /bienvenida (paso 1)
  perfil ok, sin suscripción/prueba         /bienvenida (paso 2)
  prueba/suscripción activa, sin bienvenida /bienvenida (paso 3)
  todo completo                             /oficina
  suscripción vencida/cancelada             /bienvenida (paso 2, reactivar)
```

**Dónde vive el portero:** el gating fino NO se mete en el `middleware` de Next
(no debe pegarle a la DB en cada request). Vive en el **layout/Server Component de
las rutas protegidas**, que llama `GET /yo` una vez y redirige si falta un paso.
El `middleware` de Clerk sigue haciendo solo lo que hoy hace: exigir sesión.
Rutas públicas pasan de `["/sign-in(.*)"]` a `["/", "/sign-in(.*)"]`.

## 5. Unidades a construir (propósito único + interfaz)

### 5.1 Landing — `apps/web/src/app/page.tsx` (reescribir) + componentes
- **Qué hace:** portada pública de marketing. Server Component, estática.
- **Depende de:** nada de datos (texto/diseño). Paleta y tipografía existentes
  (`marca` azul oscuro `#1e3a5f`, fondo `oficina.fondo`, Inter, emoji 🐢).
- **Secciones:**
  1. *Gancho* — "Tu equipo de asesoría financiera, en una sola oficina." + CTA Entrar.
  2. *Qué hace* — los 6 empleados (Prospector, Investigador, Asesor, Negociador,
     Tramitador, Gestor) y el resultado (Reporte de Inteligencia Financiera a la
     medida), **en abstracto, sin nombres de clientes**.
  3. *Cómo se siente* — hablas con un gerente (Sócrates), él dirige al equipo.
  4. *Por qué confiar* — rigor financiero: recomendaciones amarradas al catálogo
     real (sin inventar), revisión humana antes de entregar. (Tono institucional.)
  5. *Cierre* — precio ($499/mes), "14 días de prueba gratis", CTA.
- **Interacción:** el CTA va a Clerk (sign-up/sign-in). Si ya hay sesión, el botón
  dice "Ir a mi oficina".

### 5.2 Onboarding — `apps/web/src/app/bienvenida/page.tsx` (wizard de 3 pasos en una ruta)
- **Qué hace:** recibe al asesor nuevo y lo lleva paso a paso hasta abrir la oficina.
- **Depende de:** `GET /yo` (para saber en qué paso está), `PATCH /yo/perfil`,
  `POST /pago/checkout`, y el equipo (`GET /empleados`, que ya existe) para el paso 3.
- **El paso visible se deriva del estado del asesor**, no de un estado local
  frágil: aunque el asesor recargue o regrese de Stripe, cae en el paso correcto.
- **Paso 1 · Tu oficina:** formulario corto → `nombreOficina`, `zona`,
  `especialidad` → `PATCH /yo/perfil`.
- **Paso 2 · Tu prueba:** botón "Iniciar prueba gratis" → `POST /pago/checkout` →
  redirige a Stripe Checkout → regresa a `/bienvenida?paso=confirmando`. Mientras
  el webhook confirma, muestra "estamos confirmando tu prueba…" y consulta `GET
  /yo` hasta ver el estado activo (con un máximo de reintentos y mensaje honesto
  si tarda).
- **Paso 3 · Sócrates te recibe:** narrativa de bienvenida (Sócrates 🐢 presenta a
  los 6 empleados con su rol, y explica "tú me dices qué necesitas, yo dirijo al
  equipo"). Botón "Entrar a mi oficina" → marca `onboardingEtapa = completo` y va a
  `/oficina`.

### 5.3 Plomería de pago — `apps/api/src/rutas/pago.ts` (nuevo)
- `POST /pago/checkout`
  - **Entrada:** sesión del asesor (JWT). **Salida:** `{ url }` de Stripe Checkout.
  - Crea/recupera `stripeCustomerId` del asesor; crea Checkout Session en modo
    `subscription` con `trial_period_days` y el `price` del plan; `success_url` y
    `cancel_url` a `/bienvenida`.
- `POST /pago/webhook`
  - **Verifica la firma** con `STRIPE_WEBHOOK_SECRET` (cuerpo crudo, no JSON parseado).
  - **Idempotente:** registra `event.id` procesados; ignora repetidos.
  - Maneja `checkout.session.completed`, `customer.subscription.updated/deleted`
    → actualiza `Asesor.estadoSuscripcion` y `pruebaTermina`.
  - Resuelve el asesor por `stripeCustomerId` (nuestra fila), no por el payload.
- `GET /yo`
  - **Salida:** `{ perfil:{nombreOficina,zona,especialidad}, onboardingEtapa,
    suscripcion:{estado, pruebaTermina} }`. Es la fuente del portero.
- `PATCH /yo/perfil`
  - **Entrada:** `{ nombreOficina, zona, especialidad }` (validado con Zod, como el
    resto de la API). Guarda en la fila del asesor; avanza `onboardingEtapa`.

### 5.4 Modelo de datos — `packages/db/prisma/schema.prisma` (migración hacia adelante)
Campos nuevos en `Asesor` (todos opcionales o con default, para no romper filas
existentes):
```
nombreOficina      String?
zona               String?
especialidad       String?
onboardingEtapa    String    @default("perfil")   // perfil | pago | bienvenida | completo
stripeCustomerId   String?   @unique
estadoSuscripcion  String    @default("ninguna")  // ninguna | prueba | activa | vencida | cancelada
pruebaTermina      DateTime?
```
Nueva tabla mínima para idempotencia del webhook:
```
model EventoStripe {
  id          String   @id          // event.id de Stripe
  procesadoEn DateTime @default(now())
}
```
Migración nueva (no se reescribe historial). El seed existente sigue válido; al
asesor sembrado se le puede marcar `estadoSuscripcion="activa"`,
`onboardingEtapa="completo"` para que Carlos siga entrando directo a la oficina.

### 5.5 Modo demo honesto (sin llaves) — degradación, no error
Patrón ya usado por el proyecto (modo asesor demo, modo sin claves IA):
- **Sin `STRIPE_SECRET_KEY`:** el Paso 2 no llama a Stripe; muestra un aviso claro
  ("modo demostración — sin cobro") y deja avanzar, marcando una suscripción
  ficticia de prueba. La app corre completa sin llaves.
- **Sin Clerk:** sigue el modo asesor demo actual (sin login); el onboarding usa el
  asesor demo y puede saltarse directo a la oficina.
- Cuando Carlos pega las llaves de **test** de Stripe, el flujo real se activa sin
  tocar código.

## 6. Variables de entorno nuevas (a `.env.example`)
```
STRIPE_SECRET_KEY=            # sk_test_... (Carlos las pega; se agregan por CLI)
STRIPE_WEBHOOK_SECRET=        # whsec_... (del `stripe listen` o del dashboard)
STRIPE_PRICE_ID=              # price_... del plan mensual $499 MXN
NEXT_PUBLIC_STRIPE_ENABLED=   # "1" cuando hay llaves (para que la UI sepa)
```

## 7. Criterios de éxito (verificación en el mundo real, no en el foco verde)
- Un asesor nuevo no puede llegar a `/oficina` sin pasar los 3 pasos.
- Poner la tarjeta de prueba de Stripe crea una **suscripción real en estado
  `trialing`** visible en el dashboard de Stripe (test), y `Asesor.estadoSuscripcion`
  queda en `prueba` **por el webhook**, no por el redirect.
- Reenviar el mismo evento de webhook **no** cambia nada la segunda vez (idempotente).
- Sin llaves de Stripe, todo el flujo corre en modo demo con avisos honestos.
- `pnpm turbo run typecheck` y `build` siguen verdes; la oficina existente intacta.

## 8. Fuera de alcance (YAGNI — anotado, no construido)
Portal de facturación self-service, múltiples planes/niveles, opción anual,
cupones/descuentos, recuperación de pagos fallidos (dunning), emails
transaccionales, cancelación desde la UI. Post-MVP.

## 9. Riesgos y mitigación
| Riesgo | Mitigación |
|---|---|
| Doble cobro / doble apertura | Idempotencia por `event.id`; estado en nuestra fila. |
| Confiar en el redirect del cliente | El acceso se abre solo por webhook firmado. |
| Webhook firma mal verificada | Verificar con cuerpo crudo + `STRIPE_WEBHOOK_SECRET`. |
| App no arranca sin llaves | Modo demo honesto en todas las rutas de pago. |
| Romper filas `Asesor` existentes | Campos nuevos opcionales/con default; migración aditiva. |
| Next 15 vs 16 (`middleware`→`proxy`) | Se mantiene el patrón actual; el rename ya está documentado para Stage 3. |
```
