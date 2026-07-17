import { defineConfig } from "tsup";

// El API se empaqueta en UN solo archivo con @socrates/shared INCRUSTADO. Dos
// razones: (1) shared usa imports sin extensión (".../glosario") que node ESM
// no resuelve — el bundler los resuelve al empaquetar; (2) así NO tocamos los
// exports de @socrates/shared, que la web (Next.js, en producción) consume
// desde su código fuente. @socrates/db queda EXTERNO a propósito: trae el
// cliente Prisma con su motor binario (.so.node de ~17 MB), que se carga por su
// ruta real en disco y no sobrevive dentro de un bundle. El resto de las
// dependencias npm quedan externas (tsup externaliza `dependencies` por
// defecto) y se resuelven de node_modules en runtime. Resultado: el runtime
// arranca con `node dist/index.js` — sin tsx.
export default defineConfig({
  entry: { index: "src/index.ts" },
  format: ["esm"],
  platform: "node",
  target: "node22",
  bundle: true,
  noExternal: ["@socrates/shared"],
  clean: true,
  dts: false,
  sourcemap: false,
  splitting: false,
});
