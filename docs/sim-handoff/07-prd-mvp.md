# 📐 PRD / Spec de Producto + Alcance del MVP — "El Investigador"

> Documento producido por 🎨 **PIXEL** (Head of Product de SIM, electrón) siguiendo la plantilla canónica de SIM (PRD moderno: problema→solución, métricas medibles, Non-Goals, criterios testables) + framework de MVP de Y Combinator (solución 90/10).
>
> **🎯 Regla de honestidad de SIM — cómo leer las marcas:**
> - ✅ **validado** — comprobado con evidencia (lo vimos en los 2 reportes reales que ya cerraron deals, o es un hecho del negocio SOC confirmado).
> - 🟡 **supuesto** — hipótesis razonable de PIXEL, aún sin probar. Se enuncia como hipótesis.
> - 🔴 **necesita dato real** — hueco abierto. NO se rellenó con algo plausible; queda marcado hasta validarlo con un usuario o un dato.
>
> **Fuentes de verdad de este PRD:** los 2 reportes de evidencia de campo (`reporte_las-aliadas_talent.pdf`, 21 pág · `Probemedic_Reporte_Inteligencia_Financiera_SOC_TALENT.pdf`, 25 pág), el Reporte de Innovación del Consejo v0.2 (`_sim-output/v0.2/reportes/2026-06-13-plataforma-soc-talent.md`), `INDEX.md` y `DECISIONES.md` del proyecto.

---

### 0) Encabezado

- **Producto / idea:** **El Investigador** — primer agente de la Plataforma SOC | TALENT.
- **Una línea:** Un motor que, a partir de un prospecto PYME, genera un Reporte de Inteligencia Financiera y Comercial tipo consultoría que amarra cada hallazgo a un producto financiero específico de una institución específica del catálogo SOC, con su argumento de cierre — para que cualquier asesor SOC entre a la cita siendo el mejor informado de la sala.
- **Autor:** 🎨 PIXEL · **Fecha:** 2026-06-13 · **Versión:** v0.1 (borrador para handoff a BMAD)
- **Estado:** listo para construir (es el punto de partida del desarrollo; las preguntas abiertas no bloquean el arranque del núcleo).

*Documento vivo. El changelog vive en §10. Esto NO es un PDF congelado: es la casa del proyecto.*

---

### 1) Problema

> **El dolor, en 10 segundos:** Un asesor financiero de SOC (gratis para el cliente; cobra comisión a la institución) solo cierra cuando llega a la PYME sabiendo más de su negocio que el propio dueño y le pone enfrente el producto correcto, de la institución correcta, en el momento correcto. Hoy ese reporte ganador existe — pero **lo produce a mano UNA sola persona (Carlos) en Perplexity, en varias horas de trabajo experto por prospecto.** Los otros ~2,000 asesores SOC no tienen ese superpoder: improvisan, llegan con un genérico "¿qué necesitas?" y queman al prospecto. `<✅ validado>` — la evidencia son los 2 reportes que cerraron los mejores deals de Carlos (Las Aliadas, Probemedic), hechos a mano.

**Por qué hoy se resuelve mal:**
- Ir directo al banco = ver las opciones de 1 institución, pagar honorarios de gestoría, sin asesor que estudie tu industria, y si te niegan, empezar de cero. `<✅ validado>` (tabla "El Diferenciador SOC" del reporte Las Aliadas, pág 5).
- El reporte experto a mano no escala: requiere a alguien con el nivel de Carlos + horas de Perplexity + criterio para casar hallazgos con el catálogo de 55 instituciones. `<✅ validado>`
- **El reloj corre en contra:** mientras el reporte siga siendo artesanal, es un commodity esperando a que cualquier asesor con dos horas y un LLM lo imite. La carrera es productizarlo antes de que deje de ser ventaja. `<✅ validado>` (síntesis del Consejo v0.2 — "los dos relojes").

*El problema está separado de la solución: el dolor es "el superpoder no escala y se está volviendo commodity", no "queremos construir un generador de PDFs".*

---

### 2) Usuario objetivo

