---
title: "Casos borde no cubiertos — Sócrates v1"
status: draft
created: 2026-06-14
reviewer: Edge Case Hunter (BMAD)
método: bmad-review-edge-case-hunter (exhaustivo, method-driven)
scope: PRD · UX · Arquitectura · Épicas e Historias
---

# Casos borde no cubiertos — Sócrates v1

> Este documento lista únicamente rutas y condiciones que **no tienen manejo explícito** en ninguna de las cuatro fuentes revisadas (PRD, UX, Arquitectura, Épicas). No evalúa si el diseño es bueno o malo; solo señala los huecos. Para cada caso se indica la historia que debería cubrirlo (nueva o ampliada).

---

## 1. Fallo del Empleado durante generación activa (tarea EN_CURSO → BLOQUEADA a mitad)

**Condición:** el worker toma una Tarea, la marca `EN_CURSO` y el Empleado falla en una fase intermedia (p. ej. la fase 3 de síntesis del Investigador, tras haber completado las fases 1 y 2 y haber persistido progreso parcial).

**Hueco:** ninguna historia especifica si el progreso parcial (fases 1-2 completadas, JSONB parcialmente poblado) se conserva para reintentar desde ahí, o si la Tarea vuelve a cero en el reintento. El PRD solo dice que el fallo no pierde "el trabajo capturado del Expediente" (NFR-10), pero el Expediente y el progreso parcial de la Tarea son cosas distintas. El worker retoma Tareas `EN_CURSO` huérfanas al reiniciar (AR-10), pero no queda claro qué pasa cuando el fallo ocurre sin reinicio del servicio (error de IA en mitad de un stream).

**Consecuencia potencial:** el Asesor ve la Tarea como `BLOQUEADA` con motivo, pero al reintentar el Investigador gasta el costo completo (fases 1-6) en vez de retomar desde la fase 3. En el escenario peor, si el estado `EN_CURSO` no se limpia correctamente, el worker nunca la retoma (tarea huérfana no por reinicio sino por fallo sin crash).

**Historia sugerida:** ampliar **E3-S3** (worker de Tareas) y **E4-S2** (pipeline del Investigador) para especificar: (a) qué estado queda persisted al fallar mid-pipeline, (b) si el reintento es desde cero o desde checkpoint, y (c) cómo la UI distingue "bloqueada (reintentable)" de "bloqueada (error definitivo)".

---

## 2. Dos asesores sobre el mismo expediente — colisión de tenencia

**Condición:** el PRD declara que cada Expediente "pertenece a un único Asesor" (FR-4, NFR-8), pero no cubre el escenario en que Carlos quiere que un colega (otro Asesor del piloto) revise o co-trabaje un Expediente concreto. En el piloto de 3-5 asesores esto ocurrirá.

**Hueco:** la arquitectura filtra siempre por `asesorId` derivado del token y devuelve 403 a cualquier otro. No existe ninguna historia de "compartir" o "transferir" un Expediente, ni siquiera como Non-Goal explícito. Si Carlos intenta mostrarle a un colega el Expediente de Probemedic en vivo (no el seed), el colega recibe 403 sin explicación.

**Consecuencia potencial:** fricción real en el piloto (asesores no pueden colaborar ni supervisarse mutuamente). Sin manejo de la situación, el mensaje de error será un 403 genérico — no un mensaje de oficina que explique por qué. Viola NFR-14 si el error técnico llega al Asesor.

**Historia sugerida:** nueva historia en **E2** (o nota de Non-Goal explícita en el PRD con un mensaje de oficina específico para el 403): definir si la transferencia/compartición de Expedientes es Non-Goal de v1 (y qué ve el Asesor cuando lo intenta) o si se permite al menos leer-sin-editar.

---

## 3. Expediente sin datos suficientes para el Investigador — campos mínimos insuficientes para la fase 1

**Condición:** el Expediente puede crearse con solo empresa + ciudad + industria (FR-4). El Investigador arranca con esos tres campos. Sin embargo, la fase 1 (investigación de industria + prospecto) usará web search y búsqueda pública. Si la empresa tiene nombre genérico (p. ej. "Distribuidora Central") sin sitio web ni RFC, la búsqueda puede devolver cero resultados útiles y el Investigador produce un Reporte mayoritariamente de Brechas sin hallazgos reales.

**Hueco:** ninguna historia define un umbral de "datos mínimos viables para lanzar el Investigador" ni un mecanismo de advertencia previa al lanzamiento. El flujo F-3 (UX) salta el formulario de datos si el Expediente "ya tiene los mínimos", pero esos mínimos son los de creación, no los de calidad de investigación.

**Consecuencia potencial:** el Asesor espera hasta 15 minutos (NFR-6) y recibe un Reporte lleno de Brechas que no aporta valor, sin haber sido advertido de que los datos eran insuficientes. Esto daña SM-1 (paridad de calidad) y la confianza.

