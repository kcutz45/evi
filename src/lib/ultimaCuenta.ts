/**
 * ultimaCuenta.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Recordar en este celular la última cuenta usada al
 *            registrar, para que el registro la traiga ya elegida.
 *
 * POR QUÉ EXISTE: La cuenta es opcional y no agrega pasos: casi
 *            siempre se paga desde la misma. Es una comodidad de cada
 *            dispositivo, por eso vive en localStorage y no en la base.
 *            localStorage puede fallar (modo privado): nunca rompe nada.
 * ---------------------------------------------------------------
 */
const CLAVE = 'evi.ultimaCuenta';

export function leerUltimaCuenta(): string | null {
  try {
    return window.localStorage.getItem(CLAVE);
  } catch {
    return null;
  }
}

export function guardarUltimaCuenta(id: string): void {
  try {
    window.localStorage.setItem(CLAVE, id);
  } catch {
    // Sin almacenamiento: la próxima vez se usa la primera cuenta.
  }
}