- **Usuario primario (para quien construimos el MVP):** **Carlos Hiram Chávez, Director Comercial de SOC | TALENT** — y, por extensión inmediata, el asesor SOC ambicioso de su misma franquicia. Es un asesor que YA sabe vender crédito empresarial PYME, conoce el catálogo de instituciones y sabe leer un reporte de inteligencia; lo que NO tiene es el tiempo ni la reproducibilidad para hacer uno por cada prospecto. `<✅ validado>` — Carlos es el autor de los 2 reportes; es el usuario-cero literal.
- **Su contexto / "job to be done":** *"Tengo una cita con una PYME esta semana. Necesito llegar sabiendo más de su negocio que su dueño, y entrar con una recomendación concreta y vendible —producto + institución + argumento— en vez de un genérico. Y lo necesito en minutos, no en una tarde de trabajo experto."* `<✅ validado>`
- **A quién NO servimos todavía (a propósito):**
  - El asesor SOC fuera de la franquicia TALENT de Carlos → el MVP nace como jugada personal de SOC | TALENT; la expansión a los ~2,000 asesores es post-MVP. `<✅ validado>` (estrategia del Consejo: "empezar como jugada personal y documentar casos").
  - El cliente final / la PYME → ellos reciben el resultado vía el asesor, no usan la herramienta.
  - Los otros 5 agentes del flujo (Cazador, Catedrático, Diplomático, Tramitador, Perseguidor) y sus usuarios → fuera del MVP por completo.

*Es UNO concreto, con contexto de comportamiento, no "todos los asesores de México". Construimos para que el primer usuario lo AME (criterio YC), y ese usuario es Carlos.*

---

### 3) Objetivos y métricas de éxito

**Objetivo del MVP (la hipótesis a probar — una sola cosa):**
> Que **El Investigador genere, en pocos clics, un Reporte de Inteligencia de calidad equivalente al que Carlos produce a mano** —misma estructura, mismo rigor de fuentes, misma capa de síntesis investigación→producto SOC→argumento de cierre— de forma reproducible y confiable. Si lo logra, el ritual artesanal se vuelve sistema, y nace la munición (casos documentados) para el exit con el corporativo.

**Métricas de éxito** (con número y umbral):

| Métrica | Umbral de éxito | Cómo se mide | Marca |
|---|---|---|---|
| **Paridad de calidad** — % de reportes generados que Carlos consideraría "entregables al cliente con edición mínima (< 15 min de retoque)" | ≥ 80% de los reportes de prueba | Revisión humana de Carlos sobre un lote de N≥10 prospectos reales, contra rúbrica de calidad (§7) | 🟡 supuesto (umbral propuesto por PIXEL; calibrar con Carlos) |
| **Precisión de citas** — % de afirmaciones cuantitativas (cifras de mercado, montos, fechas) con fuente citada y verificable, y CERO datos inventados presentados como hechos | 100% citado · 0 alucinaciones de cifras | Auditoría de las afirmaciones numéricas del reporte vs sus fuentes (la métrica-veneno del Consejo) | ✅ validado como requisito (el Consejo lo declaró "el producto"); umbral 🟡 |
| **Fidelidad de la capa de síntesis** — % de recomendaciones que amarran hallazgo → producto financiero específico → institución específica del catálogo SOC → argumento de cierre, sin inventar productos/instituciones | 100% de las recomendaciones | Revisión de cada recomendación contra el catálogo SOC curado | ✅ validado como requisito (es el foso de RIFT) |
| **Tiempo a reporte** — minutos desde "ingreso el prospecto" hasta "tengo el borrador" | ≤ 15 min (vs varias horas a mano) | Cronómetro de la sesión | 🟡 supuesto |
| **Valor de negocio (norte estrella post-piloto)** — reportes generados por El Investigador que participan en un deal cerrado | ≥ 1 deal cerrado con un reporte 100% generado por el MVP en el primer trimestre | Registro manual de Carlos | 🟡 supuesto |
| **Contra-métrica (lo que NO debe empeorar)** — incidentes de "dato mal citado / producto mal recomendado" que lleguen al cliente | 0 incidentes que salgan al cliente | El gate de revisión humana (§4) debe atrapar el 100% antes de entregar | ✅ requisito de primer orden |

*Las métricas miden VALOR (paridad de calidad, precisión, deal cerrado), no actividad ("reportes generados" a secas). La contra-métrica vigila el único veneno que mata la carrera: el dato mal citado a escala.*

---

### 4) Alcance del MVP — qué SÍ y qué NO

**✅ Dentro del MVP** (lo mínimo para entregar el valor central y probar la hipótesis):

