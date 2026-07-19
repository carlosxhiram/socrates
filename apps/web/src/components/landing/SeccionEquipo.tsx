import {
  Search,
  FileSearch,
  Landmark,
  Handshake,
  FileCheck,
  Briefcase,
  type LucideIcon,
} from "lucide-react";
import {
  ListaEscalonada,
  ElementoEscalonado,
} from "@/components/movimiento/ListaEscalonada";
import { RevelarAlScroll } from "@/components/movimiento/RevelarAlScroll";
import { Eyebrow } from "./Eyebrow";
import { OficinaViva } from "./variantes/OficinaViva";
import { CadenaEncargoV2 } from "./variantes/CadenaEncargoV2";

interface Empleado {
  nombre: string;
  rol: string;
  descripcion: string;
  Icono: LucideIcon;
  numero: string;
}

const EMPLEADOS: Empleado[] = [
  {
    numero: "01",
    nombre: "Diego",
    rol: "Prospector",
    descripcion: "Califica y enriquece a los prospectos que le traes.",
    Icono: Search,
  },
  {
    numero: "02",
    nombre: "Hiram",
    rol: "Investigador",
    descripcion:
      "Arma el reporte de inteligencia financiera del prospecto, con fuentes.",
    Icono: FileSearch,
  },
  {
    numero: "03",
    nombre: "Jair",
    rol: "Asesor de Producto",
    descripcion:
      "Identifica el mejor financiamiento del catálogo SOC para cada necesidad.",
    Icono: Landmark,
  },
  {
    numero: "04",
    nombre: "Katya",
    rol: "Negociadora",
    descripcion:
      "Prepara el guion de acercamiento, el pitch y el manejo de objeciones.",
    Icono: Handshake,
  },
  {
    numero: "05",
    nombre: "María",
    rol: "Trámites",
    descripcion:
      "Reúne requisitos y arma la cotización estimada del expediente.",
    Icono: FileCheck,
  },
  {
    numero: "06",
    nombre: "Paula",
    rol: "Gestora",
    descripcion: "Da seguimiento, cierra y acompaña en la postventa.",
    Icono: Briefcase,
  },
];

export function SeccionEquipo() {
  return (
    <section
      id="equipo"
      className="scroll-mt-16 border-t border-oficina-borde bg-oficina-panel py-24 md:py-32"
    >
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        {/* Encabezado — eyebrow → H2, con el "6" como pieza tipográfica mono */}
        <RevelarAlScroll className="mb-16 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Eyebrow>tu equipo</Eyebrow>
            <div className="mt-4 flex items-baseline gap-4">
              <span
                aria-hidden
                className="select-none font-mono text-[80px] font-medium leading-none tracking-tight text-marca"
              >
                6
              </span>
              <h2 className="text-seccion text-oficina-texto">
                especialistas,
                <br />
                un solo gerente.
              </h2>
            </div>
          </div>
          <div className="flex items-end lg:col-span-7">
            <p className="max-w-lg text-cuerpo-lg text-oficina-tenue">
              Seis empleados que se integran a tu oficina. No coordinas a nadie:
              le dices a Sócrates qué necesitas y él le asigna el trabajo al
              especialista correcto. Cada entregable llega listo para que tú lo
              revises y lo uses con tu prospecto. Y la plantilla es tuya:{" "}
              <strong className="font-medium text-oficina-texto">
                a cada especialista puedes nombrarlo como tú quieras.
              </strong>
            </p>
          </div>
        </RevelarAlScroll>

        {/* Cuadrícula de tarjetas — hover de resplandor ambiental (nunca lift). */}
        <ListaEscalonada className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {EMPLEADOS.map(({ numero, nombre, rol, descripcion, Icono }) => (
            <ElementoEscalonado key={numero}>
              <div className="group h-full rounded-tarjeta border border-oficina-borde bg-oficina-panel-neutro p-6 transition duration-300 ease-suave hover:border-marca/30 hover:bg-oficina-panel hover:shadow-glow">
                {/* Número (mono) + icono */}
                <div className="mb-5 flex items-start justify-between">
                  <span className="font-mono text-[13px] text-oficina-tinta/40">
                    {numero}
                  </span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-interno bg-marca/10 text-marca transition-colors duration-200 ease-suave group-hover:bg-marca group-hover:text-white">
                    <Icono size={18} aria-hidden />
                  </span>
                </div>

                {/* Nombre (protagonista) + rol (etiqueta mono) */}
                <h3 className="text-base font-medium text-oficina-texto">
                  {nombre}
                </h3>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-oficina-tinta/60">
                  {rol}
                </p>

                {/* Descripción */}
                <p className="mt-3 text-sm leading-relaxed text-oficina-tenue">
                  {descripcion}
                </p>
              </div>
            </ElementoEscalonado>
          ))}
        </ListaEscalonada>

        {/* La oficina en acción — dúo de piezas vivas debajo de la plantilla.
            Apiladas y centradas en móvil; lado a lado en escritorio. El clip
            en X es la red de seguridad contra cualquier desbordamiento en
            pantallas angostas (nunca scroll horizontal). */}
        <RevelarAlScroll className="mt-24 overflow-x-clip">
          <p className="mb-10 text-center font-mono text-[11px] uppercase tracking-[0.14em] text-oficina-tinta/60">
            La oficina en acción
          </p>
          <div className="grid grid-cols-1 items-center justify-items-center gap-12 lg:grid-cols-2 lg:gap-8">
            {/* OficinaViva es ancha (w-96): se oculta bajo sm para no desbordar. */}
            <div className="hidden sm:block">
              <OficinaViva />
            </div>
            <CadenaEncargoV2 />
          </div>
        </RevelarAlScroll>
      </div>
    </section>
  );
}
