# DECISIONES PARA CARLOS

Fecha: 2026-07-18 · Regenerado al día del PR #30 (el registro anterior era del 2026-07-03 — 22 PRs de retraso)

Todo lo de esta lista está **preparado y documentado, no ejecutado**: requiere
tus llaves, tu dinero, tu banderazo o tu rumbo de producto. Nada más te
bloquea. Cada punto trae el contexto para decidir sin tener que ir a
arqueología de commits.

---

## 0. Lo que ya se resolvió desde el 2026-07-03 (podado de esta lista)

- **Banderazo de deploy (Railway + Vercel):** ejecutado. La api vive en
  Railway (arranca con `node` puro, imagen adelgazada — PRs #27, #28, #29) y
  la web en Vercel. Ya no es una decisión pendiente.
- **Merge de los PRs del checkpoint (#1→#3→#4/#5→#6, #2 y #7 solos):**
  ejecutado el propio 2026-07-03; y 21 PRs más (#9–#18, #20–#30) se
  fusionaron después. Ver `STATUS.md` para el detalle PR por PR.
- **Recomendaciones de entorno de desarrollo** (arreglar el setup script,
  quitar `NODE_ENV=development` global): la sección "Trampas del terreno" de
  `CLAUDE.md` es ahora el lugar vivo donde se acumulan estas notas de
  terreno (se le agregó al menos una más desde entonces, PR #25) — no hace
  falta duplicarlas aquí.

---

## 1. Llaves por pegar (verificado contra el código de `master` hoy — cada una enciende una pieza; sin ellas nada truena)

| Llave | Qué enciende | Estado del cableado (verificado en código) |
|---|---|---|
| `AI_GATEWAY_API_KEY` | IA real (empleados generando en vivo) vía Vercel AI Gateway | `apps/api/src/ia/proveedor-ia.ts`: sin esta llave, `crearProveedorIA()` regresa el fallback (`disponible: false`, nunca truena). Modelos por rol configurables con `MODELO_PESADO` / `MODELO_ESTANDAR` / `MODELO_MECANICO` (default `anthropic/claude-{opus,sonnet,haiku}-4.x` vía el Gateway). **Ojo**: el PR #19 (sin fusionar, ver abajo) cambia el proveedor a Anthropic directo con `ANTHROPIC_API_KEY` — si ese PR se fusiona, la llave que hay que pegar cambia. Decide cuál construir primero. |
| `TAVILY_API_KEY` | Búsqueda en vivo del Investigador | `apps/api/src/busqueda/proveedor-busqueda.ts`: sin ella, `crearProveedorBusqueda()` regresa `[]` honesto (el Investigador marca Brecha en vez de inventar fuente). |
| `R2_ACCOUNT_ID` + `R2_ACCESS_KEY_ID` + `R2_SECRET_ACCESS_KEY` + `R2_BUCKET` + `R2_ENDPOINT` (opcional, se deriva de `R2_ACCOUNT_ID` si falta) | PDFs exportados | `apps/api/src/storage/r2-client.ts`: sin ellas, `crearAlmacenR2()` regresa `disponible: false` y el export falla con mensaje honesto ("el reporte sigue disponible en pantalla"); el export en sí (E4) sigue sin construirse en `master`. |

No incluida en esta tabla porque ya quedó resuelta en el deploy de
producción: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` + `CLERK_SECRET_KEY` +
`CLERK_JWT_KEY` + `WEB_ORIGIN` (login real y aislamiento multi-asesor). El
mecanismo fail-closed sigue igual en `apps/api/src/middleware/auth.ts` por
si alguna vez una de las tres queda a medias.

## 2. PR #19 — "El equipo en marcha": decisión de merge (nuevo, el más urgente de esta lista)

El motor real (encargar trabajo, worker, los 6 empleados produciendo
entregables, botón Aprobar) **ya está construido y probado**, pero vive
desde el 2026-07-06 en un PR draft (`claude/socrates-carril-api` → `master`,
[#19](https://github.com/carlosxhiram/socrates/pull/19)) que hoy está en
conflicto con `master` (que avanzó con el renombre a SOCRATIA, el deploy y
los nombres de equipo). No ha tenido un solo commit en 12 días. Antes de
retomarlo hace falta un rebase/resolución de conflictos — no es un "cierre
en curso".

El propio PR deja 3 preguntas para ti (verbatim de su descripción):

1. **Falta la llave de IA** (ver tabla arriba — y decide si construyes
   sobre `AI_GATEWAY_API_KEY` de `master` o adoptas el `ANTHROPIC_API_KEY`
   directo que ya trae este PR).
2. **La UI de chat "Sócrates propone y confirma" no está conectada** — los
   endpoints (`/socrates/instruir`, `/confirmar`) existen y están probados,
   pero ningún componente de la web los llama todavía. El encargo directo
   por tarjeta (ya construido en este mismo PR) cubre la misma capacidad de
   negocio (encargarle a cualquiera de los 6 roles). Decide: ¿se fusiona
   así, o se conecta el chat antes de fusionar?
3. Pulido menor sin resolver: el campo "Tu nombre" (personal, distinto al
   nombre de la oficina) no se captura en el onboarding.

## 3. Demo pública sin Clerk

Mecanismo vigente en el código (`apps/api/src/middleware/auth.ts`): en
producción, el modo demo (asesor sembrado, sin login real) exige el opt-in
explícito `MODO_ASESOR_DEMO=1` — sin él, la api responde 503 en vez de
abrirse sola (fail-closed). Sigue siendo tu decisión: si algún día quieres
una demo pública de SOCRATIA (p. ej. para que un visitante la pruebe sin
registrarse), es un switch — sabiendo que cualquiera que entre VE y EDITA
el tenant demo compartido.

## 4. Mapa de Etapas (I-1 + addendum I-1b) — sin cambios desde julio, sigue sin decidirse

`packages/shared/src/etapas.ts` no se ha tocado desde el 2026-07-03. Tres
sub-decisiones, 30 min contigo:

1. **¿Retroceder etapas debe permitirse?** Hoy: sí (corregir es honesto).
2. **¿Ganado/Perdido deben ser reversibles?** Hoy: no se reabren por la vía
   normal — un clic equivocado requiere corrección manual; la UI pide
   confirmación antes de cerrar.
3. **Prerrequisito por etapa**: hoy solo `→ Investigado` exige un Reporte
   APROBADO. El resto del mapa (p. ej. `Recomendado` ← recomendación
   aprobada) sigue sin implementarse — depende de que el PR #19 (o su
   sucesor) se fusione primero, porque ahí es donde existen los demás tipos
   de entregable.

## 5. Catálogo: expandir de 17 → 55 instituciones (tu tarea de curaduría)

Sin cambios desde julio (`packages/db/src/seed/catalogo-soc.json` no se ha
tocado desde el commit fundacional). El propio archivo se auto-describe:
17 instituciones reales, ~38 adicionales pendientes de validar contigo y
con SOC Corporativo condición por condición. Los ids placeholder `soc_*`
del reporte de Probemedic siguen sin resolverse **a propósito** (C-1: cero
FK inventada, afirmado por test) — se resuelven solos cuando el catálogo
cubra esas instituciones.

Nota aparte, de menor prioridad: el propio metadato del catálogo está
desalineado consigo mismo (`_meta.totalProductos` dice 37, la lista de
categorías `tiposDeProducto` solo tiene 11, los productos reales sembrados
son 22) — no bloquea nada, pero conviene corregirlo cuando se toque el
archivo para la expansión a 55. Detalle completo en `STATUS.md`.

## 6. Metadato del reporte sembrado (Probemedic)

Sin cambios desde julio. `indiceCobertura` declara
`totalAfirmaciones: 11, verificadas: 6, estimaciones: 3, brechas: 2` — la
auditoría del checkpoint encontró que el contenido real tiene menos
afirmaciones de las que el índice presume. Es tu reporte de referencia:
¿lo corrijo contando las afirmaciones reales, o lo dejas como está hasta
que el pipeline del Investigador (PR #19) esté en producción y genere
reportes con el índice calculado de verdad?

## 7. Umbrales del PRD

Sin calibrar todavía: **SM-1** (paridad ≥80%, juicio tuyo sobre un lote
N≥10), **SM-4** (≤15 min por reporte), **NFR-5** (techo de costo en USD por
reporte). Siguen bloqueados en el mismo punto que en julio: necesitan el
PoC del Investigador corriendo con datos reales, que ahora tiene código
listo en el PR #19 pero requiere la llave de IA + resolver el merge para
poder medirse.

## 8. Profundidad del Negociador (PRD Q-6)

Sin resolver. Cita textual del PRD (`_bmad-output/planning-artifacts/prd/prd.md`,
línea 458): *"Profundidad relativa de los 5 Empleados en v1 (¿sube el
Negociador?) — dueño: Carlos."* El resto de los 5 empleados (fuera del
Investigador) se diseñaron deliberadamente "completos en comportamiento,
ligeros en sofisticación" para v1; el PR #19 ya construyó al Negociador con
esa profundidad ligera — revisar si conviene subirla antes o después del
piloto.

---

*Con esto, lo único que de verdad frena el negocio hoy es: la decisión de
merge del PR #19 (y su llave de IA), y tu tiempo para el mapa de Etapas y
la curaduría del catálogo. El deploy y el cobro ya no son pendientes — ya
están vivos.*
