# Capacidades de deploy — qué opera el Director directamente (2026-06-14)

Reconocimiento de CLIs/credenciales en la máquina de Carlos. Define qué puedo provisionar/desplegar yo y qué (si algo) necesita su mano.

| Plataforma | Estado | Qué puedo hacer yo | Pendiente de Carlos |
|---|---|---|---|
| **Vercel** | ✅ CLI logueado (`carlosxhiram`) | Desplegar frontend Next.js, crear proyecto, set env vars, **AI Gateway** | — |
| **Railway** | ✅ CLI logueado (Carlos Hiram Chavez) | Crear servicio API (Hono), provisionar **Postgres**, set env vars, deploy | — |
| **Clerk** | ✅ CLI autenticado | Crear app de auth de Sócrates, sacar publishable/secret keys | — |
| **Cloudflare R2** | ✅ wrangler logueado · Account ID `e8fdf035714a41e687c81d65549301d6` | Crear/gestionar bucket (`socrates-entregables`); R2 confirmado funcionando | Solo el **token S3 de runtime** (Access Key/Secret) = 1 paso de dashboard en deploy (o lo intento por API) |
| **IA (modelo)** | vía **Vercel AI Gateway** (cuenta Vercel de Carlos) | Configurar el gateway y los modelos Claude yo mismo | — |
| **Tavily** (búsqueda) | ❌ sin cuenta | — | **1 API key** (signup). Dev corre con fallback mientras tanto |

## Conclusión
La dependencia de la mañana se reduce a, prácticamente, **una sola llave: Tavily** (y aun esa tiene fallback en dev). Todo lo demás —Vercel, Railway, Clerk, R2 (bucket), AI Gateway— lo provisiono y despliego yo en la fase de deploy (Etapa 3), sin interrumpir a Carlos.

## Notas
- El token S3 de R2 (Access Key/Secret) para que el backend lea/escriba PDFs: wrangler gestiona buckets pero no acuña tokens S3; en deploy lo resuelvo (dashboard 1 min o API de Cloudflare). No es bloqueante hasta el deploy.
- Nada se provisiona aún: el build (Etapa 2) sigue su curso; deploy hasta tener todo corriendo y el PoC verde.
