# 👥 Plan de Equipo — Plataforma SOC | TALENT
*Producido por ATLAS · SIM · Equipo Leptones / Recursos y Forma*

> ⚠️ **Nota legal:** este plan ayuda a *planear el equipo*, no sustituye contratos, acuerdos de colaboración ni asesoría laboral. Cualquier oferta vinculante (compensación, equity, cláusulas de salida) debe formalizarse con documentos revisados por un abogado o contador antes de comprometerse.

---

## 0. Encabezado

| | |
|---|---|
| 💡 **Idea / empresa** | Plataforma SOC \| TALENT — MVP "El Investigador" |
| 📅 **Fecha del plan** | 13 de junio de 2026 |
| 🎯 **Etapa** | Pre-seed / Proyecto fundador personal |
| 🧭 **Hito que persigue este equipo** | Entregar los primeros 10 Reportes de Inteligencia Financiera de pago a asesores SOC (zona Monterrey) y cerrar al menos 3 convenios de uso recurrente — en los próximos 6 meses |
| 👥 **Tamaño actual** | 1 persona (Carlos) + agentes de IA como equipo técnico |
| 🏷️ **Estado del plan** | 🟡 Plan base — supuestos razonables sobre modelo de equipo; los números de compensación requieren confirmación de mercado |

---

> ### La realidad del equipo de Carlos (leer antes que todo)
>
> Carlos opera una **neo-empresa de agentes**. No construye con un equipo de ingenieros; construye con **Claude Code, modelos en paralelo y el framework BMAD** como fuerza laboral técnica principal. Esto cambia radicalmente quién se contrata y para qué:
>
> - **Los agentes de IA cubren:** ingeniería de producto (generación de código, debugging, iteración), redacción de reportes, análisis de datos financieros, orquestación de workflows (Claude Code + Next.js/Vercel/AI SDK).
> - **Los humanos cubren:** lo que los agentes no pueden hacer solos — juicio de dominio SOC, relaciones comerciales con asesores e instituciones, validación en campo, dirección del producto, y decisiones de negocio que requieren cara y confianza.
>
> El plan de equipo que sigue refleja ESTA realidad.

---

## 1. El plan en una frase

> **"Para entregar 10 Reportes de Inteligencia Financiera de pago y cerrar 3 convenios recurrentes en 6 meses, necesitamos sumar 1 persona humana clave (Experto de Dominio SOC / Validador Técnico), con Carlos como Director Comercial y los agentes de IA como equipo de ingeniería."**
> Marca: 🟡

---

## 2. La arquitectura del equipo: Humanos vs. Agentes

Esta es la distinción más importante del plan. No es un organigrama clásico — es un mapa de qué hace cada tipo de "integrante".

### 2.1 Roles HUMANOS (irremplazables por agentes)

| Rol | Quién | Qué hace que un agente NO puede hacer | Por qué es crítico |
|---|---|---|---|
| **Director Comercial / Dueño del Producto** | Carlos | Decide la dirección del producto, cierra deals, valida con asesores SOC en campo, mantiene la relación con SOC Corporativo, da el banderazo en decisiones que definen el rumbo | Sin Carlos no hay tracción comercial ni rumbo de producto — es el cuello de botella positivo que dirige a los agentes |
| **Experto de Dominio SOC** (1er contratación crítica) | Por contratar / posible colaborador | Conoce el flujo de trabajo real del asesor SOC: qué preguntas hace, cómo usa los reportes, cuáles de las ~55 instituciones del catálogo importan más y por qué, qué datos disparan una decisión de crédito | Los agentes generan el reporte; el experto valida que el contenido sea correcto, relevante y accionable para el asesor. Sin esta validación, el producto puede ser técnicamente bueno pero comercialmente inútil |

### 2.2 Roles AGENTES de IA (la fuerza técnica)

