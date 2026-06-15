import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // El monorepo comparte @socrates/shared como código fuente TS; lo transpilamos.
  transpilePackages: ["@socrates/shared"],
  reactStrictMode: true,
  eslint: {
    // El lint serio corre por paquete; no bloquea el build de la shell.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
