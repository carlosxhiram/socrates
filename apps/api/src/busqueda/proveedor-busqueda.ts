/**
 * proveedor-busqueda.ts — interfaz ProveedorBusqueda (decisiones-bloqueantes B-1).
 *
 * Pluggable: tavily | fallback-sembrado. Tavily es purpose-built para agentes de
 * IA y devuelve fuentes citables. Sin TAVILY_API_KEY ⇒ fallback que NO truena.
 */

export interface ResultadoBusqueda {
  titulo: string;
  url: string;
  fragmento: string;
}

export interface ProveedorBusqueda {
  readonly disponible: boolean;
  readonly nombre: string;
  buscar(consulta: string): Promise<ResultadoBusqueda[]>;
}

class BusquedaFallback implements ProveedorBusqueda {
  readonly disponible = false;
  readonly nombre = "fallback-sembrado";
  async buscar(): Promise<ResultadoBusqueda[]> {
    // Sin clave: devolvemos vacío honesto; el Investigador marca Brechas en lugar
    // de inventar fuentes (C-2: lo no respaldado se degrada, nunca se finge).
    return [];
  }
}

class BusquedaTavily implements ProveedorBusqueda {
  readonly disponible = true;
  readonly nombre = "tavily";
  constructor(private readonly apiKey: string) {}

  async buscar(consulta: string): Promise<ResultadoBusqueda[]> {
    try {
      const resp = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: this.apiKey,
          query: consulta,
          max_results: 6,
          search_depth: "advanced",
        }),
      });
      if (!resp.ok) {
        console.warn("[ProveedorBusqueda] Tavily respondió", resp.status);
        return [];
      }
      const data = (await resp.json()) as {
        results?: Array<{ title?: string; url?: string; content?: string }>;
      };
      return (data.results ?? []).map((r) => ({
        titulo: r.title ?? "",
        url: r.url ?? "",
        fragmento: r.content ?? "",
      }));
    } catch (err) {
      console.warn("[ProveedorBusqueda] Tavily falló, fallback vacío:", err);
      return [];
    }
  }
}

export function crearProveedorBusqueda(): ProveedorBusqueda {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    return new BusquedaFallback();
  }
  return new BusquedaTavily(apiKey);
}
