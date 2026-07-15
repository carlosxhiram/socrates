import type { Metadata } from "next";
import { LEGAL } from "@socrates/shared";
import {
  PaginaLegal,
  Parrafo,
  Subtitulo,
  PieLegal,
  Fuerte,
} from "@/components/legal/PaginaLegal";

export const metadata: Metadata = {
  title: "Términos y Condiciones",
  description:
    "Términos y Condiciones de SOCRATIA, la plataforma de apoyo para la oficina del asesor de crédito.",
};

/**
 * /terminos — Términos y Condiciones (texto legal v1.0, aprobado). El contenido
 * se transcribe fielmente; la versión y la vigencia salen de LEGAL (fuente única).
 */
export default function TerminosPage() {
  return (
    <PaginaLegal
      titulo="Términos y Condiciones de SOCRATIA"
      version={`Versión ${LEGAL.terminosVersion} · Vigente desde el ${LEGAL.vigenciaTexto}`}
    >
      <Parrafo>
        Estos Términos y Condiciones (los &ldquo;Términos&rdquo;) regulan el uso de
        SOCRATIA, la plataforma de apoyo para la oficina del asesor de crédito (el
        &ldquo;Servicio&rdquo;), operada por{" "}
        <Fuerte>Business Innovation Atomic Novelties, S.A.S. de C.V.</Fuerte>{" "}
        (el &ldquo;Proveedor&rdquo;), con domicilio en Cerrada Alzaga 150, Cerradas de Valle
        Alto, Monterrey, Nuevo León, C.P. 64984, México, y correo de contacto{" "}
        <Fuerte>carloshiramchavez@icloud.com</Fuerte>.
      </Parrafo>
      <Parrafo>
        Al marcar la casilla de aceptación durante la creación de tu cuenta manifiestas
        tu consentimiento expreso a estos Términos. Ese acto tiene para ti y para el
        Proveedor los mismos efectos que una firma. Conservamos la fecha, la hora y la
        versión de los Términos que aceptaste como constancia. Si no estás de acuerdo, no
        crees la cuenta ni uses el Servicio.
      </Parrafo>

      <Subtitulo>1. Qué es el Servicio (y qué no es)</Subtitulo>
      <Parrafo>
        1.1. SOCRATIA es una herramienta de trabajo para asesores de crédito y seguros
        (el &ldquo;Asesor&rdquo;): organiza información, prepara borradores, reportes y
        otros materiales de apoyo (los &ldquo;Entregables&rdquo;) de manera automatizada,
        a partir de la información que el propio Asesor proporciona y del catálogo de
        información con el que opera el Servicio.
      </Parrafo>
      <Parrafo>
        1.2. <Fuerte>El Servicio no presta asesoría financiera, legal, fiscal ni de
        inversión</Fuerte>, no otorga créditos, no capta recursos, no promete la
        aprobación de ningún crédito ni resultado alguno, y no es una institución
        financiera ni está autorizado, supervisado o regulado como tal por autoridad
        financiera alguna.
      </Parrafo>
      <Parrafo>
        1.3. Los Entregables son <Fuerte>borradores de apoyo</Fuerte>. Pueden contener
        errores, imprecisiones u omisiones, y pueden no reflejar las condiciones vigentes
        de las instituciones financieras.
      </Parrafo>

      <Subtitulo>2. Tu obligación central como Asesor: revisar antes de entregar</Subtitulo>
      <Parrafo>
        2.1. <Fuerte>Te obligas a revisar, verificar y aprobar personalmente cada
        Entregable antes de usarlo o de compartirlo con tus clientes o con cualquier
        tercero.</Fuerte> El Servicio está diseñado para que nada salga hacia tus clientes
        sin tu aprobación; esa aprobación es tuya y solo tuya.
      </Parrafo>
      <Parrafo>
        2.2. Frente a tus clientes, el único responsable de la asesoría que prestas eres
        tú. El Proveedor no tiene relación alguna con tus clientes y no asume
        responsabilidad frente a ellos.
      </Parrafo>
      <Parrafo>
        2.3. Eres responsable de cumplir las obligaciones legales, contractuales y
        deontológicas propias de tu actividad como asesor, incluidas las reglas de la red
        u organización a la que pertenezcas.
      </Parrafo>

      <Subtitulo>3. Tu cuenta</Subtitulo>
      <Parrafo>
        3.1. Para usar el Servicio debes crear una cuenta con información veraz, completa
        y actualizada, y mantener la confidencialidad de tus medios de acceso. Eres
        responsable de toda la actividad que ocurra en tu cuenta.
      </Parrafo>
      <Parrafo>
        3.2. El Servicio está dirigido a mayores de edad con capacidad legal para
        contratar, actuando en el marco de su actividad profesional o empresarial
        (relación entre negocios). No está dirigido a consumidores finales.
      </Parrafo>

      <Subtitulo>4. Suscripción, precio y pagos</Subtitulo>
      <Parrafo>
        4.1. El Servicio se cobra mediante suscripción periódica. El precio, la
        periodicidad y lo que incluye cada plan se muestran antes de contratar.
      </Parrafo>
      <Parrafo>
        4.2. Los pagos se procesan a través de un procesador de pagos externo (Stripe).{" "}
        <Fuerte>El Proveedor no recibe ni almacena los datos de tu tarjeta</Fuerte>; los
        proporciona directamente el Asesor al procesador.
      </Parrafo>
      <Parrafo>
        4.3. La suscripción se renueva automáticamente al final de cada periodo, salvo que
        la canceles antes de la fecha de renovación. Puedes cancelar en cualquier momento;
        la cancelación surte efectos al cierre del periodo ya pagado. Salvo disposición
        legal en contrario, los pagos realizados no son reembolsables.
      </Parrafo>
      <Parrafo>
        4.4. Si un pago no se completa, el acceso al Servicio puede suspenderse o
        limitarse hasta regularizarlo.
      </Parrafo>

      <Subtitulo>5. Contenido e información</Subtitulo>
      <Parrafo>
        5.1. <Fuerte>Tu información sigue siendo tuya.</Fuerte> La información que subas o
        captures en el Servicio (datos de tus clientes, notas, documentos) es tuya o de
        tus clientes; nos autorizas a tratarla únicamente para operar el Servicio conforme
        a estos Términos y al Aviso de Privacidad.
      </Parrafo>
      <Parrafo>
        5.2. <Fuerte>Los Entregables generados para ti</Fuerte> pueden usarse libremente
        en tu actividad profesional una vez que los revises y apruebes conforme a la
        cláusula 2.
      </Parrafo>
      <Parrafo>
        5.3. <Fuerte>El Servicio es del Proveedor.</Fuerte> El software, el diseño, las
        marcas y todos los elementos del Servicio son propiedad del Proveedor o de sus
        licenciantes. Estos Términos te dan un derecho de uso personal, limitado, revocable
        y no exclusivo del Servicio; no te transfieren ninguna propiedad.
      </Parrafo>
      <Parrafo>
        5.4. Declaras contar con las autorizaciones y consentimientos necesarios de tus
        clientes para capturar su información en el Servicio (ver cláusula 7).
      </Parrafo>

      <Subtitulo>6. Uso aceptable</Subtitulo>
      <Parrafo>
        Te comprometes a no usar el Servicio para: (a) actividades ilícitas o que
        requieran autorizaciones que no tienes; (b) hacerte pasar por una institución
        financiera o por otra persona; (c) presentar los Entregables como emitidos por una
        institución financiera o por una autoridad; (d) intentar vulnerar la seguridad del
        Servicio, revenderlo o copiarlo; (e) capturar información de terceros sin contar
        con el derecho de hacerlo. El incumplimiento de esta cláusula permite al Proveedor
        suspender o cancelar tu cuenta de inmediato.
      </Parrafo>

      <Subtitulo>7. Datos personales</Subtitulo>
      <Parrafo>
        7.1. El tratamiento de tus datos personales como titular de la cuenta se rige por
        nuestro <Fuerte>Aviso de Privacidad</Fuerte>, disponible en la página del Servicio.
      </Parrafo>
      <Parrafo>
        7.2. Respecto de los datos personales de tus clientes que captures en el Servicio,{" "}
        <Fuerte>tú eres el responsable</Fuerte> de ese tratamiento y el Proveedor actúa por
        tu cuenta y bajo tus instrucciones, limitándose a tratarlos para prestarte el
        Servicio, guardarlos con medidas de seguridad razonables y suprimirlos o
        devolvértelos al terminar la relación, en los términos del Aviso de Privacidad.
      </Parrafo>

      <Subtitulo>8. Disponibilidad y cambios del Servicio</Subtitulo>
      <Parrafo>
        8.1. Trabajamos para que el Servicio esté disponible de manera continua, pero{" "}
        <Fuerte>no garantizamos disponibilidad ininterrumpida ni libre de errores</Fuerte>.
        Puede haber mantenimientos, interrupciones o degradaciones, y algunas funciones
        pueden operar de forma limitada cuando dependan de información o de servicios
        externos.
      </Parrafo>
      <Parrafo>
        8.2. Podemos mejorar, modificar o descontinuar funciones del Servicio. Si un cambio
        reduce de manera sustancial lo contratado, podrás cancelar tu suscripción.
      </Parrafo>

      <Subtitulo>9. Garantías y responsabilidad</Subtitulo>
      <Parrafo>
        9.1. <Fuerte>El Servicio se proporciona &ldquo;tal cual&rdquo; y &ldquo;según
        disponibilidad&rdquo;</Fuerte>, sin garantías adicionales a las que la ley imponga
        de manera irrenunciable. En particular, no garantizamos que los Entregables sean
        exactos, completos o adecuados para un propósito específico: por eso existe tu
        obligación de revisión de la cláusula 2.
      </Parrafo>
      <Parrafo>
        9.2. <Fuerte>Límite de responsabilidad.</Fuerte> La responsabilidad total del
        Proveedor frente a ti, por cualquier causa relacionada con el Servicio, se limita
        al monto efectivamente pagado por ti por el Servicio durante los doce (12) meses
        anteriores al hecho que origine la reclamación.
      </Parrafo>
      <Parrafo>
        9.3. El Proveedor no responderá por daños indirectos, incidentales o
        consecuenciales, ni por lucro cesante, pérdida de clientes, de información o de
        oportunidades de negocio.
      </Parrafo>
      <Parrafo>
        9.4. <Fuerte>Nada en estos Términos limita o excluye la responsabilidad que
        conforme a la ley mexicana no pueda limitarse o excluirse</Fuerte>, incluida la que
        derive de dolo o mala fe del Proveedor.
      </Parrafo>

      <Subtitulo>10. Terminación</Subtitulo>
      <Parrafo>
        10.1. Puedes dejar de usar el Servicio y cancelar tu cuenta en cualquier momento.
      </Parrafo>
      <Parrafo>
        10.2. El Proveedor puede suspender o cancelar tu cuenta por incumplimiento de estos
        Términos, avisándote y — cuando el incumplimiento sea subsanable — dándote
        oportunidad razonable de corregirlo.
      </Parrafo>
      <Parrafo>
        10.3. Al terminar la relación, dejarás de tener acceso al Servicio. Podrás
        solicitar la devolución o supresión de la información de tus clientes conforme a la
        cláusula 7 y al Aviso de Privacidad.
      </Parrafo>

      <Subtitulo>11. Cambios a estos Términos</Subtitulo>
      <Parrafo>
        Podemos actualizar estos Términos. Si el cambio es relevante, te lo avisaremos
        dentro del Servicio o por correo con anticipación razonable. La versión vigente,
        con su fecha, estará siempre publicada en esta página. Si continúas usando el
        Servicio después de la entrada en vigor de un cambio, se entiende que lo aceptas;
        si no estás de acuerdo, puedes cancelar antes de que surta efectos.
      </Parrafo>

      <Subtitulo>12. Ley aplicable y tribunales</Subtitulo>
      <Parrafo>
        Estos Términos se rigen por las leyes de los Estados Unidos Mexicanos. Para
        cualquier controversia, las partes se someten a los tribunales competentes de
        Monterrey, Nuevo León, renunciando a cualquier otro fuero que pudiera
        corresponderles por domicilio presente o futuro.
      </Parrafo>

      <Subtitulo>13. Contacto</Subtitulo>
      <Parrafo>
        Para cualquier duda sobre estos Términos: <Fuerte>carloshiramchavez@icloud.com</Fuerte>.
      </Parrafo>

      <PieLegal>
        Business Innovation Atomic Novelties, S.A.S. de C.V. · Cerrada Alzaga 150, Cerradas
        de Valle Alto, Monterrey, Nuevo León, C.P. 64984, México.
      </PieLegal>
    </PaginaLegal>
  );
}