**Historia sugerida:** ampliar **E4-S2** o crear una sub-historia en E4 para: (a) validar la "densidad de datos" del Expediente antes de lanzar el Investigador, (b) mostrar un aviso de Sócrates ("Tengo pocos datos de [Empresa]; el reporte puede tener más brechas de lo normal. ¿Agrego más información antes?") y (c) definir la Brecha mínima aceptable para lanzar.

---

## 4. La verificación de citas (C-2) detecta que TODAS las citas son inválidas — Reporte sin contenido verificado

**Condición:** la compuerta C-2 degrada afirmaciones no respaldadas a Brechas. Si la fase 1 produce fuentes candidatas de baja calidad o el segundo pase rechaza la mayoría, el Reporte resultante podría tener el cuerpo casi vacío (todo degradado a Brechas) y llegar igualmente como "Borrador" al Asesor.

**Hueco:** ninguna historia especifica un umbral mínimo de afirmaciones verificadas para que el Reporte sea presentable como Borrador, ni un estado diferenciado para "Borrador vacío" vs. "Borrador con contenido". El Asesor abre el visor (P-3) y ve un Reporte con portada, secciones en blanco y una enorme sección de Brechas — sin indicación de que el motor falló sustancialmente.

**Consecuencia potencial:** el Asesor no distingue un Reporte de baja calidad de uno excelente hasta abrirlo. El Gate humano atrapará el problema, pero el costo (tiempo + IA) ya se gastó. SM-C2 ("velocidad falsa") no puede detectarse si no hay un indicador de calidad global del Borrador.

**Historia sugerida:** ampliar **E4-S6** (verificación de citas) para: (a) calcular y persistir un "índice de cobertura verificada" (% de afirmaciones que pasaron C-2), (b) mostrar ese índice en la bandeja de Entregables (C-4) antes de que el Asesor abra el Reporte, y (c) definir si hay un umbral bajo el cual Sócrates advierte ("El Investigador encontró pocos datos verificables — revisa el reporte con ojo crítico").

---

## 5. Reporte a medio generar — el Asesor navega fuera y el token de Clerk vence antes de que termine

**Condición:** la generación del Investigador puede tardar hasta 15 minutos (NFR-6). El polling de estado usa `getToken()` que se refresca en cada llamada desde `web` (Arquitectura R-4). Pero si el Asesor cierra la pestaña o pierde conexión, el polling se detiene. Cuando vuelve y reabre la sesión, el token puede haber vencido.

**Hueco:** la historia E8-S2 menciona el refresco de token para el polling, pero ninguna historia cubre qué ve el Asesor cuando: (a) vuelve con token vencido a mitad de una generación activa, (b) la sesión de Clerk expiró completamente y la ruta protegida redirige a P-0 login, perdiendo el contexto del Expediente en curso. El worker continúa (el worker no depende del token), pero la UX del "volver" no está especificada.

**Consecuencia potencial:** el Asesor regresa al login, autentica de nuevo, aterriza en La Oficina sin saber que su Reporte ya está listo (o bloqueado). La notificación de Sócrates ("El Investigador entregó") aparece en el polling siguiente, pero si el Asesor no sabe que debe mirar, el Gate pendiente puede perderse de vista.

**Historia sugerida:** ampliar **E4-S2** y **E3-S4** para especificar el flujo de "volver al Expediente activo tras reautenticación": (a) la URL del Expediente debe preservarse como `redirectUrl` de Clerk, (b) al aterrizar en el Expediente post-login debe mostrarse el estado actualizado del Investigador sin esperar el siguiente ciclo de polling.

---

## 6. Fallo de R2 en el momento del export — el PDF no se sube pero el Entregable ya está Aprobado

**Condición:** el flujo de export es: verificar `APROBADO` → renderizar PDF en `api` → `PutObject` a R2 → registrar `pdfR2Key` en `EntregableVersion` → devolver presigned URL. Si el `PutObject` falla (R2 no disponible, timeout, credenciales vencidas), el Entregable ya está en estado `APROBADO` pero `pdfR2Key` queda nulo.

**Hueco:** ninguna historia especifica la transacción compensatoria. E4-S9 solo menciona que el export es idempotente ("reexportar reutiliza el PDF de la versión aprobada"), pero si `pdfR2Key` es nulo, un segundo intento vuelve a intentar el `PutObject`. No queda claro si la aprobación debe hacerse en la misma transacción que el registro de la clave R2, ni qué estado queda en la UI ("Aprobado" sin botón de descarga funcional).

**Consecuencia potencial:** el Asesor ve el Entregable como `Aprobado` pero no puede descargar el PDF. No hay estado "Aprobado sin PDF" en el modelo de datos ni en la UX. La presigned URL fallará silenciosamente o devolverá 404 de R2.

**Historia sugerida:** ampliar **E4-S9** para: (a) separar la transacción de "aprobar" de la de "exportar a R2" (que ya son endpoints distintos), confirmar que el export falla con 503 y deja el Entregable `Aprobado` con `pdfR2Key = null`, (b) definir el estado UX de "Aprobado, PDF pendiente de generación" en C-4, y (c) especificar que un reintento de export funciona cuando R2 vuelve.

