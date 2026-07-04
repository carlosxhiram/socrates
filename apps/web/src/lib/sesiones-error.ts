/**
 * sesiones-error.ts — el error de la oficina para las Sesiones.
 *
 * Vive en su propio módulo (no en sesiones-actions.ts) porque un archivo
 * "use server" solo puede exportar funciones async; la clase se importa tanto
 * desde las Server Actions como desde las páginas que las consumen.
 */

/**
 * `status` trae el código HTTP SOLO cuando la oficina alcanzó a responder; si
 * es `undefined`, la llamada nunca llegó (sin conexión / se cayó a media
 * respuesta). Esa distinción deja a la pantalla decir "no existe / no es tuya"
 * en lugar de "no me pude conectar" — la honestidad operativa del resto de la
 * oficina (D-10).
 */
export class ErrorSesion extends Error {
  status?: number;
  constructor(mensaje: string, status?: number) {
    super(mensaje);
    this.name = "ErrorSesion";
    this.status = status;
  }
}
