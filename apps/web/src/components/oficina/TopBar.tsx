"use client";

/**
 * TopBar — barra superior global de Sócrates.
 * Incluye: marca + selector de espacio (dropdown), pills de estado,
 * enlaces externos (GitHub, Twitter, Email) y toggle claro/oscuro.
 */

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  ChevronDown,
  Github,
  Twitter,
  Mail,
  Sun,
  Moon,
} from "lucide-react";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface OpcionEspacio {
  label: string;
  href: string;
}

const ESPACIOS: OpcionEspacio[] = [
  { label: "Mi Oficina",  href: "/mi-oficina"  },
  { label: "Billing",     href: "/billing"     },
  { label: "Connectors",  href: "/connectors"  },
];

// ─── Componente principal ─────────────────────────────────────────────────────

export function TopBar({
  className,
  extra,
}: {
  className?: string;
  /** Acción opcional a la derecha (p. ej. "Nuevo expediente" en la Oficina). */
  extra?: React.ReactNode;
}) {
  return (
    <header
      className={[
        "flex w-full items-center justify-between",
        "border-b border-oficina-borde bg-oficina-panel",
        "px-6 py-3",
        className ?? "",
      ]
        .join(" ")
        .trim()}
    >
      {/* ── Lado izquierdo: marca + dropdown de espacio ── */}
      <div className="flex items-center gap-3">
        {/* Logotipo */}
        <span className="text-xl" aria-hidden>🐢</span>
        <span className="font-semibold tracking-tight text-oficina-texto">
          Sócrates
        </span>

        {/* Separador visual */}
        <span className="select-none text-oficina-borde">·</span>

        {/* Selector de espacio (dropdown) */}
        <SelectorEspacio />
      </div>

      {/* ── Lado derecho: acción + pills de estado + toggles ── */}
      <div className="flex items-center gap-2">
        {extra}

        {/* Pill operacional */}
        <PillOperacional />

        {/* Separador sutil */}
        <div className="mx-1 h-5 w-px bg-oficina-borde" aria-hidden />

        {/* Botones de enlaces externos */}
        <GrupoEnlaces />

        {/* Toggle claro/oscuro */}
        <ToggleTema />
      </div>
    </header>
  );
}

// ─── Selector de espacio (dropdown) ──────────────────────────────────────────