1. **Captura del prospecto (input mínimo).** El asesor ingresa lo que sabe del prospecto: nombre de la empresa, ciudad/estado, industria/giro, y opcionalmente sitio web, RFC, # de sucursales, notas libres. Es el único formulario. `<✅ validado>` — es exactamente el insumo con el que Carlos arrancó los 2 reportes.
2. **Motor de investigación con fuentes citadas.** Investigación pública automatizada del prospecto y su industria (operación, sucursales, posición competitiva, cifras de mercado, tendencias, benchmarks de competidores), **donde cada afirmación cuantitativa lleva su fuente.** Es la materia prima de los reportes Las Aliadas (industria restaurantera MTY, CANIRAC) y Probemedic (mercado oncológico, CONDUSEF/AMIS, etc.). `<✅ validado>`
3. **Generador de FODA y perfil de negocio con datos reales.** Síntesis del estudio en perfil de empresa + FODA accionable (como las 4 columnas Fortalezas/Oportunidades/Debilidades/Amenazas de Las Aliadas, o el perfil de riesgo crediticio de Probemedic). `<✅ validado>`
4. **🔒 LA CAPA DE SÍNTESIS — el corazón y el foso.** Amarrar cada necesidad/hallazgo a **un producto financiero específico de una institución específica del catálogo SOC**, con su argumento de cierre. Ej. real: "Crédito Revolvente Empresarial → Banorte o Konfío → capital de trabajo para nóminas en picos de demanda" (Las Aliadas R1); "Factoraje sobre CxC de aseguradoras → tasas más favorables porque GNP/AXA/MetLife son deudores de primer nivel" (Probemedic §VII). Sin inventar productos ni instituciones que no existan en el catálogo. `<✅ validado>` — es el ingrediente único que el Consejo ordenó blindar.
5. **El catálogo SOC como base de conocimiento curada.** Una base estructurada de los productos de las instituciones SOC (institución → producto → para qué sirve → condiciones típicas → cuándo recomendarlo), que alimenta la capa de síntesis. El MVP no necesita las 55 instituciones completas: empieza con el subconjunto que aparece en los reportes reales (Banorte, Konfío, Covalto, Afirme, Hey Banco, Xepelin, ION Financiera, Finbe ABC, Finsus Anticipa, Mifel, etc.) y sus productos (Crédito Revolvente, Arrendamiento Puro, Anticipo de Ventas, Crédito Simple, Factoraje, Standby LC, Seguro PYMES + Vida + GMM). `<✅ validado>` (instituciones y productos tomados de los 2 reportes) · alcance del subconjunto inicial 🟡.
6. **Render del reporte en el formato canónico SOC | TALENT.** Salida en la estructura probada: portada → carta ejecutiva → resumen ejecutivo (hallazgos + recomendaciones) → quién es SOC → panorama de industria con cifras → análisis del prospecto → FODA/perfil de riesgo → estrategias de crecimiento con producto SOC que las respalda → benchmarks → **brechas de información marcadas** → **fuentes y referencias.** `<✅ validado>` (es literalmente el índice de los 2 PDFs).
7. **🚦 Gate de revisión humana (Human-in-the-loop) ANTES de entregar.** El reporte se genera como BORRADOR; el asesor revisa/edita y aprueba antes de exportarlo al cliente. El producto **nunca** entrega directo al cliente sin paso humano en v1 — es el seguro contra el dato mal citado. `<✅ validado como decisión de diseño>` (mandato del Consejo: el control de calidad ES el producto).
8. **Sección de "Brechas de información".** El reporte marca explícitamente lo que NO pudo verificar (como hace Probemedic: "⚠️ BRECHA: el nombre del laboratorio ancla no se divulgó… se recomienda identificarlo formalmente"). Honestidad como feature, no como nota al pie. `<✅ validado>`
9. **Exportar a PDF con la marca SOC | TALENT.** Un clic → el PDF entregable, idéntico en pulcritud a los 2 reportes de evidencia. `<✅ validado>` (el PDF es el artefacto de demo y de cierre).

**❌ Fuera del MVP** (a propósito — la disciplina de alcance; esta lista PESA MÁS que la de arriba):

