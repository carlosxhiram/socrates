import type { Metadata } from "next";
import { LEGAL } from "@socrates/shared";
import {
  PaginaLegal,
  Parrafo,
  Subtitulo,
  Lista,
  PieLegal,
  Fuerte,
} from "@/components/legal/PaginaLegal";

export const metadata: Metadata = {
  title: "Aviso de Privacidad",
  description:
    "Aviso de Privacidad de SOCRATIA: qué datos tratamos, para qué, con quién los compartimos y tus derechos ARCO.",
};

/**
 * /aviso-de-privacidad — Aviso de Privacidad (texto legal v1.0, aprobado). El
 * contenido se transcribe fielmente; la versión y la vigencia salen de LEGAL
 * (fuente única).
 */
export default function AvisoDePrivacidadPage() {
  return (
    <PaginaLegal
      titulo="Aviso de Privacidad de SOCRATIA"
      version={`Versión ${LEGAL.avisoVersion} · Vigente desde el ${LEGAL.vigenciaTexto}`}
    >
      <Parrafo>
        <Fuerte>Business Innovation Atomic Novelties, S.A.S. de C.V.</Fuerte>{" "}
        (el &ldquo;Responsable&rdquo;), con domicilio en Cerrada Alzaga 150, Cerradas de Valle
        Alto, Monterrey, Nuevo León, C.P. 64984, México, es responsable del tratamiento de
        los datos personales que recaba a través de SOCRATIA (el &ldquo;Servicio&rdquo;),
        en los términos de este Aviso de Privacidad y de la legislación mexicana de
        protección de datos personales.
      </Parrafo>
      <Parrafo>
        Contacto para todo lo relacionado con este Aviso:{" "}
        <Fuerte>carloshiramchavez@icloud.com</Fuerte>.
      </Parrafo>

      <Subtitulo>1. Qué datos recabamos de ti (el Asesor titular de la cuenta)</Subtitulo>
      <Lista>
        <li>
          <Fuerte>Identificación y contacto:</Fuerte> nombre, correo electrónico, teléfono,
          ciudad u oficina, y los datos profesionales que decidas registrar en tu perfil.
        </li>
        <li>
          <Fuerte>Datos de facturación y pago:</Fuerte> los necesarios para cobrar tu
          suscripción. <Fuerte>Los datos de tu tarjeta los proporcionas directamente al
          procesador de pagos (Stripe); el Responsable no los recibe ni los almacena.</Fuerte>
        </li>
        <li>
          <Fuerte>Información de uso del Servicio:</Fuerte> la información que capturas al
          trabajar (expedientes, notas, encargos) y registros técnicos básicos necesarios
          para operar el Servicio con seguridad.
        </li>
      </Lista>
      <Parrafo>
        No recabamos datos personales sensibles del Asesor. Te pedimos no capturar datos
        sensibles en campos de texto libre.
      </Parrafo>

      <Subtitulo>2. Para qué usamos tus datos (finalidades)</Subtitulo>
      <Parrafo>
        <Fuerte>Finalidades primarias</Fuerte> (necesarias para la relación contigo): crear
        y administrar tu cuenta; prestarte el Servicio; cobrar la suscripción y emitir los
        comprobantes que correspondan; darte soporte; atender requerimientos de autoridad y
        cumplir obligaciones legales.
      </Parrafo>
      <Parrafo>
        <Fuerte>Finalidades secundarias</Fuerte> (no necesarias, pero útiles): enviarte
        comunicaciones sobre novedades y mejoras del Servicio, y elaborar estadísticas
        internas de uso para mejorarlo. <Fuerte>Puedes negarte a estas finalidades
        secundarias en cualquier momento</Fuerte> escribiendo al correo de contacto, sin que
        ello afecte el Servicio.
      </Parrafo>

      <Subtitulo>3. Los datos de tus clientes</Subtitulo>
      <Parrafo>
        Si capturas en el Servicio datos personales de tus clientes (por ejemplo, para
        preparar un expediente o un entregable), <Fuerte>tú eres el responsable de esos
        datos</Fuerte> y declaras contar con el consentimiento o la base legal para
        tratarlos. El Responsable actúa únicamente <Fuerte>por tu cuenta y bajo tus
        instrucciones</Fuerte> (como encargado): los usa solo para prestarte el Servicio, no
        los utiliza para fines propios, no los comparte con terceros salvo los proveedores
        necesarios para operar el Servicio, los protege con medidas de seguridad y los
        suprime o te los devuelve cuando termina tu relación con el Servicio o cuando lo
        solicites.
      </Parrafo>

      <Subtitulo>4. Con quién compartimos datos</Subtitulo>
      <Parrafo>
        <Fuerte>No vendemos ni rentamos tus datos personales.</Fuerte> Solo los compartimos
        con: (a) el procesador de pagos (Stripe), para cobrar tu suscripción; (b) proveedores
        de servicios de cómputo y almacenamiento que hacen posible operar el Servicio,
        quienes los tratan por cuenta del Responsable y bajo obligaciones de
        confidencialidad; y (c) autoridades competentes, cuando exista un requerimiento
        legalmente fundado. Fuera de estos casos, cualquier transferencia requerirá tu
        consentimiento.
      </Parrafo>

      <Subtitulo>5. Tus derechos (Acceso, Rectificación, Cancelación y Oposición)</Subtitulo>
      <Parrafo>
        Puedes ejercer en cualquier momento tus derechos de <Fuerte>acceso, rectificación,
        cancelación y oposición (derechos ARCO)</Fuerte>, así como <Fuerte>revocar tu
        consentimiento</Fuerte> o <Fuerte>limitar el uso o divulgación</Fuerte> de tus datos,
        enviando una solicitud a <Fuerte>carloshiramchavez@icloud.com</Fuerte> con: (a) tu
        nombre y correo registrado en el Servicio, (b) la descripción clara del derecho que
        quieres ejercer, y (c) cualquier elemento que facilite localizar tus datos.
        Responderemos en los plazos que marca la ley. Si la respuesta no te satisface, puedes
        acudir a la autoridad competente en materia de protección de datos personales.
      </Parrafo>

      <Subtitulo>6. Seguridad y conservación</Subtitulo>
      <Parrafo>
        Aplicamos medidas de seguridad administrativas, técnicas y físicas razonables para
        proteger tus datos contra pérdida, alteración o acceso no autorizado. Conservamos los
        datos mientras tu cuenta esté activa y, después, solo durante los plazos necesarios
        para cumplir obligaciones legales o atender responsabilidades derivadas de la
        relación.
      </Parrafo>

      <Subtitulo>7. Cambios a este Aviso</Subtitulo>
      <Parrafo>
        Cualquier cambio a este Aviso se publicará en esta misma página, con su nueva versión
        y fecha de entrada en vigor. Si el cambio implica nuevas finalidades que requieran tu
        consentimiento, te lo pediremos expresamente.
      </Parrafo>

      <PieLegal>
        Business Innovation Atomic Novelties, S.A.S. de C.V. · Cerrada Alzaga 150, Cerradas
        de Valle Alto, Monterrey, Nuevo León, C.P. 64984, México ·
        carloshiramchavez@icloud.com
      </PieLegal>
    </PaginaLegal>
  );
}
