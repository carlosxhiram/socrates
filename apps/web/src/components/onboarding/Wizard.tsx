"use client";
/**
 * Wizard — el recibimiento de Sócrates en 3 pasos.
 *
 *   1. Tu oficina   — datos mínimos (Server Action guardarPerfilAction).
 *   2. Tu prueba     — Checkout de Stripe (iniciarPruebaAction → redirección).
 *   3. Conoce a tu equipo — Sócrates te presenta a los 6 y explica la dinámica.
 *
 * Entre el 2 y el 3 hay un estado "confirmando": al volver de Stripe esperamos a
 * que la suscripción quede activa (la abre el webhook firmado, no el navegador).
 * El paso visible se deriva de `siguientePaso` (servidor) + el query ?paso.
 */
import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  MapPin,
  Tag,
  ShieldCheck,
  Check,
  ArrowRight,
  Loader2,
  Search,
  FileSearch,
  Landmark,
  Handshake,
  FileCheck,
  Briefcase,
  type LucideIcon,
} from "lucide-react";
import type { YoDTO, EmpleadoEstadoDTO } from "@socrates/shared";
import {
  guardarPerfilAction,
  iniciarPruebaAction,
  completarBienvenidaAction,
  estadoAction,
  type ResultadoPerfil,
} from "@/app/acciones/onboarding";

type Paso = "perfil" | "pago" | "confirmando" | "bienvenida";

const PRECIO = "$499 MXN/mes";
const DIAS_PRUEBA = 14;

const ICONOS_EMPLEADO: Record<string, LucideIcon> = {
  search: Search,
  "file-search": FileSearch,
  landmark: Landmark,
  handshake: Handshake,
  "file-check": FileCheck,
  briefcase: Briefcase,
};

function pasoDesdeSiguiente(s: YoDTO["siguientePaso"]): Paso {
  if (s === "perfil" || s === "pago" || s === "bienvenida") return s;
  return "bienvenida"; // "completo": el server ya debió redirigir; salvaguarda.
}

export function Wizard({
  yoInicial,
  equipo,
  pasoQuery,
}: {
  yoInicial: YoDTO;
  equipo: EmpleadoEstadoDTO[];
  pasoQuery: string | null;
}) {
  const router = useRouter();
  const [paso, setPaso] = useState<Paso>(
    pasoQuery === "confirmando" ? "confirmando" : pasoDesdeSiguiente(yoInicial.siguientePaso),
  );

  const indice = paso === "perfil" ? 0 : paso === "bienvenida" ? 2 : 1;

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col px-5 py-10">
      {/* Encabezado: Sócrates recibe */}
      <header className="mb-8 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-marca/10 text-2xl" aria-hidden>
          🐢
        </span>
        <div>
          <p className="text-sm font-medium text-marca">Sócrates</p>
          <h1 className="text-lg font-semibold tracking-tight text-oficina-texto">
            Bienvenido. Vamos a preparar tu oficina.
          </h1>
        </div>
      </header>

      <Indicador indice={indice} />

      <div className="mt-8 flex-1">
        {paso === "perfil" && <PasoPerfil yo={yoInicial} alAvanzar={() => setPaso("pago")} />}
        {paso === "pago" && <PasoPago />}
        {paso === "confirmando" && (
          <PasoConfirmando
            alConfirmar={() => setPaso("bienvenida")}
            alCompletar={() => router.push("/oficina")}
          />
        )}
        {paso === "bienvenida" && (
          <PasoBienvenida yo={yoInicial} equipo={equipo} />
        )}
      </div>
    </div>
  );
}

