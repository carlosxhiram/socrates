# Diseño — Cada oficina renombra a su equipo

**Fecha:** 2026-07-16 · **Estado:** aprobado (diseño), pendiente de plan de implementación

## El problema en una frase

La landing promete *"a cada especialista puedes nombrarlo como tú quieras"*, pero
el producto no lo cumple: los 6 empleados tienen nombres de puesto fijos ("El
Prospector"…), iguales para todas las oficinas. Esta feature cumple esa promesa:
cada oficina (asesor) le pone un **nombre propio** a cada uno de sus 6 empleados,
y ese nombre se usa en todo el producto.

## Decisiones tomadas (con Carlos, 2026-07-16)

1. **Alcance:** solo los **6 empleados del panel** (Prospector, Investigador,
   Asesor de Producto, Negociador, Tramitador, Gestor). El **gerente** —hoy en el
   código bajo el rol `SOCRATES`— **no se renombra**: es la cara constante del
   producto en todas las oficinas. (Sobre su nombre correcto, ver §"Trabajo
   relacionado pero separado".)
2. **Presentación:** el **nombre propio manda** como identidad; el **puesto**
   queda como **cargo** (subtítulo), igual que una credencial de empleado.
3. **Dónde se edita:** en el **onboarding** (paso "Conoce a tu equipo", opcional
   —se puede saltar) y **siempre** desde el **Panel de Equipo** (un lápiz por
   tarjeta).
4. **Por defecto (de fábrica):** los nombres que hoy solo viven en la landing —
   **Diego, Hiram, Jair, Katya, María, Paula** — se vuelven la identidad de
   fábrica del producto, desde una **fuente única** que landing y producto
   comparten. Una oficina que no personaliza ve esos nombres.
5. **Qué se personaliza:** **solo el nombre**. La carita/ícono de cada empleado
   queda **fija según su función** (como hoy). Sin avatares en esta versión.

## Mapa de fábrica (nombre ↔ rol ↔ cargo)

| Rol (interno) | Nombre de fábrica | Cargo mostrado | Ícono (lucide) |
|---|---|---|---|
| `PROSPECTOR` | Diego | Prospector | Search |
| `INVESTIGADOR` | Hiram | Investigador | FileSearch |
| `ASESOR_PRODUCTO` | Jair | Asesor de Producto | Landmark |
| `NEGOCIADOR` | Katya | Negociadora | Handshake |
| `TRAMITADOR` | María | Trámites | FileCheck |
| `GESTOR` | Paula | Gestora | Briefcase |

## Arquitectura

### 1. Directorio maestro único
Hoy los 6 nombres propios están hardcodeados y duplicados en 6 archivos de
`apps/web/src/components/landing/`, y el producto no los conoce (usa el `nombre`
de puesto de `packages/shared/src/glosario.ts`). Se unifica: **el glosario
(`@socrates/shared`) es la fuente única**. Cada empleado gana un
`nombrePorDefecto` (Diego…) y conserva su `cargo` (el puesto) y su `icono`. La
landing y el producto leen de ahí; se elimina la duplicación de la landing.

- *Cuidado de nombres:* el identificador local `EMPLEADOS` de
  `landing/SeccionEquipo.tsx` es homónimo pero distinto del `EMPLEADOS` canónico
  de `@socrates/shared`. Al unificar, la landing debe importar el canónico y se
  retira su array local (y las copias en `variantes/*`).

### 2. Persistencia por oficina
La personalización se guarda en la identidad que ya existe: el modelo `Asesor`
(1 `clerkUserId` = 1 oficina). Se añade un campo **`nombresEquipo Json?`** con la
forma `{ [rol]: string }`, guardando **solo los roles que la oficina cambió**
(los demás heredan el de fábrica). Se valida con zod (roles válidos =
`ROLES_PANEL`; nombre 1–40 caracteres, trim, sin vacío). Se prefiere un campo
JSON sobre una tabla nueva porque son exactamente 6 entradas acotadas, se editan
como conjunto, y reutiliza el patrón de "editar el perfil del Asesor". No toca el
catálogo ni las compuertas C-1/C-2/C-3.

### 3. Resolución (un solo helper)
Un helper en `@socrates/shared`, p. ej.
`nombreEmpleado(rol, nombresEquipo?) => nombresEquipo?.[rol] ?? EMPLEADOS[rol].nombrePorDefecto`.
**Todos** los puntos que hoy muestran un empleado pasan por este helper con los
`nombresEquipo` del asesor en contexto. Regla de oro: ningún componente vuelve a
leer un nombre "a mano".

### 4. API
- **Lectura:** el asesor en sesión ya se resuelve por `clerkUserId`; `GET /yo`
  (o el endpoint que hidrata la sesión) devuelve `nombresEquipo`. `GET /empleados`
  aplica el helper para que el DTO ya traiga el nombre resuelto.
- **Escritura:** `PATCH /yo/equipo` (o extensión de `/yo/perfil`) que valida con
  zod y actualiza `Asesor.nombresEquipo`. Acepta cambios parciales (un rol a la
  vez o varios). Server Action equivalente para la UI web.

### 5. UI
- **Onboarding** (`Wizard.tsx`, PasoBienvenida "Conoce a tu equipo"): cada
  empleado muestra su nombre de fábrica en un campo editable; el asesor los cambia
  o pulsa "Así está bien" para continuar. Es opcional; no bloquea el onboarding.
- **Panel de Equipo** (`components/oficina/PanelEquipo.tsx`): cada tarjeta gana un
  lápiz → edición inline (o modal breve) del nombre. Guardar = `PATCH` +
  `revalidate`.
- **Presentación** en toda tarjeta: nombre propio (grande) + cargo (pequeño).
  Cuando no hay nombre propio, se muestra el cargo como identidad (sin duplicar).

## Qué se refleja automáticamente
Al pasar todo por el helper, el nombre personalizado aparece en: Panel de Equipo,
chips de empleados en `TarjetaExpediente`, nombre junto a cada Tarea y Entregable
en la página de expediente, y cualquier mención futura. **La landing pública NO**
se personaliza (no hay asesor en sesión): sigue mostrando los nombres de fábrica
como escaparate. Coherente: la landing es la vitrina; el producto es la oficina.

## Defaults y casos borde
- **Sin personalizar:** hereda el nombre de fábrica (Diego…).
- **Nombre vacío / solo espacios:** se rechaza (zod); no se puede "borrar" un
  nombre a vacío — para "revertir" se restaura el de fábrica (botón/acción de
  reset opcional; mínimo: reescribir el de fábrica).
- **Nombre duplicado entre empleados:** permitido (es decisión de la oficina); no
  se fuerza unicidad.
- **Rol desconocido en el JSON:** se ignora al resolver (defensa ante datos
  viejos).

## Testing
- Unitario del helper `nombreEmpleado` (con y sin override; rol ausente).
- Validación zod (límites de longitud, trim, roles inválidos rechazados).
- Integración del `PATCH` (persiste, parcial, tenencia: un asesor no toca a otro).
- Un flujo en vivo: renombrar en Panel → verlo reflejado en un expediente.

## Fuera de alcance (YAGNI en esta versión)
- Avatares/caritas personalizables (íconos fijos por rol).
- Renombrar al gerente.
- Nombres por-expediente o por-cliente (es por oficina).
- Multi-usuario dentro de una oficina (hoy 1 asesor = 1 oficina).

## Trabajo relacionado pero SEPARADO — gerente "Sócrates" ≠ marca "Socratia"
Hallazgo durante el diseño: el renombre legal reciente dejó al **gerente** con el
nombre **"Socratia"** de forma **deliberada** (comentarios en `glosario.ts`:
*"el nombre es la marca visible y por eso dice 'Socratia'"*), y así aparece en
~5 archivos del producto (`BarraComando`, `ConversacionSesion`, `ListaSesiones`,
`Wizard`, glosario). Carlos aclaró (2026-07-16) que **la marca es "Socratia" pero
el gerente se llama "Sócrates"** — son cosas distintas.

Corregirlo es un **fix aparte** (una rama/propósito propio), no parte de esta
feature, porque: (a) toca solo al gerente, no a los 6; (b) exige distinguir en
cada ocurrencia si "Socratia" es **marca** (se queda) o **gerente** (→ "Sócrates");
(c) debe **coordinarse con la sesión de renombre legal** que introdujo el nombre.
Pendiente de OK de Carlos para abrirlo por separado.
