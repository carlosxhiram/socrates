import type { Config } from "tailwindcss";

/**
 * Paleta de Sócrates — inspirada en Tavily: crema cálida dominante con acento
 * VERDE salvia. Estética premium sin ostentación (UX P-6).
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
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
