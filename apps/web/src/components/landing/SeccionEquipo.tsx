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
    <section id="equipo" className="scroll-mt-14 border-t border-oficina-borde bg-oficina-panel py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        {/* Encabezado */}
        <RevelarAlScroll className="mb-14 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-oficina-tenue">
              Tu plantilla
            </p>
            {/* El "6" como pieza tipográfica editorial */}
            <div className="flex items-baseline gap-4">
              <span
                aria-hidden
                className="text-[80px] font-black leading-none text-marca select-none"
              >
                6
              </span>
              <h2 className="text-3xl font-black leading-tight tracking-tight text-oficina-texto md:text-4xl">
                especialistas,
                <br />
                un solo gerente.
              </h2>
            </div>
          </div>
          <div className="flex items-end lg:col-span-7">
            <p className="max-w-lg text-base leading-relaxed text-oficina-tenue">
              Seis empleados que se integran a tu oficina. No coordinas a nadie:
              le dices a Sócrates qué necesitas y él le asigna el trabajo al
              especialista correcto. Cada entregable llega listo para que tú lo
              revises y lo uses con tu prospecto. Y la plantilla es tuya: a cada
              especialista puedes nombrarlo como tú quieras.
            </p>
          </div>
        </RevelarAlScroll>

        {/* Cuadrícula de tarjetas */}
        <ListaEscalonada className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {EMPLEADOS.map(({ numero, nombre, rol, descripcion, Icono }) => (
            <ElementoEscalonado key={numero}>
              <div className="group h-full rounded-xl border border-oficina-borde bg-oficina-fondo p-5 transition-all hover:-translate-y-0.5 hover:shadow-md">
                {/* Número + icono */}
                <div className="mb-4 flex items-start justify-between">
                  <span className="text-[11px] font-semibold tracking-widest text-oficina-tenue">
                    {numero}
                  </span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-md bg-marca/10 text-marca transition-colors group-hover:bg-marca group-hover:text-white">
                    <Icono size={18} aria-hidden />
                  </span>
                </div>

                {/* Rol */}
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-oficina-tenue">
                  {rol}
                </p>

                {/* Nombre */}
                <h3 className="mb-1.5 text-sm font-bold text-oficina-texto">
                  {nombre}
                </h3>

                {/* Descripción */}
                <p className="text-sm leading-relaxed text-oficina-tenue">
                  {descripcion}
                </p>
              </div>
            </ElementoEscalonado>
          ))}
        </ListaEscalonada>
      </div>
    </section>
  );
}
