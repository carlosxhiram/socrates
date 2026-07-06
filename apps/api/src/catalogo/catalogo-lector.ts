/**
 * catalogo-lector.ts — implementación real de CatalogoLector (D-3) sobre Prisma.
 *
 * El foso C-1: nunca alucina — `buscarProducto`/`buscarInstitucion` devuelven
 * `null` cuando el id no existe, y es el ÚNICO lugar donde `cuandoRecomendar`/
 * `condiciones` (String JSON serializado a mano en Prisma — no hay tipado
 * automático para esos campos) se convierten a datos estructurados.
 *
 * `listarProductos()` se cachea 5 min en memoria: el catálogo cambia poco y
 * el Investigador lo consulta una vez por fase de matcheo.
 */
import { prisma } from "@socrates/db";
import type { CatalogoLector, ProductoCatalogo, InstitucionCatalogo } from "@socrates/shared";

const TTL_CACHE_MS = 5 * 60 * 1000;

function parsearJSON<T>(valor: string, fallback: T): T {
  try {
    return JSON.parse(valor) as T;
  } catch {
    return fallback;
  }
}

class CatalogoLectorPrisma implements CatalogoLector {
  private cacheProductos: { valor: ProductoCatalogo[]; expiraEn: number } | null = null;

  async buscarProducto(productoId: string): Promise<ProductoCatalogo | null> {
    const p = await prisma.producto.findUnique({
      where: { id: productoId },
      include: { institucion: true },
    });
    if (!p) return null;
    return aProductoCatalogo(p);
  }

  async buscarInstitucion(institucionId: string): Promise<InstitucionCatalogo | null> {
    const i = await prisma.institucion.findUnique({ where: { id: institucionId } });
    if (!i) return null;
    return { id: i.id, nombre: i.nombre, tipo: i.tipo };
  }

  async listarProductos(): Promise<ProductoCatalogo[]> {
    const ahora = Date.now();
    if (this.cacheProductos && this.cacheProductos.expiraEn > ahora) {
      return this.cacheProductos.valor;
    }
    const productos = await prisma.producto.findMany({ include: { institucion: true } });
    const valor = productos.map(aProductoCatalogo);
    this.cacheProductos = { valor, expiraEn: ahora + TTL_CACHE_MS };
    return valor;
  }
}

function aProductoCatalogo(p: {
  id: string;
  institucionId: string;
  institucion: { nombre: string };
  nombre: string;
  tipo: string;
  paraQueSirve: string;
  cuandoRecomendar: string;
  condiciones: string;
}): ProductoCatalogo {
  return {
    id: p.id,
    institucionId: p.institucionId,
    institucionNombre: p.institucion.nombre,
    nombre: p.nombre,
    tipo: p.tipo,
    paraQueSirve: p.paraQueSirve,
    cuandoRecomendar: parsearJSON<string[]>(p.cuandoRecomendar, []),
    // El contrato tipa `condiciones` como string en ProductoCatalogo (texto
    // libre para el prompt/UI) — normalizamos el JSON serializado a texto
    // legible en vez de reexportar el objeto crudo.
    condiciones: resumenCondiciones(parsearJSON<Record<string, unknown>>(p.condiciones, {})),
  };
}

function resumenCondiciones(condiciones: Record<string, unknown>): string {
  const partes = Object.entries(condiciones).map(([clave, valor]) => `${clave}: ${valor}`);
  return partes.length > 0 ? partes.join("; ") : "Sin condiciones capturadas.";
}

let instanciaUnica: CatalogoLectorPrisma | null = null;

/** Instancia compartida (singleton) para reusar el caché de `listarProductos`. */
export function crearCatalogoLector(): CatalogoLector {
  if (!instanciaUnica) instanciaUnica = new CatalogoLectorPrisma();
  return instanciaUnica;
}
