import type { Config } from "tailwindcss";

/**
 * Paleta de Sócrates — inspirada en Tavily: crema cálida dominante con acento
 * VERDE salvia (la marca es verde, nunca azul). Estética premium sin
 * ostentación (UX P-6).
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        marca: {
          DEFAULT: "#3E7D5A", // verde salvia profundo — acento/botones (texto blanco, contraste AA)
          fuerte: "#2F6147", // hover / activo
          suave: "#81B09A", // salvia — tintes, badges, acentos suaves
        },
        oficina: {
          fondo: "#FEFCF5", // crema cálido de fondo
          panel: "#FFFFFF", // tarjetas
          borde: "#E9E4D6", // borde cálido
          texto: "#1E2A23", // verde-gris muy oscuro (texto)
          tenue: "#6E7771", // texto secundario
        },
        estado: {
          libre: "#9AA39B",
          trabajando: "#3E7D5A",
          entrego: "#1F8A5B",
          alerta: "#C8861A",
          bloqueo: "#C0392B",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      // Animación de la landing — una sola curva de easing en TODO (doctrina
      // Resend: consistencia sobre cantidad). Decorativo = lento; feedback = rápido.
      keyframes: {
        "entrada-hero": {
          from: { opacity: "0", transform: "translateY(14px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "entrada-hero": "entrada-hero 0.8s cubic-bezier(0.4, 0, 0.2, 1) both",
        "entrada-hero-tarde": "entrada-hero 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.15s both",
      },
    },
  },
  plugins: [],
};

export default config;
