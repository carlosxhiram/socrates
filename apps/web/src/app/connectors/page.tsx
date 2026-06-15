/**
 * Connectors — catálogo de integraciones del despacho.
 * Muestra los conectores planificados en estado "Por conectar".
 * No llama a la API.
 */
import Link from "next/link";
import { ArrowLeft, Plug, Search, ShieldCheck, HardDrive, Cpu } from "lucide-react";
import { TopBar } from "@/components/oficina/TopBar";

// No necesita datos dinámicos, pero mantenemos el patrón del proyecto.
export const dynamic = "force-dynamic";

// ── Catálogo de conectores planificados ───────────────────────────────────────

const CONECTORES = [
  {
    id: "tavily",
    nombre: "Tavily",
    descripcion: "Búsqueda web en tiempo real para que los agentes investiguen prospectos sin salir de Sócrates.",
    icono: <Search className="h-5 w-5" />,
    categoria: "Búsqueda",
  },
  {
    id: "clerk",
    nombre: "Clerk",
    descripcion: "Autenticación e identidad del asesor. Gestión de sesiones, roles y permisos del despacho.",
    icono: <ShieldCheck className="h-5 w-5" />,
    categoria: "Identidad",
  },
  {
    id: "cloudflare-r2",
    nombre: "Cloudflare R2",
    descripcion: "Almacenamiento de archivos adjuntos, entregables en PDF y respaldos del despacho.",
    icono: <HardDrive className="h-5 w-5" />,
    categoria: "Archivos",
  },
  {
    id: "vercel-ai-gateway",
    nombre: "Vercel AI Gateway",
    descripcion: "Capa de inteligencia: enruta los modelos de lenguaje con logs, límites de gasto y caché unificados.",
    icono: <Cpu className="h-5 w-5" />,
    categoria: "Inteligencia",
  },
] as const;

export default function ConnectorsPage() {
  return (
    <>
      <TopBar />
      <Marco>
        {/* Botón de regreso */}
        <Regreso />

        {/* Encabezado de la página */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-oficina-texto">
              Connectors
            </h1>
            <p className="mt-1 text-sm text-oficina-tenue">
              Integraciones que potencian a tu equipo de agentes.
            </p>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-oficina-borde bg-oficina-fondo px-3 py-1 text-xs font-medium text-oficina-tenue">
            <Plug className="h-3.5 w-3.5" />
            Próximamente
          </div>
        </div>

        {/* Grid de tarjetas de conectores */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CONECTORES.map((c) => (
            <TarjetaConector
              key={c.id}
              nombre={c.nombre}
              descripcion={c.descripcion}
              icono={c.icono}
              categoria={c.categoria}
            />
          ))}
        </div>

        {/* Nota de pie cálida */}
        <p className="mt-8 text-center text-xs text-oficina-tenue">
          ¿Usas una herramienta que no está aquí? Cuéntanos en el chat y la evaluamos.
        </p>
      </Marco>
    </>
  );
}

// ── Componentes internos ──────────────────────────────────────────────────────

/** Contenedor centrado idéntico al Marco de /oficina */
function Marco({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto min-h-screen max-w-[1400px] px-6 py-8">
      {children}
    </main>
  );
}

/** Enlace "Volver a la oficina" */
function Regreso() {
  return (
    <div className="mb-6">
      <Link
        href="/oficina"
        className="inline-flex items-center gap-1.5 text-sm text-oficina-tenue transition-colors hover:text-oficina-texto"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a la oficina
      </Link>
    </div>
  );
}

/** Tarjeta individual de conector (estado atenuado / por conectar) */
function TarjetaConector({
  nombre,
  descripcion,
  icono,
  categoria,
}: {
  nombre: string;
  descripcion: string;
  icono: React.ReactNode;
  categoria: string;
}) {
  return (
    <div className="flex flex-col rounded-xl border border-oficina-borde bg-oficina-panel p-5 opacity-70 transition-opacity hover:opacity-90">
      {/* Cabecera: icono + badge de categoría */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-oficina-fondo text-oficina-tenue">
          {icono}
        </div>
        <span className="rounded-full bg-oficina-fondo px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-oficina-tenue">
          {categoria}
        </span>
      </div>

      {/* Nombre y descripción */}
      <p className="mb-1 text-sm font-semibold text-oficina-texto">{nombre}</p>
      <p className="mb-4 flex-1 text-xs leading-relaxed text-oficina-tenue">
        {descripcion}
      </p>

      {/* Badge "Por conectar" */}
      <div className="mt-auto">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-oficina-borde px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-oficina-tenue">
          <span className="h-1.5 w-1.5 rounded-full bg-oficina-tenue" />
          Por conectar
        </span>
      </div>
    </div>
  );
}