| Agente / Stack | Rol funcional | Qué cubre |
|---|---|---|
| **Claude Code (Opus en silla de Director Técnico)** | CTO virtual | Arquitectura del sistema, decisiones de diseño de producto, debugging complejo, revisiones de calidad de código |
| **Claude Sonnet (Gerente de Ingeniería)** | Implementación estándar | Generación de código Next.js/Vercel, integración de AI SDK, construcción de componentes, exploración de base de código |
| **Claude Haiku (Analista)** | Tareas mecánicas | Extracción de datos, clasificación de información de las 55 instituciones SOC, lecturas masivas del catálogo |
| **Framework BMAD** | Director de Proyecto Técnico | Orquesta la secuencia de desarrollo después del plan de equipo; define qué se construye en qué orden |
| **Next.js / Vercel / AI SDK** | Infraestructura de producto | El stack sobre el que viven los agentes y se entrega el reporte al usuario final |

---

## 3. Plan de contratación por etapas (humanos únicamente)

> Regla de este plan: los agentes de IA no se "contratan" — se configuran. Las etapas de incorporación que siguen son solo para roles humanos.

| Orden | Rol | Función | Disparador (¿cuándo entra?) | Por qué AHORA y no después | Marca |
|---|---|---|---|---|---|
| 0 | **Carlos** (ya activo) | Director Comercial + Dueño del Producto + Validador Comercial | Ya en la silla desde el día 0 | Sin Carlos no hay producto ni dirección | ✅ |
| 1 | **Experto de Dominio SOC** (colaborador, no empleado de planta) | Validación de contenido de reportes + conocimiento institucional del catálogo SOC | Antes del primer reporte de pago — esta persona se necesita para que el producto sea correcto, no solo funcional | Los 2 reportes reales que cerraron deals los validó Carlos con su conocimiento de campo; escalar a 10+ reportes sin un experto que haga esto sistemáticamente crea un cuello de botella o errores de contenido | 🟡 |
| 2 | **Colaborador Técnico de respaldo** (freelancer, eventual) | Revisar y depurar el stack cuando los agentes llegan a un límite real (integraciones no estándar, errores de infra, configuración avanzada de Vercel) | Cuando haya al menos 5 reportes entregados y se detecte una fricción técnica recurrente que los agentes no resuelven solos | En la mayoría de los casos Claude Code resuelve esto — este rol solo se activa si hay evidencia de un cuello de botella técnico real que Carlos no puede desbloquear con el stack de agentes | 🟡 |
| 3 | **Asistente Comercial / Coordinador de Entregas** | Gestión operativa: agendar, dar seguimiento a reportes, comunicación con asesores | Cuando haya convenios activos con 5+ asesores y Carlos no pueda atender la coordinación operativa sin sacrificar tiempo comercial | Antes de ese punto Carlos lo puede absorber; la señal es que la operación roba tiempo de ventas | 🟡 |

> 🚫 **Lo que NO se contrata todavía:**
> - **Ingeniero de software de planta:** los agentes cubren toda la ingeniería. Contratar un dev humano hoy sería pagar doble por trabajo que Claude Code hace más rápido y sin salario mensual.
> - **Director de Marketing / Growth:** el canal de adquisición ya existe (la relación directa de Carlos con asesores SOC en Monterrey). No hay que construir marketing antes de tener producto probado y tracción clara.

---

## 4. Perfil del candidato ideal — Experto de Dominio SOC

> Esta es la primera y única contratación crítica en la fase MVP. Todo lo demás lo cubren Carlos y los agentes.

| Dimensión | Qué buscas | Marca |
|---|---|---|
| **Forma del talento** | Conocimiento profundo del flujo de trabajo real del asesor SOC + capacidad de comunicar ese conocimiento a un sistema de agentes (sabe qué dato importa y por qué) | 🟡 |
| **Rasgo #1 (no negociable)** | Ha sido asesor SOC o ha trabajado en crédito empresarial PYME de cerca — conoce el catálogo de instituciones desde adentro, no de manual | 🟡 |
| **Rasgo #2** | Puede revisar un reporte borrador y decir "esto está mal porque..." en términos comerciales concretos — no solo detecta errores, los diagnostica | 🟡 |
| **Rasgo #3** | Cómodo colaborando con herramientas digitales (no necesita saber programar, pero puede trabajar con un Google Doc o Notion y retroalimentar estructuradamente) | 🟡 |
| **Bandera roja a evitar** | Alguien que solo conoce el catálogo SOC de forma teórica (formación, no práctica) o que necesita estructura corporativa para rendir — este rol requiere autonomía y criterio de campo | 🟡 |