- **Los otros 5 agentes del flujo** (Cazador/prospectar, Catedrático/matchear vía SOC Universidad, Diplomático/outreach, Tramitador/expediente, Perseguidor/cierre) → *(razón: el Consejo ordenó "productizar SOLO la punta de lanza primero"; cada uno es su propio producto).* `<✅ validado>`
- **Cualquier dependencia de SISEC y SOC Universidad** → *(razón: el MVP debe facturar desde el día 1 sin el corporativo; usa prospectos del propio asesor + datos públicos + catálogo curado por nosotros).* `<✅ validado>`
- **Multi-tenant / cuentas para los ~2,000 asesores, roles, permisos, login corporativo** → *(razón: el MVP es jugada personal de Carlos; basta acceso para él y un puñado de asesores de su franquicia. Multi-tenant llega cuando haya tracción).* 🟡
- **Integración a CRM, pipeline, o a los sistemas de las instituciones** → *(razón: no es necesario para probar la hipótesis de calidad).* 🟡
- **Generación 100% autónoma sin revisión humana** → *(razón: el gate humano es precisamente el control de calidad; quitarlo es introducir el veneno. Llega cuando la precisión a escala esté probada, no antes).* `<✅ validado>`
- **Catálogo completo de las 55 instituciones × todos sus productos, perfectamente curado** → *(razón: solución 90/10 — empezamos con el subconjunto de los reportes reales, que ya cubre los casos probados; ampliar es trabajo incremental).* 🟡
- **App móvil nativa** → *(razón: el asesor prepara la cita en su computadora; web basta para v1).* 🟡
- **Cobro / suscripción / billing dentro del producto** → *(razón: en v1 el valor se mide en deals cerrados y calidad, no en MRR; el modelo de negocio es comisión de instituciones, no SaaS al asesor — todavía).* 🟡
- **Soporte de idiomas distintos al español / industrias fuera de PYME mexicana** → *(razón: el mercado es PYME MX; no diluir).* 🟡

*La lista de NO es más larga que la de SÍ. Time-box manda: si el núcleo (puntos 1–9) no cabe en el plazo objetivo, se recorta DENTRO del núcleo (menos instituciones en el catálogo, menos secciones del reporte) antes de mover la fecha.*

---

### 5) User stories y criterios de aceptación

**Historia 1 — Generar el reporte.**
*Como asesor SOC, quiero ingresar un prospecto y obtener un borrador de Reporte de Inteligencia completo, para llegar a la cita siendo el mejor informado y con una recomendación vendible.*

Criterios (Dado / Cuando / Entonces):
- **Dado** que ingreso nombre de empresa + ciudad + industria (campos mínimos) · **Cuando** lanzo la generación · **Entonces** el sistema produce un borrador con TODAS las secciones canónicas (resumen ejecutivo, industria, análisis del prospecto, FODA/riesgo, recomendaciones con producto SOC, benchmarks, brechas, fuentes) en ≤ 15 min. 🟡 (umbral de tiempo)
- **Dado** un reporte generado · **Cuando** lo reviso · **Entonces** cada afirmación cuantitativa (cifra de mercado, monto, fecha, %) muestra una fuente citada, y ninguna cifra aparece sin respaldo. `<✅ requisito>`
- **Dado** que el motor no encontró un dato clave · **Cuando** se genera el reporte · **Entonces** ese dato aparece en la sección "Brechas de información" marcado explícitamente, NO inventado. `<✅ validado>`

**Historia 2 — La recomendación accionable (capa de síntesis).**
*Como asesor SOC, quiero que cada necesidad detectada venga amarrada a un producto e institución concretos del catálogo SOC con su argumento de cierre, para vender acción y no investigación.*

Criterios:
- **Dado** un hallazgo de necesidad financiera (ej. "requiere capital de trabajo para picos de demanda") · **Cuando** se genera la sección de recomendaciones · **Entonces** se produce al menos una recomendación con: producto específico + institución(es) específica(s) del catálogo + impacto/argumento de cierre en una frase. `<✅ validado>` (formato R1–R5 de Las Aliadas).
- **Dado** la generación de una recomendación · **Cuando** el motor elige producto e institución · **Entonces** SOLO usa productos e instituciones que existen en el catálogo SOC curado — nunca inventa una institución ni un producto. `<✅ requisito de primer orden>`
- **Dado** un hallazgo sin producto SOC aplicable · **Cuando** se sintetiza · **Entonces** el sistema lo deja sin recomendación forzada (no fabrica un "match" falso) y, si aplica, lo nota como brecha. 🟡

**Historia 3 — Revisar, editar y entregar.**
*Como asesor SOC, quiero revisar y editar el borrador antes de entregarlo, y luego exportar un PDF con marca SOC | TALENT, para que nada salga al cliente sin mi visto bueno.*

Criterios:
- **Dado** un borrador generado · **Cuando** lo abro · **Entonces** puedo editar cualquier sección y el reporte queda en estado "borrador" hasta que yo lo apruebo. `<✅ validado como diseño>`
- **Dado** un reporte aprobado · **Cuando** exporto · **Entonces** obtengo un PDF con la identidad SOC | TALENT, paginado, con pie "Documento Confidencial — Uso Exclusivo del Cliente", visualmente equivalente a los 2 reportes de referencia. `<✅ validado>`
- **Dado** un reporte NO aprobado por el humano · **Cuando** intento exportar al cliente · **Entonces** el sistema lo impide / lo marca como borrador (el gate humano no se puede saltar en v1). `<✅ requisito>`

