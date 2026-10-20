/**
 * cn.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Une clases de Tailwind ignorando las vacías o falsas.
 *
 * POR QUÉ EXISTE: Permite escribir cn('base', isActive && 'activo')
 *            sin plantillas de texto ilegibles en el JSX.
 * ---------------------------------------------------------------
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}