---

## 7. Tenancy por asesor (Clerk) — el clerkUserId cambia o el Asesor pierde acceso a Clerk

**Condición:** la tenencia se deriva del `clerkUserId` (campo `@unique` en `Asesor`). Si Carlos borra y recrea su cuenta de Clerk (escenario de piloto real), o si Clerk rota el subject del token (cambio de método de autenticación, p. ej. de email/password a Google OAuth con un sub diferente), se crea una fila `Asesor` nueva con `clerkUserId` nuevo, y el Asesor pierde acceso a todos sus Expedientes previos.

**Hueco:** ninguna historia contempla la migración de `clerkUserId` ni la recuperación de Expedientes huérfanos. En un piloto de 3-5 asesores donde los datos son reales y valiosos, esto es un riesgo operativo alto. El middleware de `api` solo "resuelve o crea" el Asesor (E1-S3), sin verificar si existe otro Asesor con el mismo email.

**Consecuencia potencial:** pérdida de todos los Expedientes, Tareas, Entregables y PDFs del Asesor. No hay forma de recuperarlos sin acceso directo a la BD. En producción con datos de deals reales, esto es catastrófico.

**Historia sugerida:** ampliar **E1-S3** para: (a) al resolver/crear el Asesor, verificar también por email y loguear si hay un `clerkUserId` distinto con el mismo email (señal de reconexión de cuenta), (b) definir un proceso de recuperación manual para el piloto (aunque sea acceso directo a BD con instrucción para Carlos), y (c) documentar explícitamente el riesgo en la story de despliegue (E8-S1/E8-S3).

---

## 8. Dos instancias del worker en Railway — doble ejecución de la misma Tarea (race condition)

**Condición:** el worker es un loop in-process en `api`. Railway puede reiniciar el contenedor durante un deploy (blue-green o rolling). Hay una ventana en que dos instancias del servicio coexisten brevemente, ambas con el worker activo. Ambas pueden tomar la misma Tarea `ENCARGADA` simultáneamente antes de que una marque `EN_CURSO`.

**Hueco:** la Arquitectura menciona idempotencia por `idempotencyKey` para crear Tareas (AR-9), pero el worker que *toma* y *ejecuta* Tareas usa `SELECT ... WHERE estado = ENCARGADA ... LIMIT 1` o equivalente. Sin un `SELECT ... FOR UPDATE SKIP LOCKED` (o equivalente de Postgres para cola), dos workers pueden leer la misma fila antes de que ninguno la marque `EN_CURSO`. La `idempotencyKey` protege la *creación* pero no la *ejecución*.

**Consecuencia potencial:** una Tarea se ejecuta dos veces, produciendo dos `EntregableVersion` para el mismo `Entregable`, o dos llamadas duplicadas al AI Gateway (costo doble, NFR-5), o dos `PutObject` a R2 con el mismo key. Si el Investigador genera dos versiones del mismo Reporte, el Asesor ve uno de ellos (el último escrito) pero el contador de auditoría de SM-C1 puede contar el doble.

**Historia sugerida:** ampliar **E3-S3** (worker de Tareas) para especificar el mecanismo de locking de cola: (a) usar `SELECT ... FOR UPDATE SKIP LOCKED` en la query de "tomar siguiente Tarea", o (b) marcar atómicamente `EN_CURSO` en la misma transacción del SELECT, y documentar que esto es el contrato que garantiza "exactamente una ejecución" incluso con reinicio de servicio.

---

## Resumen de casos críticos (prioridad)

| # | Caso | Criticidad | Historia afectada |
|---|---|---|---|
| 8 | Race condition del worker — doble ejecución de Tarea | Alta | E3-S3 |
| 6 | R2 falla mid-export — Aprobado sin PDF | Alta | E4-S9 |
| 7 | clerkUserId cambia — pérdida de todos los Expedientes | Alta | E1-S3, E8-S3 |
| 1 | Fallo mid-pipeline — estado IN_CURSO inconsistente | Media | E3-S3, E4-S2 |
| 4 | C-2 degrada todo — Borrador vacío sin indicador de calidad | Media | E4-S6 |
| 2 | Dos asesores sobre el mismo Expediente — 403 sin mensaje de oficina | Media | E2 (nueva) |
| 3 | Expediente sin datos suficientes — Investigador gasta 15 min en vano | Media | E4-S2 |
| 5 | Token de Clerk vence durante generación larga — UX del "volver" indefinida | Baja | E4-S2, E3-S4 |

---

*Reporte producido por Edge Case Hunter (BMAD) · método `bmad-review-edge-case-hunter` (exhaustivo, path-enumeration) · fuentes revisadas: PRD, UX, Arquitectura, Épicas e Historias · jun-2026. No editar los documentos de planeación — este reporte es lectura para el PM.*