---

### 6) Diseño y experiencia (enlaza, no describas)

- **Flujo principal (4 pasos):**
  1. **Capturar prospecto** → formulario mínimo (empresa, ciudad, industria, +opcionales).
  2. **Generar** → el motor investiga, sintetiza contra el catálogo SOC y arma el borrador (con barra de progreso por sección: investigando industria → analizando empresa → FODA → matcheando productos → redactando).
  3. **Revisar & editar** → el asesor lee, ajusta, valida fuentes, aprueba (gate humano).
  4. **Exportar** → PDF con marca SOC | TALENT, listo para la cita.
- **Prototipo / pantallas:** 🔴 **necesita dato real** — aún no hay Figma/Canva. Decisión abierta para PIXEL + diseño en el siguiente paso (ver §10). El estándar visual del *output* (el PDF) sí está fijado por los 2 reportes de evidencia, que funcionan como spec visual del entregable.
- **Restricciones de UX:**
  - Idioma: **español de México**, ortografía perfecta (acentos, ñ). `<✅ validado>`
  - Plataforma: **web** (escritorio), stack probable Next.js / Vercel + AI. 🟡 (capacidad confirmada por Carlos; stack a confirmar por BMAD).
  - El entregable final debe verse tan pulido como un documento de consultoría — la pulcritud ES parte del valor (es lo que cierra deals). `<✅ validado>`

---

### 7) Requisitos no funcionales (lo que no se ve pero hunde el barco)

> En este producto, los no-funcionales de **calidad/precisión** NO son secundarios: el Consejo los declaró *el producto*. Por eso encabezan la tabla.

| Tipo | Requisito | Marca |
|---|---|---|
| **Precisión / veracidad (de primer orden)** | Cada afirmación cuantitativa lleva fuente citada y verificable. CERO cifras inventadas presentadas como hechos. Lo no verificable va a "Brechas de información", no al cuerpo como hecho. | ✅ requisito |
| **Fidelidad de catálogo** | El motor SOLO recomienda productos/instituciones existentes en el catálogo SOC curado; jamás alucina una institución o un producto financiero. | ✅ requisito |
| **Trazabilidad** | Toda cita del reporte debe poder rastrearse a su fuente (URL/documento) para que el asesor pueda defenderla frente al cliente. | ✅ requisito |
| **Gate humano obligatorio** | Ningún reporte llega al cliente sin aprobación humana en v1. | ✅ requisito |
| **Rendimiento** | Generación de un reporte en ≤ 15 min; la app responde fluida en revisión/edición. | 🟡 supuesto (umbral a calibrar) |
| **Costo por reporte** | El costo de cómputo/APIs por reporte debe quedar **muy por debajo del valor de un deal** (margen "de sonrojar" que NUMA señaló). Objetivo de referencia a fijar: 🔴 **necesita dato real** — estimar costo de las llamadas de investigación + síntesis + render por reporte y fijar techo. | 🔴 necesita dato real |
| **Confiabilidad** | Disponible cuando el asesor prepara una cita; un fallo de generación no pierde el trabajo capturado. | 🟡 supuesto |
| **Privacidad / datos** | El producto maneja datos de empresas-prospecto (algunos sensibles: RFC, situación fiscal, montos). Aunque sea info de negocio B2B y mayormente pública, almacenarla obliga a tratar la protección con seriedad. | 🟡 |

> ⚠️ **Terreno regulado / pasivo legal — marcar, NO inventar la política aquí:**
> 1. **Datos personales y fiscales** (RFC, situación fiscal de prospectos; si el dueño es persona física, datos personales) → aplica **LFPDPPP** (Ley Federal de Protección de Datos Personales en Posesión de los Particulares, MX). 🔴 **necesita dato real / validación legal** antes de manejar datos de prospectos a escala.
> 2. **Naturaleza del reporte:** los 2 PDFs ya incluyen el disclaimer correcto ("información de carácter analítico e informativo… no constituye una oferta vinculante de ninguna institución financiera"). El producto **debe** estampar ese disclaimer en cada reporte. `<✅ validado>` Aun así, recomendar productos financieros roza la asesoría regulada → 🔴 **validar con experto** los límites de lo que el reporte puede afirmar sin caer en oferta vinculante.
> 3. **Citas y derechos de fuentes:** el reporte cita fuentes públicas (CANIRAC, CONDUSEF, AMIS, market research). Verificar uso permitido de fuentes de pago/cerradas si se usan. 🟡

---

