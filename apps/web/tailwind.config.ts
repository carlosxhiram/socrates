import type { Config } from "tailwindcss";

/**
 * Sistema de diseño de Socratia — la disciplina de Tavily aplicada a la paleta
 * propia: crema cálida dominante, acento VERDE salvia (la marca es verde, nunca
 * azul), tinta casi-negra por capas, radios por nivel, altura de control
 * unificada y UNA sola curva de motion. Premium sin ostentación (UX P-6).
 */

// La curva de motion ÚNICA (swift-out de Tavily). Su gemela para animaciones de
// JS (motion/react) vive en src/lib/motion.ts; la de CSS crudo en globals.css
// (--ease). Los tres valores deben cambiar juntos.
const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        marca: {
          DEFAULT: "#3E7D5A", // verde salvia profundo — acento/botones (texto blanco, contraste AA)
          fuerte: "#2F6147", // hover / activo — escalón calculado del mismo verde
          suave: "#81B09A", // salvia (= verde Tavily) — SOLO tintes/badges/glow, nunca fondo grande
        },
        oficina: {
          fondo: "#FEFCF5", // crema cálido de página
          panel: "#FFFCF6", // blanco cálido — superficies elevadas (antes #FFFFFF puro)
          "panel-neutro": "#F7F7F5", // tarjetas "neutras", bloques de código
          borde: "#E9E4D6", // hairline cálido — el separador PRINCIPAL de toda la app
          texto: "#1E2A23", // tinta sólida — verde-gris muy oscuro
          tenue: "#6E7771", // texto secundario sólido
          // Tinta por capas: rgb base en globals.css (--tinta), aplicada con
          // opacidad → text-oficina-tinta/60, /40, /90. Nunca #000 puro.
          tinta: "rgb(var(--tinta) / <alpha-value>)",
        },
        estado: {
          libre: "#9AA39B",
          trabajando: "#2E6F8E", // azul-acero — SEPARADO de la marca (antes #3E7D5A: colisionaba)
          entrego: "#1F8A5B",
          alerta: "#C8861A",
          bloqueo: "#C0392B",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        // Geist Mono — eyebrows con "/", cifras tabulares (tasas, montos, plazos)
        // y contadores. El registro monoespaciado refuerza "precisión financiera".
        mono: ["var(--font-geist-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      // Escala tipográfica fluida (clamp) — la firma copiable de Tavily: peso 500
      // (medium, NUNCA bold) con tracking negativo y line-height casi 1. El 1.05
      // protege los acentos del español (á, é, í, ó, ú, ñ) de recortarse.
      fontSize: {
        display: [
          "clamp(2.5rem, 3vw + 1.5rem, 4rem)",
          { lineHeight: "1.05", letterSpacing: "-0.02em", fontWeight: "500" },
        ],
        seccion: [
          "clamp(2rem, 2.5vw + 1rem, 3rem)",
          { lineHeight: "1.05", letterSpacing: "-0.018em", fontWeight: "500" },
        ],
        sub: [
          "clamp(1.5rem, 1.5vw + 1rem, 2rem)",
          { lineHeight: "1.1", letterSpacing: "-0.014em", fontWeight: "500" },
        ],
        "cuerpo-lg": [
          "clamp(1.0625rem, 0.5vw + 0.75rem, 1.25rem)",
          { lineHeight: "1.55" },
        ],
        eyebrow: ["0.9375rem", { lineHeight: "1", letterSpacing: "0" }], // 15px, mono
      },
      borderRadius: {
        // Radios por nivel (jerarquía, no un solo valor repetido — eso es un tell
        // genérico). Las pills usan rounded-full (999px).
        tarjeta: "20px", // tarjetas — el estándar de oro
        panel: "12px", // inputs, dropdowns, popovers
        interno: "8px", // superficies internas
      },
      spacing: {
        // Altura de control unificada: botón, input y select TODOS a 44px.
        control: "2.75rem", // 44px
      },
      boxShadow: {
        // Hover de tarjeta = resplandor de color ambiental (blur grande, SIN
        // offset), verde salvia a baja opacidad. NUNCA sombra oscura de plantilla.
        glow: "0 0 32px 0 rgba(129, 176, 154, 0.42)",
        // Sombra REAL solo para flotantes (menús, modales): capas de opacidad baja.
        flotante:
          "0 1px 1px rgba(27, 38, 33, 0.03), 0 8px 24px -6px rgba(27, 38, 33, 0.10)",
      },
      transitionTimingFunction: {
        // ease-suave = la curva única, disponible como utilidad de Tailwind.
        suave: EASE,
      },
      // Animación de la landing — la MISMA curva única en todo (doctrina Resend:
      // consistencia sobre cantidad). Decorativo = lento; feedback = rápido.
      keyframes: {
        "entrada-hero": {
          from: { opacity: "0", transform: "translateY(22px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "entrada-hero": `entrada-hero 0.8s ${EASE} both`,
        "entrada-hero-tarde": `entrada-hero 0.8s ${EASE} 0.25s both`,
      },
    },
  },
  plugins: [],
};

export default config;
