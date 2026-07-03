import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // El monorepo comparte @socrates/shared como código fuente TS; lo transpilamos.
  transpilePackages: ["@socrates/shared"],
  reactStrictMode: true,
  // Next 16 eliminó la opción `eslint` de la config (y `next lint` del CLI);
  // el gate de calidad por paquete es `typecheck`.
  // El build corre con `--webpack` (script build): el build con Turbopack falla
  // intermitente en máquinas de pocos núcleos ("Cannot find module for page")
  // al recolectar page data — reevaluar al subir de versión de Next.
};

export default nextConfig;
