---
title: "Brief de Producto: Sócrates — la plataforma de SOC | TALENT"
status: draft
created: 2026-06-14
updated: 2026-06-14
analyst: Mary (BMAD)
aprobado_por: Carlos (vía Director/Opus, pre-aprobación total)
source: SIM data-room v0.2 (docs/sim-handoff/)
---

# Brief de Producto: Sócrates

## Resumen ejecutivo

**Sócrates** es la oficina virtual con cerebro para el asesor financiero de SOC. El asesor abre Sócrates, le habla en su idioma a un gerente (la tortuga **Sócrates**, mascota de SOC), y un equipo de seis empleados de IA —Prospector, Investigador, Asesor, Negociador, Tramitador y Gestor— acciona por él a lo largo de todo su flujo de trabajo: prospectar, investigar, recomendar el producto correcto, acercarse, tramitar y cerrar. No es un chat ni un dashboard: es **tener un equipo que hace lo que el asesor debería estar haciendo**, a un precio imposible de igualar contratando.

El corazón ya está probado en campo: el **Investigador** genera Reportes de Inteligencia Financiera a la medida de cada prospecto —estudia su negocio mejor que él mismo, con fuentes, y amarra cada hallazgo a un producto de una de las ~55 instituciones aliadas de SOC, con el argumento de cierre listo—. Carlos cerró sus mejores deals con dos de estos reportes hechos a mano (Las Aliadas, Probemedic). Sócrates convierte ese ritual manual en un sistema reproducible para toda la red.

Por qué ahora: la IA generativa maduró justo cuando la industria PYME sigue operando a mano, en reuniones de dos horas y memorización humana. Sócrates es el "picks y palas" de los ~2,000 asesores de SOC. Se construye como jugada de SOC | TALENT, gana tracción documentada, y se vende/renta a SOC Corporativo.

## El problema

El gap más grande de la industria no está en el cliente final — está en **los asesores**. La mayoría son "mids": carecen de skills de venta, hacen todo a mano, y las herramientas digitales de SOC (la oficina virtual SISEC) son manuales y sin cerebro. Para aprender los productos de cada institución, SOC sigue convocando reuniones presenciales de +2 horas; se espera que el humano "se aprenda" decenas de presentaciones. El resultado: el asesor llega a sus citas sin preparar, depende del experto de la institución, y deja dinero en la mesa.

## La solución

**Sócrates** — el asesor dirige, su equipo ejecuta. La experiencia es la de un dueño que entra a su oficina y ve a su gente trabajar:
- Le habla a **Sócrates** (el gerente) en lenguaje natural; Sócrates planifica, delega y reporta.
- Seis **empleados** (puestos, no "IA") accionan: Prospector, Investigador, Asesor, Negociador, Tramitador, Gestor.
- Todo organizado por **expedientes**: cada prospecto/cliente es una carpeta con su progreso visible, qué empleados trabajan en él, y sus entregables.

## Qué lo hace diferente

- **No es chat ni dashboard** — es una oficina con empleados. El lenguaje es de trabajo ("el investigador entregó"), nunca de IA.
- **El foso es la capa de síntesis**: investigación → catálogo propietario de 55 instituciones SOC → recomendación de financiamiento accionable y vendible. Ninguna herramienta de sales-intelligence genérica lo hace, porque requiere el catálogo que solo SOC tiene.
- **Ventaja de adentro + tracción**: Carlos es Director Comercial; tiene distribución, datos y el dolor real. La carrera es productizar y acumular casos antes de que el reporte manual sea commodity.

## A quién sirve

- **Usuario primario:** el asesor de SOC | TALENT (crédito empresarial PYME).
- **Design partner / primer usuario:** Carlos.
- **Piloto v1:** 3-5 asesores de SOC | TALENT en Monterrey. Expansión posterior a la red SOC y, vía exit, al corporativo.
- **Éxito para el asesor:** llega a cada cita siendo el más preparado, cierra más, y deja de hacer a mano lo que un equipo hace por él.

## Criterios de éxito

- **Estrella polar:** créditos colocados atribuidos a Sócrates (dinero/comisión).
- **Indicadores guía (v1):** reportes de inteligencia generados y llevados a cita por semana · asesores activos por semana · horas ahorradas por expediente · # de expedientes que avanzan de etapa.
- **Señal de tracción para el exit:** casos de éxito documentados con asesores reales.

## Alcance (v1)

**Dentro:** los 6 empleados + Sócrates; expedientes con progreso; el Investigador generando reportes reales; auth (Clerk); storage de entregables (Cloudflare R2); backend (Railway) + frontend (Vercel); catálogo SOC curado (subconjunto inicial).

**Fuera (a propósito, por ahora):** facturación/cobros; onboarding multi-tenant a gran escala (más allá del piloto); integración directa con SISEC; el catálogo completo de las 55 instituciones; prospección automática a escala (el asesor trae sus prospectos en v1).

## Visión

Sócrates se vuelve la **infraestructura de talento de la fuerza de ventas financiera de LATAM**: empieza en SOC | TALENT, se prueba con tracción real, se vende/licencia a SOC Corporativo (~2,000 asesores), y el patrón —un equipo de agentes por cada vendedor de una red de distribución financiera— se replica a cualquier bróker, aseguradora o franquicia del continente.
