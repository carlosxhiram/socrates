/**
 * Billing — facturación y plan del despacho.
 * Pantalla "Próximamente" mientras se integra el sistema de pagos.
 * No llama a la API.
 */
import Link from "next/link";
import { ArrowLeft, CreditCard, ShieldCheck, FileText, Zap } from "lucide-react";
import { TopBar } from "@/components/oficina/TopBar";

// No necesita datos dinámicos, pero mantenemos el patrón del proyecto.
export const dynamic = "force-dynamic";

export default function BillingPage() {
  return (
    <>
      <TopBar />
      <Marco>
        {/* Botón de regreso */}
        <Regreso />

        <h1 className="mb-8 text-xl font-semibold tracking-tight text-oficina-texto">
          Billing
        </h1>

        {/* Tarjeta principal "Próximamente" */}
        <div className="rounded-xl border border-oficina-borde bg-oficina-panel p-8">
          <div className="mx-auto max-w-lg text-center">
            {/* Icono decorativo */}
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-marca/10">
              <CreditCard className="h-7 w-7 text-marca" />
            </div>

            <h2 className="mb-2 text-lg font-semibold text-oficina-texto">
              Facturación y plan del despacho
            </h2>
            <p className="mb-6 text-sm leading-relaxed text-oficina-tenue">
              Aquí vivirá todo lo relacionado con el plan de suscripción de tu
              despacho: tu plan actual, el historial de facturas, los métodos de
              pago y las opciones para actualizar o cancelar. Lo estamos
              construyendo para que sea simple, claro y sin sorpresas.
            </p>

            {/* Badge "Próximamente" */}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-oficina-borde bg-oficina-fondo px-3 py-1 text-xs font-medium text-oficina-tenue">
              <span className="h-1.5 w-1.5 rounded-full bg-estado-alerta" />
              Próximamente
            </span>
          </div>

          {/* Características que vendrán */}
          <div className="mt-10 grid grid-cols-1 gap-4 border-t border-oficina-borde pt-8 sm:grid-cols-3">
            <CaracteristicaFutura
              icono={<ShieldCheck className="h-5 w-5 text-estado-entrego" />}
              titulo="Pagos seguros"
              descripcion="Integración con Stripe. Sin guardar datos de tarjeta en nuestros servidores."
            />
            <CaracteristicaFutura
              icono={<FileText className="h-5 w-5 text-marca" />}
              titulo="Facturas automáticas"
              descripcion="Recibe tu comprobante de pago por correo cada mes, listo para contabilidad."
            />
            <CaracteristicaFutura
              icono={<Zap className="h-5 w-5 text-estado-alerta" />}
              titulo="Planes flexibles"
              descripcion="Elige el plan que le va a tu despacho: desde un solo asesor hasta equipos grandes."
            />
          </div>
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

/** Tarjeta de característica futura */
function CaracteristicaFutura({
  icono,
  titulo,
  descripcion,
}: {
  icono: React.ReactNode;
  titulo: string;
  descripcion: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-oficina-fondo">
        {icono}
      </div>
      <div>
        <p className="text-sm font-medium text-oficina-texto">{titulo}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-oficina-tenue">
          {descripcion}
        </p>
      </div>
    </div>
  );
}