### 8) Riesgos y supuestos (los cuatro de Marty Cagan)

| Riesgo | ¿Lo tenemos? | Mitigación / cómo lo probamos | Marca |
|---|---|---|---|
| **Valor — ¿lo querrán?** | **Bajo riesgo.** La demanda ya está probada en campo: los 2 reportes a mano cerraron los mejores deals de Carlos. | El piloto con Carlos + un puñado de asesores TALENT; medir paridad de calidad y deals cerrados. | ✅ validado (el riesgo de valor es el que el Consejo dio por resuelto) |
| **Usabilidad — ¿sabrán usarlo?** | Medio. El usuario es experto (sabe leer un reporte), pero el flujo de captura→revisión→export debe ser de pocos clics. | Test del flujo con Carlos sobre 3–5 prospectos reales; iterar el gate de revisión. | 🟡 |
| **Viabilidad técnica — ¿podemos construirlo?** | El riesgo real NO es generar texto — es **la calidad/precisión a escala y la fidelidad de la capa de síntesis** (que no aluciné productos ni cifras). | PoC de lo más incierto PRIMERO: el motor de síntesis investigación→catálogo SOC con citas verificables sobre 1 prospecto, comparado contra el reporte que Carlos haría a mano. Si esa pieza no alcanza paridad, nada más importa. | 🟡 (capacidad técnica afirmada por Carlos; la pieza incierta es la precisión, no el stack) |
| **Negocio — ¿nos conviene?** | El margen es altísimo (costo de cómputo vs valor de un deal). El riesgo de negocio NO es el margen — es **estratégico/temporal:** que el corporativo SOC copie/regule/expulse en vez de comprar, y que el reporte se vuelva commodity antes de acumular tracción. | Documentar cada caso de éxito como munición del exit; correr la carrera de los dos relojes (productizar rápido). Modelo de costo unitario por reporte (§7, 🔴). | 🟡 (riesgo señalado por NOX/NUMA; vive fuera del producto pero define la urgencia) |

**Supuestos clave (a vigilar):**
- 🟡 El motor de investigación pública puede alcanzar, de forma reproducible, el rigor de fuentes que Carlos logra a mano en Perplexity. *(Es la apuesta central — se prueba con el PoC de viabilidad).*
- 🟡 Un catálogo SOC curado del subconjunto de instituciones de los reportes basta para los primeros casos. *(Se valida en el piloto).*
- ✅ El gate humano es aceptable para el usuario (Carlos ya revisa todo a mano hoy; el producto solo le quita el 90% del trabajo, no el visto bueno final).

---

### 9) Plan de lanzamiento (el time-box)

- **Fecha objetivo de lanzamiento (piloto interno):** 🔴 **necesita dato real** — Carlos/BMAD fijan la fecha; el time-box decide el alcance, no al revés. PIXEL recomienda fijarla agresiva (semanas, no meses) porque el reloj del commodity corre.
- **Primeros usuarios:** Carlos (usuario-cero) + 2–3 asesores de su franquicia TALENT, sobre prospectos reales de su propio pipeline. `<✅ validado como estrategia>`
- **Cómo medimos en vivo (primer lote):** paridad de calidad (revisión de Carlos contra rúbrica), precisión de citas (auditoría de cifras), fidelidad de síntesis (cada recomendación contra catálogo), tiempo a reporte, y el primer deal cerrado con un reporte 100% del MVP. (§3).
- **Criterio de "MVP probado":** ≥ 80% de paridad de calidad, 0 incidentes de dato mal citado que lleguen al cliente, y al menos 1 deal en pipeline atribuible a un reporte del MVP. 🟡 (umbrales a confirmar con Carlos).

---

### 10) Preguntas abiertas y changelog

**Preguntas abiertas (con dueño):**
- 🔴 **Fuentes de investigación del motor:** ¿qué APIs/herramientas de búsqueda e investigación pública usará (Perplexity API, web search + scraping, market-research APIs)? Define costo, latencia y calidad. — dueño: BMAD/Carlos · para: antes del PoC.
- 🔴 **Costo por reporte y techo de margen** (§7) — dueño: BMAD · para: durante el PoC.
- 🔴 **Cómo se construye y mantiene el catálogo SOC** (¿hoja curada a mano, base de datos, quién la actualiza?) — dueño: Carlos (tiene el conocimiento del catálogo) · para: antes de construir la capa de síntesis.
- 🔴 **Prototipo de pantallas (Figma/Canva)** (§6) — dueño: PIXEL + diseño · para: antes de construir el front.
- 🟡 **Plantilla(s) de reporte:** ¿el formato Las Aliadas (más comercial/narrativo) y el formato Probemedic (más financiero/riesgo con índice) son dos plantillas seleccionables, o una sola plantilla que se adapta al perfil del prospecto? — dueño: PIXEL/Carlos · para: durante construcción.
- 🔴 **Validación legal** (LFPDPPP + límites de "no oferta vinculante", §7) — dueño: Carlos + experto legal · para: antes de manejar datos de prospectos a escala / antes de abrir a más asesores.
- 🟡 **Profundidad de auto-verificación:** ¿el sistema debe auto-verificar sus propias citas (un segundo pase que confirma que cada fuente respalda lo afirmado) antes de mostrar el borrador? PIXEL recomienda SÍ, dado que la precisión ES el producto. — dueño: BMAD · para: diseño del motor.