> 📌 **Dónde encontrarlo:** ex-asesores SOC o actuales asesores de SOC Corporativo que quieran un rol de consultoría puntual (no de planta). La red de Carlos en Monterrey es el primer canal — una conversación directa con alguien de confianza del ecosistema SOC vale más que cualquier aviso de trabajo.

---

## 5. Organigrama (neo-empresa de agentes)

```
Carlos
(Director Comercial + Dueño del Producto + Validador Comercial)
         │
         ├─── Experto de Dominio SOC [colaborador]
         │    (Validación de contenido de reportes)
         │
         └─── Equipo de Agentes de IA [stack técnico]
                    │
                    ├── Claude Code / Opus ── [CTO Virtual]
                    │        │
                    │        ├── Sonnet ── [Gerente de Ingeniería]
                    │        └── Haiku ── [Analista / Extracción]
                    │
                    └── BMAD Framework ── [Director de Proyecto Técnico]
                             │
                             └── Next.js / Vercel / AI SDK [Infraestructura]
```

| Persona / rol | Función | Le reporta a | Decide sobre | Marca |
|---|---|---|---|---|
| **Carlos** | Director Comercial + Dueño del Producto | — (es el dueño) | Rumbo, deals, qué se construye, relación con SOC Corporativo | ✅ |
| **Experto de Dominio SOC** | Validación de reportes + conocimiento institucional | Carlos | Qué contenido es correcto / qué dato es relevante para el asesor | 🟡 |
| **Claude Code (Opus)** | CTO Virtual — arquitectura, debugging complejo, decisiones técnicas | Carlos | Cómo se construye el stack; qué es viable técnicamente | 🟡 |
| **Claude Sonnet** | Gerente de Ingeniería — implementación estándar del producto | Claude Code / Carlos | Qué código se escribe en cada iteración | 🟡 |
| **Claude Haiku** | Analista — extracción y clasificación masiva de datos | Sonnet / Carlos | Cómo se procesa la información del catálogo SOC | 🟡 |
| **BMAD Framework** | Director de Proyecto Técnico — orquestación del desarrollo | Carlos | Qué se construye en qué orden (post aprobación del Consejo SIM) | 🟡 |
| **Colaborador Técnico** *(eventual)* | Respaldo técnico para fricciones de infra real | Carlos | Integraciones y configuración avanzada que los agentes no resuelven | 🔴 (activar solo si hay evidencia de necesidad) |

---

## 6. Job post — Primera contratación crítica: Experto de Dominio SOC

### 6.1 — Título e identidad del rol

- **Puesto:** Validador de Reportes SOC / Consultor de Dominio Crédito PYME · 🟡
- **Función / equipo:** Producto → Calidad de Inteligencia Financiera
- **Modalidad:** Remoto / flexible · **Zona:** preferencia Monterrey / zona norte · 🟡
- **Tipo:** Colaboración por proyecto (honorarios) — no es empleo de planta · 🟡

---

### 6.2 — La historia (en primera persona de Carlos)

> Llevo años como Director Comercial en SOC | TALENT ayudando a asesores a conectar PYMEs con crédito empresarial. Vi de cerca cómo los asesores pierden horas investigando instituciones financieras que ya conozco de memoria — y decidí construir una herramienta que haga ese trabajo por ellos.
>
> Ya probé la idea en campo: dos reportes reales cerraron deals reales. Ahora quiero escalarlo, y para eso necesito a alguien que conozca el catálogo SOC desde adentro — alguien que lea un reporte borrador y me diga "esto está mal porque en la práctica el asesor pregunta esto otro". No busco un programador. Busco a alguien con el ojo de campo que yo no puedo duplicar solo.

---

### 6.3 — Qué harás (responsabilidades)

- Revisar borradores de Reportes de Inteligencia Financiera generados por el sistema y validar que el contenido sea correcto, relevante y accionable para un asesor SOC real.
- Identificar qué instituciones del catálogo (~55) son más relevantes para cada perfil de prospecto y por qué — ese criterio alimenta directamente el motor de reportes.
- Retroalimentar el sistema con casos reales: qué preguntas hace el asesor en campo, qué datos disparan una decisión, qué errores comunes de los reportes hay que corregir.
- Estar disponible para 1–2 ciclos de revisión por reporte (estimado: 1–3 horas por reporte, según volumen).
- A mediano plazo: co-diseñar el criterio de calidad del reporte (la "vara" contra la que el sistema se autoevalúa).

