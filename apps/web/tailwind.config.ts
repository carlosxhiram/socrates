import type { Config } from "tailwindcss";

/**
 * Paleta de Sócrates: neutral dominante (blancos crema, grises fríos) con un
 * acento de marca VERDE bosque (identidad estilo Tavily — decisión de producto:
 * la marca es verde, nunca azul). Estética premium sin ostentación (UX P-6).
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        marca: {
          DEFAULT: "#1f6f43", // verde bosque (acento de marca)
          fuerte: "#165432", // hover: más oscuro
          suave: "#2f8c5c",
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
          trabajando: "#2f8c5c", // en marcha, en el verde de la marca
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