**Changelog:**
- 2026-06-13 — v0.1 creado por 🎨 PIXEL. Punto de partida para BMAD. Alcance del MVP recortado a "El Investigador" (núcleo §4, puntos 1–9); todo lo demás del flujo de 6 agentes y toda dependencia de SISEC/SOC Universidad → fuera de v1. — PIXEL

---

## ✅ Checklist de calidad (nivel YC)

- [x] **El problema se entiende en 10 s** y nace de evidencia real (2 reportes que cerraron deals), separado de la solución.
- [x] **El usuario es UNO concreto** (Carlos + asesor de su franquicia TALENT), con contexto de comportamiento ("tengo una cita esta semana").
- [x] **Cada métrica de éxito tiene umbral con número** y mide valor (paridad de calidad, precisión, deal cerrado), no solo actividad. Hay contra-métrica (0 datos mal citados al cliente).
- [x] **La lista de "NO" es más larga que la de "SÍ"**, y cada exclusión dice por qué.
- [x] **El MVP cabe en su time-box** (recorte dentro del núcleo si no cabe; solución 90/10 aplicada al catálogo y a los 6 agentes).
- [x] **Cada criterio de aceptación es testable** (Dado/Cuando/Entonces).
- [x] **Los cuatro riesgos están nombrados** (valor/usabilidad/viabilidad/negocio); el de valor ya está probado en campo y el de viabilidad tiene PoC del componente más incierto ANTES de construir.
- [x] **Cero datos 🔴 disfrazados de hechos**; el terreno legal (LFPDPPP, oferta no vinculante) está marcado 🔴 y derivado a experto, no inventado.

---

## 🤝 Handoff a BMAD

> Esta sección es autosuficiente: un equipo de desarrollo puede arrancar leyendo SOLO este documento.

### A. El problema (en una frase)
El reporte de inteligencia que cierra deals PYME hoy lo produce a mano UNA persona (Carlos) en horas de trabajo experto; no escala a los ~2,000 asesores SOC y se está volviendo commodity. **El Investigador lo convierte en un sistema reproducible de pocos clics.**

### B. El usuario
Asesor financiero de SOC | TALENT (empezando por Carlos y su franquicia) — experto en vender crédito PYME, sin tiempo ni reproducibilidad para hacer un reporte por prospecto. Su "job to be done": *llegar a la cita sabiendo más que el dueño y con una recomendación vendible (producto + institución + argumento), en minutos.*

### C. Alcance del MVP — SÍ / NO

**SÍ (v1):**
1. Captura mínima del prospecto (empresa, ciudad, industria + opcionales).
2. Motor de investigación pública con **fuentes citadas** (prospecto + industria + benchmarks).
3. Perfil de negocio + **FODA / perfil de riesgo** con datos reales.
4. **🔒 Capa de síntesis:** hallazgo → producto financiero específico → institución específica del catálogo SOC → argumento de cierre. (El foso. Lo más importante.)
5. **Catálogo SOC** como base de conocimiento curada (empieza con el subconjunto de los reportes reales).
6. Render en el **formato canónico SOC | TALENT** (estructura idéntica a los 2 PDFs de referencia).
7. **🚦 Gate de revisión humana** antes de entregar (no autónomo).
8. Sección de **"Brechas de información"** (lo no verificado, marcado).
9. **Export a PDF** con marca SOC | TALENT.

**NO (v1):** los otros 5 agentes (Cazador/Catedrático/Diplomático/Tramitador/Perseguidor) · cualquier dependencia de SISEC y SOC Universidad · multi-tenant/cuentas para 2,000 asesores · integraciones a CRM/instituciones · generación 100% autónoma sin humano · catálogo completo de las 55 instituciones · app móvil · billing/suscripción · idiomas ≠ español · industrias fuera de PYME MX.