---

### 6.4 — A quién buscamos (requisitos)

- **Imprescindibles:** 🟡
  - Experiencia directa como asesor SOC o en crédito empresarial PYME (no teoría — práctica de campo).
  - Conocimiento funcional del catálogo de instituciones SOC: sabe qué ofrece cada una, cuándo aplica y qué la diferencia de las demás.
  - Capacidad de retroalimentar en términos comerciales concretos ("esto no funciona porque el asesor en realidad necesita X").
  - Disposición para trabajar de forma remota y asíncrona con documentos digitales.

- **Suma puntos (no obligatorios):**
  - Haber sido asesor SOC en zona norte / Monterrey (entiende el contexto de mercado de Carlos).
  - Conexión activa con la comunidad de asesores SOC (puede ser puente para validaciones de campo adicionales).
  - Curiosidad por la tecnología — no necesita saber programar, pero si entiende qué es un "modelo de IA generando texto", mejor.

---

### 6.5 — Qué ofrecemos

- **Compensación:** honorarios por reporte revisado — rango estimado $500–$1,500 MXN por ciclo de revisión, según complejidad y tiempo invertido. 🔴 (confirmar rango con Carlos antes de hacer una oferta)
- **Equity:** N/A en esta etapa. Si la colaboración escala y se formaliza, se puede conversar — pero eso requiere documentos formales. 🟡
- **Lo que nos hace distintos:**
  - Impacto directo: tu criterio entra al motor — los reportes que validas llegan a asesores reales cerrando deals reales, no a una demo.
  - Autonomía total: tú dices cuándo y cómo revisas, sin horario fijo.
  - Primera fila en la construcción de un producto que puede escalar a toda la red SOC nacional — si funciona aquí, lo vende Carlos a SOC Corporativo.

---

### 6.6 — Cómo aplicar / siguiente paso

> Escríbele directo a Carlos: carloshiramchavez@icloud.com. Cuéntame en 3–4 líneas qué institución del catálogo SOC conoces mejor y por qué. Eso me dice más que cualquier CV.

---

## 7. Checklist de calidad

- [x] **Cada rol cuelga de un hito.** La única contratación humana crítica (Experto de Dominio SOC) está atada al hito de escalar a 10 reportes — es el cuello de botella que lo bloquea, no un rol de calendario.
- [x] **El plan solo cubre 6–12 meses.** No hay roles de "año 3"; los roles más allá del MVP (Asistente Comercial, Colaborador Técnico) tienen disparadores explícitos, no fechas.
- [x] **El orden respeta las dependencias.** Carlos primero (ya activo), luego el Experto de Dominio SOC antes del primer reporte escalado, luego soporte técnico y operativo solo si hay evidencia de necesidad.
- [x] **El plan refleja la realidad de neo-empresa de agentes.** Los agentes de IA cubren toda la ingeniería; los humanos cubren lo que los agentes no pueden hacer (juicio de dominio, relaciones, dirección).
- [x] **El perfil prioriza rasgos sobre CV.** Se busca experiencia de campo real (asesor SOC), no títulos ni años en un puesto.
- [x] **El organigrama es plano y honesto.** 2 humanos (Carlos + colaborador eventual) + stack de agentes. Sin capas de management inventadas.
- [x] **El job post está en primera persona.** Voz de Carlos, no corporativa.
- [x] **Pocos imprescindibles, compensación con 🔴 honesto.** 4 requisitos reales, y el rango de honorarios está marcado como pendiente de confirmación.
- [x] **Lo legal apunta al original.** El equity y cualquier oferta vinculante se remiten a documentos formales.
- [x] **Honestidad marcada.** Cada dato lleva su ✅ / 🟡 / 🔴.

---

*Plan producido por 🧑‍🤝‍🧑 ATLAS — el de la Gente · SIM Constructor · Equipo Leptones / Recursos y Forma · basado en YC Hiring Playbook y SaaS Org Chart de David Sacks · adaptado a la realidad de neo-empresa de agentes de Carlos.*