// ── Indicador de pasos ────────────────────────────────────────────────────────
function Indicador({ indice }: { indice: number }) {
  const pasos = ["Tu oficina", "Tu prueba", "Conoce a tu equipo"];
  return (
    <ol className="flex items-center gap-2" aria-label="Progreso del recibimiento">
      {pasos.map((titulo, i) => {
        const hecho = i < indice;
        const activo = i === indice;
        return (
          <li key={titulo} className="flex flex-1 items-center gap-2">
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                hecho
                  ? "bg-marca text-white"
                  : activo
                    ? "bg-marca/15 text-marca ring-2 ring-marca/40"
                    : "bg-oficina-borde text-oficina-tenue"
              }`}
            >
              {hecho ? <Check size={14} aria-hidden /> : i + 1}
            </span>
            <span
              className={`hidden text-xs font-medium sm:inline ${
                activo ? "text-oficina-texto" : "text-oficina-tenue"
              }`}
            >
              {titulo}
            </span>
            {i < pasos.length - 1 && <span className="h-px flex-1 bg-oficina-borde" />}
          </li>
        );
      })}
    </ol>
  );
}

// ── Paso 1: Tu oficina ──────────────────────────────────────────────────────
function PasoPerfil({ yo, alAvanzar }: { yo: YoDTO; alAvanzar: () => void }) {
  const [estado, accion, pendiente] = useActionState<ResultadoPerfil | null, FormData>(
    guardarPerfilAction,
    null,
  );

  useEffect(() => {
    if (estado?.ok) alAvanzar();
  }, [estado, alAvanzar]);

  return (
    <section className="rounded-2xl border border-oficina-borde bg-oficina-panel p-6 shadow-sm">
      <h2 className="text-base font-semibold text-oficina-texto">Cuéntame de tu oficina</h2>
      <p className="mt-1 text-sm text-oficina-tenue">
        Con esto personalizo tu espacio y el trabajo del equipo. Toma 20 segundos.
      </p>

      <form action={accion} className="mt-5 space-y-4">
        <Campo
          icono={Building2}
          nombre="nombreOficina"
          etiqueta="Nombre de tu oficina"
          placeholder="p. ej. SOC | TALENT"
          defecto={yo.perfil.nombreOficina}
        />
        <Campo
          icono={MapPin}
          nombre="zona"
          etiqueta="Zona donde operas"
          placeholder="p. ej. Zona Norte (Monterrey)"
          defecto={yo.perfil.zona}
        />
        <Campo
          icono={Tag}
          nombre="especialidad"
          etiqueta="Tu especialidad"
          placeholder="p. ej. Crédito empresarial PYME"
          defecto={yo.perfil.especialidad}
        />

        {estado?.error && (
          <p className="text-sm text-estado-bloqueo" role="alert">
            {estado.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pendiente}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-marca px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-marca-fuerte disabled:opacity-60"
        >
          {pendiente ? <Loader2 size={16} className="animate-spin" aria-hidden /> : null}
          Continuar
          {!pendiente && <ArrowRight size={16} aria-hidden />}
        </button>
      </form>
    </section>
  );
}

function Campo({
  icono: Icono,
  nombre,
  etiqueta,
  placeholder,
  defecto,
}: {
  icono: LucideIcon;
  nombre: string;
  etiqueta: string;
  placeholder: string;
  defecto: string | null;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-oficina-tenue">{etiqueta}</span>
      <span className="flex items-center gap-2 rounded-xl border border-oficina-borde bg-oficina-fondo px-3 py-2.5 focus-within:border-marca focus-within:ring-1 focus-within:ring-marca/30">
        <Icono size={16} className="shrink-0 text-oficina-tenue" aria-hidden />
        <input
          type="text"
          name={nombre}
          required
          defaultValue={defecto ?? ""}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-oficina-texto outline-none placeholder:text-oficina-tenue"
        />
      </span>
    </label>
  );
}

// ── Paso 2: Tu prueba ─────────────────────────────────────────────────────────
function PasoPago() {
  const [iniciando, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function iniciar() {
    setError(null);
    startTransition(async () => {
      try {
        const { url } = await iniciarPruebaAction();
        window.location.href = url;
      } catch {
        setError("No pude abrir el cobro. Inténtalo de nuevo en un momento.");
      }
    });
  }

  const incluye = [
    "Tu equipo de 6 especialistas, listo para trabajar",
    "Reportes de Inteligencia Financiera a la medida",
    "Recomendaciones amarradas al catálogo real de SOC",
    "Revisión humana antes de cada entrega",
  ];

  return (
    <section className="rounded-2xl border border-oficina-borde bg-oficina-panel p-6 shadow-sm">
      <h2 className="text-base font-semibold text-oficina-texto">Empieza tu prueba gratis</h2>
      <p className="mt-1 text-sm text-oficina-tenue">
        {DIAS_PRUEBA} días gratis. Tu tarjeta no se cobra durante la prueba.
      </p>

      <div className="mt-5 rounded-xl border border-marca/20 bg-marca/5 p-5">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-oficina-texto">{PRECIO}</span>
          <span className="text-sm text-oficina-tenue">después de la prueba</span>
        </div>
        <ul className="mt-4 space-y-2">
          {incluye.map((linea) => (
            <li key={linea} className="flex items-start gap-2 text-sm text-oficina-texto">
              <Check size={16} className="mt-0.5 shrink-0 text-estado-entrego" aria-hidden />
              {linea}
            </li>
          ))}
        </ul>
      </div>

      {error && (
        <p className="mt-4 text-sm text-estado-bloqueo" role="alert">
          {error}
        </p>
      )}

      <button
        onClick={iniciar}
        disabled={iniciando}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-marca px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-marca-fuerte disabled:opacity-60"
      >
        {iniciando ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <ShieldCheck size={16} aria-hidden />}
        Iniciar prueba gratis
      </button>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-oficina-tenue">
        <ShieldCheck size={13} aria-hidden /> Pago seguro con Stripe
      </p>
    </section>
  );
}

// ── Estado intermedio: confirmando (esperando la confirmación firmada) ────────
function PasoConfirmando({
  alConfirmar,
  alCompletar,
}: {
  alConfirmar: () => void;
  alCompletar: () => void;
}) {
  const [demorado, setDemorado] = useState(false);
  const intentos = useRef(0);

  useEffect(() => {
    let cancelado = false;
    let timer: ReturnType<typeof setTimeout>;

    const sondear = async () => {
      if (cancelado) return;
      intentos.current += 1;
      try {
        const yo = await estadoAction();
        if (cancelado) return;
        if (yo.siguientePaso === "completo") return alCompletar();
        if (yo.siguientePaso === "bienvenida") return alConfirmar();
      } catch {
        // reintentamos
      }
      if (intentos.current >= 12) {
        setDemorado(true);
        return;
      }
      timer = setTimeout(sondear, 2500);
    };

    timer = setTimeout(sondear, 700);
    return () => {
      cancelado = true;
      clearTimeout(timer);
    };
  }, [alConfirmar, alCompletar]);

  return (
    <section className="rounded-2xl border border-oficina-borde bg-oficina-panel p-8 text-center shadow-sm">
      {!demorado ? (
        <>
          <Loader2 size={28} className="mx-auto animate-spin text-marca" aria-hidden />
          <h2 className="mt-4 text-base font-semibold text-oficina-texto">
            Estamos confirmando tu prueba…
          </h2>
          <p className="mt-1 text-sm text-oficina-tenue">
            Un momento: validamos el cobro de forma segura antes de abrir tu oficina.
          </p>
        </>
      ) : (
        <>
          <span className="text-2xl" aria-hidden>
            🐢
          </span>
          <h2 className="mt-3 text-base font-semibold text-oficina-texto">
            Está tardando un poco más de lo normal
          </h2>
          <p className="mt-1 text-sm text-oficina-tenue">
            Si ya pusiste tu tarjeta, dame un momento o vuelve a cargar esta página.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-marca px-4 py-2 text-sm font-medium text-white hover:bg-marca-fuerte"
          >
            Volver a cargar
          </button>
        </>
      )}
    </section>
  );
}

// ── Paso 3: Conoce a tu equipo ────────────────────────────────────────────────
function PasoBienvenida({ yo, equipo }: { yo: YoDTO; equipo: EmpleadoEstadoDTO[] }) {
  const router = useRouter();
  const [entrando, startTransition] = useTransition();
  const especialistas = equipo.filter((e) => e.rol !== "SOCRATES");

  function entrar() {
    startTransition(async () => {
      try {
        await completarBienvenidaAction();
      } catch {
        // aunque falle el marcado, el portero re-evaluará el acceso.
      }
      router.push("/oficina");
    });
  }

  const nombre = yo.perfil.nombreOficina?.trim();

  return (
    <section className="rounded-2xl border border-oficina-borde bg-oficina-panel p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="text-2xl" aria-hidden>
          🐢
        </span>
        <div>
          <h2 className="text-base font-semibold text-oficina-texto">
            {nombre ? `Todo listo, ${nombre}.` : "Todo listo."} Este es tu equipo.
          </h2>
          <p className="mt-1 text-sm text-oficina-tenue">
            Aquí tú eres el dueño y yo, tu gerente. Me dices qué necesitas{" "}
            <span className="text-oficina-texto">en tus propias palabras</span> y yo reparto el
            trabajo entre ellos. Así de fácil.
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {especialistas.map((emp) => {
          const Icono = ICONOS_EMPLEADO[emp.icono] ?? Briefcase;
          return (
            <div
              key={emp.rol}
              className="flex items-start gap-3 rounded-xl border border-oficina-borde bg-oficina-fondo p-3"
            >
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-marca/10 text-marca">
                <Icono size={18} aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-oficina-texto">{emp.nombre}</p>
                <p className="mt-0.5 text-xs text-oficina-tenue">{emp.descripcion}</p>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={entrar}
        disabled={entrando}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-marca px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-marca-fuerte disabled:opacity-60"
      >
        {entrando ? <Loader2 size={16} className="animate-spin" aria-hidden /> : null}
        Entrar a mi oficina
        {!entrando && <ArrowRight size={16} aria-hidden />}
      </button>
    </section>
  );
}