function SelectorEspacio() {
  const [abierto, setAbierto] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);

  // Cierra al hacer clic fuera del dropdown
  useEffect(() => {
    function manejarClickFuera(e: MouseEvent) {
      if (
        contenedorRef.current &&
        !contenedorRef.current.contains(e.target as Node)
      ) {
        setAbierto(false);
      }
    }
    document.addEventListener("mousedown", manejarClickFuera);
    return () => document.removeEventListener("mousedown", manejarClickFuera);
  }, []);

  // Cierra con tecla Escape
  useEffect(() => {
    function manejarTecla(e: KeyboardEvent) {
      if (e.key === "Escape") setAbierto(false);
    }
    document.addEventListener("keydown", manejarTecla);
    return () => document.removeEventListener("keydown", manejarTecla);
  }, []);

  return (
    <div ref={contenedorRef} className="relative">
      {/* Botón disparador */}
      <button
        type="button"
        onClick={() => setAbierto((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={abierto}
        className={[
          "flex items-center gap-1 rounded-lg px-2 py-1",
          "text-sm text-oficina-tenue transition-colors",
          "hover:bg-oficina-fondo hover:text-oficina-texto",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marca/40",
        ].join(" ")}
      >
        <span className="font-medium tracking-wide">SOC · TALENT</span>
        <ChevronDown
          size={14}
          aria-hidden
          className={[
            "transition-transform duration-200",
            abierto ? "rotate-180" : "rotate-0",
          ].join(" ")}
        />
      </button>

      {/* Menú flotante */}
      {abierto && (
        <ul
          role="listbox"
          aria-label="Seleccionar espacio"
          className={[
            "absolute left-0 top-full z-50 mt-1.5 min-w-[160px]",
            "rounded-xl border border-oficina-borde bg-oficina-panel shadow-lg",
            "py-1",
          ].join(" ")}
        >
          {ESPACIOS.map((opcion) => (
            <li key={opcion.href} role="option" aria-selected={false}>
              <Link
                href={opcion.href}
                onClick={() => setAbierto(false)}
                className={[
                  "flex items-center px-3 py-2",
                  "text-sm text-oficina-texto",
                  "hover:bg-oficina-fondo",
                  "transition-colors duration-100",
                  "first:rounded-t-xl last:rounded-b-xl",
                ].join(" ")}
              >
                {opcion.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Pill de estado operacional ───────────────────────────────────────────────

function PillOperacional() {
  return (
    <div
      className={[
        "flex items-center gap-1.5 rounded-full",
        "border border-oficina-borde bg-oficina-fondo",
        "px-3 py-1 text-xs text-oficina-tenue",
      ].join(" ")}
      aria-label="Estado del sistema: Operacional"
    >
      {/* Punto verde con pulso sutil */}
      <span
        className="relative flex h-2 w-2 items-center justify-center"
        aria-hidden
      >
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-estado-entrego opacity-50" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-estado-entrego" />
      </span>
      <span>Operational</span>
    </div>
  );
}

// ─── Grupo de enlaces externos ────────────────────────────────────────────────

interface Enlace {
  href: string;
  label: string;
  icono: React.ReactNode;
}

const ENLACES: Enlace[] = [
  {
    href: "#",
    label: "GitHub",
    icono: <Github size={15} aria-hidden />,
  },
  {
    href: "#",
    label: "Twitter / X",
    icono: <Twitter size={15} aria-hidden />,
  },
  {
    href: "#",
    label: "Correo electrónico",
    icono: <Mail size={15} aria-hidden />,
  },
];

function GrupoEnlaces() {
  return (
    <div
      className={[
        "flex items-center gap-0.5 rounded-full",
        "border border-oficina-borde bg-oficina-fondo",
        "px-1 py-1",
      ].join(" ")}
    >
      {ENLACES.map((enlace) => (
        <a
          key={enlace.label}
          href={enlace.href}
          target="_blank"
          rel="noreferrer"
          aria-label={enlace.label}
          className={[
            "flex items-center justify-center rounded-full",
            "h-7 w-7",
            "text-oficina-tenue",
            "hover:bg-oficina-panel hover:text-oficina-texto",
            "transition-colors duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marca/40",
          ].join(" ")}
        >
          {enlace.icono}
        </a>
      ))}
    </div>
  );
}

// ─── Toggle claro / oscuro ────────────────────────────────────────────────────

function ToggleTema() {
  const { theme, setTheme } = useTheme();
  // Evita hydration mismatch: no muestra el icono dependiente del tema
  // hasta que el componente está montado en el cliente.
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setMontado(true);
  }, []);

  const estaEnModoOscuro = theme === "dark";

  function alternar() {
    setTheme(estaEnModoOscuro ? "light" : "dark");
  }

  return (
    <button
      type="button"
      onClick={alternar}
      aria-label={
        montado
          ? estaEnModoOscuro
            ? "Cambiar a modo claro"
            : "Cambiar a modo oscuro"
          : "Toggle de tema"
      }
      className={[
        "flex items-center justify-center rounded-full",
        "h-8 w-8",
        "border border-oficina-borde bg-oficina-fondo",
        "text-oficina-tenue",
        "hover:bg-oficina-panel hover:text-oficina-texto",
        "transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marca/40",
      ].join(" ")}
    >
      {/* Placeholder del mismo tamaño mientras no está montado */}
      {!montado ? (
        <span className="h-[15px] w-[15px]" aria-hidden />
      ) : estaEnModoOscuro ? (
        <Sun size={15} aria-hidden />
      ) : (
        <Moon size={15} aria-hidden />
      )}
    </button>
  );
}
