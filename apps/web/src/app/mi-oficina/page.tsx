/**
 * Mi Oficina — perfil del asesor, resumen de actividad y ajustes rápidos.
 * Server Component async con datos reales del seed.
 */
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Building2,
  CreditCard,
  Settings,
  Bell,
  Globe,
  Sun,
  Briefcase,
  Users,
  ClipboardCheck,
} from "lucide-react";
import { TopBar } from "@/components/oficina/TopBar";
import { obtenerExpedientes, obtenerEquipo, apiViva } from "@/lib/api-client";
import type { ExpedienteResumenDTO, EmpleadoEstadoDTO } from "@socrates/shared";

export const dynamic = "force-dynamic";

// ── Página principal ─────────────────────────────────────────────────────────

export default async function MiOficinaPage() {
  /* Verificar que la API responde antes de pedir datos */
  const viva = await apiViva();

  let expedientes: ExpedienteResumenDTO[] = [];
  let equipo: EmpleadoEstadoDTO[] = [];
  let apiCaida = false;

  if (!viva) {
    apiCaida = true;
  } else {
    [expedientes, equipo] = await Promise.all([
      obtenerExpedientes().catch(() => []),
      obtenerEquipo().catch(() => []),
    ]);
  }

  return (
    <>
      <TopBar />
      <Marco>
        {/* Botón de regreso */}
        <Regreso />

        <h1 className="mb-8 text-xl font-semibold tracking-tight text-oficina-texto">
          Mi Oficina
        </h1>

        <div className="space-y-8">
          {/* ── Sección A: Cuenta y despacho ───────────────────────────── */}
          <SeccionCuenta />

          {/* ── Sección B: Resumen de actividad ────────────────────────── */}
          <SeccionActividad
            expedientes={expedientes}
            equipo={equipo}
            apiCaida={apiCaida}
          />
        </div>
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

/** Sección A — Tu cuenta y tu despacho */
function SeccionCuenta() {
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-oficina-tenue">
        Tu cuenta y tu despacho
      </h2>

      <div className="rounded-xl border border-oficina-borde bg-oficina-panel p-6">
        {/* Identidad del asesor */}
        <div className="mb-6 flex items-start gap-4">
          {/* Avatar con inicial */}
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-marca/10 text-lg font-bold text-marca">
            C
          </div>
          <div>
            {/* TODO: leer del asesor autenticado / Clerk */}
            <p className="text-base font-semibold text-oficina-texto">
              Carlos Hiram Chávez
            </p>
            <p className="text-sm text-oficina-tenue">
              carloshiramchavez@icloud.com
            </p>
          </div>
        </div>

        {/* Filas de datos del despacho */}
        <div className="divide-y divide-oficina-borde rounded-lg border border-oficina-borde">
          <FilaDato
            icono={<Building2 className="h-4 w-4" />}
            etiqueta="Despacho"
            valor="SOC · TALENT"
          />
          <FilaDato
            icono={<CreditCard className="h-4 w-4" />}
            etiqueta="Plan"
            valor="Plan: Despacho"
          />
          <FilaDato
            icono={<User className="h-4 w-4" />}
            etiqueta="Rol"
            valor="Asesor principal"
          />
        </div>

        {/* Ajustes placeholder */}
        <div className="mt-6">
          <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-oficina-tenue">
            <Settings className="h-3.5 w-3.5" />
            Ajustes
          </p>
          <div className="space-y-2">
            <AjusteDeshabilitado
              icono={<Bell className="h-4 w-4" />}
              etiqueta="Notificaciones"
              nota="Próximamente"
            />
            <AjusteDeshabilitado
              icono={<Globe className="h-4 w-4" />}
              etiqueta="Idioma"
              nota="Español (MX)"
            />
            <AjusteDeshabilitado
              icono={<Sun className="h-4 w-4" />}
              etiqueta="Tema"
              nota="Se ajusta desde la barra superior"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/** Fila de dato dentro de la tarjeta de cuenta */
function FilaDato({
  icono,
  etiqueta,
  valor,
}: {
  icono: React.ReactNode;
  etiqueta: string;
  valor: string;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="flex items-center gap-2 text-sm text-oficina-tenue">
        {icono}
        {etiqueta}
      </span>
      <span className="text-sm font-medium text-oficina-texto">{valor}</span>
    </div>
  );
}

/** Fila de ajuste deshabilitada / placeholder */
function AjusteDeshabilitado({
  icono,
  etiqueta,
  nota,
}: {
  icono: React.ReactNode;
  etiqueta: string;
  nota: string;
}) {
  return (
    <div className="flex cursor-default items-center justify-between rounded-lg border border-oficina-borde px-4 py-3 opacity-60">
      <span className="flex items-center gap-2 text-sm text-oficina-texto">
        {icono}
        {etiqueta}
      </span>
      <span className="text-xs text-oficina-tenue">{nota}</span>
    </div>
  );
}

// ── Sección B — Resumen de actividad ─────────────────────────────────────────

interface SeccionActividadProps {
  expedientes: ExpedienteResumenDTO[];
  equipo: EmpleadoEstadoDTO[];
  apiCaida: boolean;
}

function SeccionActividad({
  expedientes,
  equipo,
  apiCaida,
}: SeccionActividadProps) {
  /* Métricas derivadas */
  const expedientesActivos = expedientes.length;
  const miembrosActivos = equipo.filter((m) => m.estado === "TRABAJANDO").length;
  const entregablesPendientes = expedientes.reduce(
    (acc, e) => acc + e.entregablesEsperandoRevision,
    0,
  );

  /* Últimos 4 expedientes */
  const recientes = expedientes.slice(0, 4);

  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-oficina-tenue">
        Resumen de tu actividad
      </h2>

      {apiCaida ? (
        <AvisoApiCaida />
      ) : (
        <div className="space-y-4">
          {/* Tarjetas métricas */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <TarjetaMetrica
              icono={<Briefcase className="h-5 w-5 text-marca" />}
              valor={expedientesActivos}
              etiqueta="Expedientes activos"
            />
            <TarjetaMetrica
              icono={<Users className="h-5 w-5 text-estado-trabajando" />}
              valor={miembrosActivos}
              etiqueta="Miembros del equipo trabajando"
            />
            <TarjetaMetrica
              icono={<ClipboardCheck className="h-5 w-5 text-estado-alerta" />}
              valor={entregablesPendientes}
              etiqueta="Entregables esperando tu revisión"
            />
          </div>

          {/* Lista corta de expedientes recientes */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-oficina-tenue">
              Últimos expedientes
            </p>
            {recientes.length === 0 ? (
              <EstadoVacio />
            ) : (
              <div className="divide-y divide-oficina-borde overflow-hidden rounded-xl border border-oficina-borde bg-oficina-panel">
                {recientes.map((e) => (
                  <FilaExpediente key={e.id} expediente={e} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

/** Tarjeta métrica numérica */
function TarjetaMetrica({
  icono,
  valor,
  etiqueta,
}: {
  icono: React.ReactNode;
  valor: number;
  etiqueta: string;
}) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-oficina-borde bg-oficina-panel p-5">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-oficina-fondo">
        {icono}
      </div>
      <div>
        <p className="text-2xl font-bold tabular-nums text-oficina-texto">
          {valor}
        </p>
        <p className="text-xs text-oficina-tenue">{etiqueta}</p>
      </div>
    </div>
  );
}

/** Fila de expediente en la lista de recientes */
function FilaExpediente({ expediente }: { expediente: ExpedienteResumenDTO }) {
  return (
    <Link
      href={`/expedientes/${expediente.id}`}
      className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-oficina-fondo"
    >
      <div>
        <p className="text-sm font-medium text-oficina-texto">
          {expediente.empresa}
        </p>
        <p className="text-xs text-oficina-tenue">
          {expediente.ciudad} · {expediente.industria}
        </p>
      </div>
      <span className="text-xs text-oficina-tenue">{expediente.etapa}</span>
    </Link>
  );
}

/** Estado vacío cálido */
function EstadoVacio() {
  return (
    <div className="rounded-xl border border-dashed border-oficina-borde bg-oficina-panel p-8 text-center">
      <p className="text-sm text-oficina-tenue">
        Aún no hay expedientes en tu despacho. Vuelve a la oficina para abrir el primero.
      </p>
    </div>
  );
}

/** Aviso cálido cuando la API no responde */
function AvisoApiCaida() {
  return (
    <div className="rounded-xl border border-estado-alerta/30 bg-estado-alerta/5 p-8 text-center">
      <p className="text-sm text-oficina-texto">
        Ahora mismo no puedo conectarme con tu despacho. Confirma que el servicio
        de la oficina esté encendido (apps/api) y recarga la página.
      </p>
    </div>
  );
}
