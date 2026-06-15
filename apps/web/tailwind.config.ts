import type { Config } from "tailwindcss";

/**
 * Paleta de Sócrates: neutral dominante (blancos, grises fríos) con un acento
 * corporativo (azul oscuro). Estética premium sin ostentación (UX P-6).
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        marca: {
          DEFAULT: "#1e3a5f", // azul oscuro corporativo
          fuerte: "#16293f",
          suave: "#2d5280",
        },
        oficina: {
          fondo: "#f7f8fa", // gris muy frío de fondo
          panel: "#ffffff",
          borde: "#e3e7ed",
          texto: "#1a2230",
          tenue: "#6b7585",
        },
        estado: {
          libre: "#9aa3b2",
          trabajando: "#2d5280",
          entrego: "#1f8a5b",
          alerta: "#c8861a",
          bloqueo: "#c0392b",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
