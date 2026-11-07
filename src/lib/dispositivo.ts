/**
 * dispositivo.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Saber si el usuario tiene mouse y teclado (una PC).
 *
 * POR QUÉ EXISTE: En PC conviene poner el foco solo para escribir de una
 *            vez; en un celular eso abriría el teclado sin que nadie lo
 *            pidiera. Es la misma condición del variante `mouse:` de
 *            Tailwind.
 * ---------------------------------------------------------------
 */
export function tieneMouse(): boolean {
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}