### D. Flujos de usuario
**Flujo único principal (4 pasos):** Capturar prospecto → Generar (investigar + sintetizar contra catálogo + redactar) → Revisar & editar & aprobar (gate humano) → Exportar PDF.

### E. Requisitos funcionales (numerados)
- **RF-1** Capturar prospecto con campos mínimos (empresa, ciudad, industria) y opcionales (web, RFC, # sucursales, notas).
- **RF-2** Investigar automáticamente prospecto + industria y devolver hallazgos con fuente citada por cada afirmación cuantitativa.
- **RF-3** Generar perfil de negocio + FODA / perfil de riesgo a partir de los hallazgos.
- **RF-4** Para cada necesidad detectada, generar ≥1 recomendación = producto específico + institución específica (solo del catálogo SOC) + argumento de cierre.
- **RF-5** Mantener y consultar un **catálogo SOC** estructurado (institución → producto → uso → condiciones típicas → cuándo recomendar).
- **RF-6** Marcar como "Brecha de información" cualquier dato clave no verificado (nunca inventarlo en el cuerpo).
- **RF-7** Ensamblar el reporte en la estructura canónica (resumen ejecutivo, industria, análisis, FODA/riesgo, recomendaciones, benchmarks, brechas, fuentes).
- **RF-8** Permitir al asesor editar cualquier sección; mantener estado borrador/aprobado.
- **RF-9** Bloquear la entrega al cliente hasta aprobación humana (gate).
- **RF-10** Exportar a PDF con identidad y disclaimer SOC | TALENT.
- **RF-11** (recomendado) Auto-verificar las citas en un segundo pase antes de mostrar el borrador.

### F. Requisitos no funcionales
- **RNF-1 (Precisión):** 100% de cifras citadas y verificables; 0 alucinaciones de cifras. *(de primer orden)*
- **RNF-2 (Fidelidad de catálogo):** 0 productos/instituciones inventados; solo del catálogo. *(de primer orden)*
- **RNF-3 (Trazabilidad):** toda cita rastreable a su fuente.
- **RNF-4 (Gate humano):** ningún reporte al cliente sin aprobación.
- **RNF-5 (Latencia):** ≤ 15 min por reporte (🟡 calibrar).
- **RNF-6 (Costo por reporte):** muy por debajo del valor de un deal; techo a fijar (🔴).
- **RNF-7 (Privacidad):** manejo de RFC/datos fiscales conforme a LFPDPPP (🔴 validación legal).
- **RNF-8 (Idioma):** español MX, ortografía perfecta.
- **RNF-9 (Disclaimer):** estampar en cada reporte el aviso de "no oferta vinculante".

### G. Decisiones técnicas abiertas (para BMAD)
1. 🔴 **Motor de investigación:** ¿Perplexity API / web search + scraping / market-research APIs? Define costo, latencia y calidad de fuentes.
2. 🔴 **Estructura y mantenimiento del catálogo SOC:** ¿BD, hoja curada, quién la actualiza? Es el insumo del foso.
3. 🟡 **Arquitectura del motor de síntesis:** ¿pipeline de agentes (investigar → sintetizar → matchear catálogo → redactar → auto-verificar)? ¿RAG sobre el catálogo? ¿qué modelo en cada paso?
4. 🔴 **Costo unitario por reporte** y techo de margen.
5. 🟡 **Stack:** Next.js/Vercel + AI (capacidad confirmada por Carlos; confirmar).
6. 🟡 **Plantillas de reporte:** ¿una adaptable o dos (estilo Las Aliadas vs estilo Probemedic)?
7. 🔴 **Diseño de pantallas** (Figma/Canva) del flujo de 4 pasos.
8. 🔴 **Validación legal** (LFPDPPP + límites de asesoría/oferta no vinculante).

### H. La estrella polar para BMAD
**El control de calidad/precisión y la fidelidad de la capa de síntesis NO son features — son el producto.** Un solo dato mal citado a escala, o un producto/institución inventado, es el veneno que mata todo. Construyan el motor de síntesis con citas verificables como la PRIMERA pieza (PoC), comparado contra un reporte que Carlos haría a mano. Si esa pieza alcanza paridad, el resto es ensamblaje. Si no, nada más importa.

---
*PRD producido por 🎨 PIXEL (Head of Product de SIM, electrón) · plantilla canónica de SIM (PRD moderno + MVP de Y Combinator, solución 90/10) · evidencia de campo: reportes Las Aliadas y Probemedic · anclado al Reporte de Innovación del Consejo v0.2 (Score 8.0 · Viabilidad 6.5).*
