# DECISIONES PARA CARLOS

Fecha: 2026-07-03 · Preparado por el Director de ingeniería (Fable)

Todo lo de esta lista está **preparado y documentado, no ejecutado**: requiere
tus llaves, tu dinero, tu banderazo o tu rumbo de producto. Nada más te bloquea.

---

## 1. Llaves por pegar (cada una enciende una pieza; sin ellas nada truena)

| Llave | Qué enciende | Estado del cableado |
|---|---|---|
| `AI_GATEWAY_API_KEY` | IA real (empleados generando en vivo) | El PR #7 arregla el cableado: la ruta documentada original (import dinámico de `@ai-sdk/gateway` con `ai@4.3`) casi seguro no podía funcionar. Al pegar la llave, correr una generación de prueba ANTES del PoC. |
| `TAVILY_API_KEY` | Búsqueda en vivo del Investigador | Fallback sembrado funcionando; falta la llave. |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` + `CLERK_SECRET_KEY` + `CLERK_JWT_KEY` | Login real y aislamiento multi-asesor | **Importante**: pega las tres juntas (web Y api). Con el PR #5, una config a medias responde 503 claro en vez de mezclar asesores en el demo. Setea también `WEB_ORIGIN` con el dominio real del frontend. |
| `R2_*` (5 variables) | PDFs exportados | Cableado E1 listo; el export llega con E4. |

## 2. Banderazos de deploy (NO ejecutados)

- **Railway (api + Postgres) y Vercel (web):** el deploy-prep existe
  (Dockerfile, `railway.json`, build endurecido). No desplegué nada: es tu
  banderazo. Al desplegar: el healthcheck ya reprueba honesto (503) si la base
  no responde.
- **Demo pública sin Clerk:** decisión consciente — requiere `MODO_ASESOR_DEMO=1`
  explícito en producción (el fail-open quedó cerrado). Si quieres esa demo,
  es un switch, pero sabiendo que cualquiera que entre VE y EDITA el tenant demo.
- **Merge de los PRs:** #1 → #3 → #4/#5 → #6; #2 y #7 van solos. Todos en draft
  esperándote.

## 3. Decisiones de producto

1. **Mapa de Etapas (I-1 + addendum I-1b)** — 30 min contigo:
   (a) ¿retroceder etapas debe permitirse? (hoy: sí, corregir es honesto);
   (b) ¿Ganado/Perdido reversibles? (hoy: no se reabren — un clic equivocado
   requiere corrección manual; la UI pide confirmación);
   (c) prerrequisito por etapa: hoy solo Investigado ← Reporte APROBADO; el
   resto (Recomendado ← recomendación aprobada, etc.) llega con E4/E5.
2. **Catálogo (PoC-R2, tu tarea):** expandir de 17 → 55 instituciones validando
   condiciones con cada institución. Los ids placeholder `soc_*` del reporte de
   Probemedic siguen sin resolverse a propósito (C-1: cero FK inventada — ahora
   hay un test que lo afirma). Cuando el catálogo cubra esas instituciones, se
   resuelven.
3. **Metadato del reporte sembrado:** el `indiceCobertura` declara 11/6/3 pero
   el contenido real tiene menos afirmaciones (hallazgo de auditoría). Es TU
   reporte de referencia: ¿lo corrijo yo contando las afirmaciones reales, o
   lo dejas como está hasta E4?
4. **Umbrales del PRD** (SM-1 ≥80 %, SM-4 ≤15 min, NFR-5 techo de costo por
   reporte): siguen pendientes de calibrar contigo; el PoC del Investigador
   (requiere llave de IA) es el gate de E4 y el siguiente gran paso del rumbo.
5. **Profundidad del Negociador** para el piloto (PRD Q-6).

## 4. Entorno de desarrollo (recomendaciones de infra, 10 min)

1. **Arregla el setup script del cloud env** para que haga lo que promete:
   `service postgresql start` + crear rol/base si faltan + `pnpm install &&
   pnpm db:generate && pnpm db:deploy && pnpm db:seed`. (Esta sesión lo hizo a
   mano; el README paso 0 tiene los comandos exactos.)
2. **Quita `NODE_ENV=development` de las variables globales del entorno** —
   rompe el build de Next 16 (ya lo mitigué en el script de build, pero la
   variable global sigue siendo una trampa para cualquier otra herramienta).
3. Presupuesto de agentes: la sesión tocó el límite de uso con la auditoría
   masiva en paralelo. Lección aplicada: implementación bien especificada →
   Sonnet; revisión adversarial → Opus; síntesis y decisiones → el Director.

---

*Con esto, lo único que de verdad frena el piloto es: llaves (IA/Clerk),
el PoC del Investigador (gate de E4) y tu media hora para el mapa de Etapas.*
