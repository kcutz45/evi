/**
 * metas.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Cálculos de las metas de ahorro: avance, cuánto falta y el
 *            mensaje de ánimo de la pantalla.
 *
 * POR QUÉ EXISTE: Lógica pura fuera de los componentes (SRP); se prueba
 *            sin base de datos. El tono anima, nunca regaña (§3).
 * ---------------------------------------------------------------
 */
import type { Meta } from '@/types/goal';

const UMBRAL_CASI = 0.8;

// Fracción ahorrada, entre 0 y 1.
export function avance(meta: Meta): number {
  if (meta.objetivo <= 0) return 0;
  return Math.min(1, Math.max(0, meta.ahorrado / meta.objetivo));
}

export function faltante(meta: Meta): number {
  return Math.max(0, meta.objetivo - meta.ahorrado);
}

export function mensajeDeAnimo(metas: Meta[]): string {
  const activas = metas.filter((m) => m.estado === 'activa');
  const casi = activas.filter((m) => avance(m) >= UMBRAL_CASI).length;
  if (casi === 1) return 'Vas bien: una meta ya pasó el 80%. Un abono chiquito la cierra.';
  if (casi > 1) return `Vas bien: ${casi} metas ya pasaron el 80%. Un abono chiquito las cierra.`;
  if (activas.length === 0) return '¡Cumpliste todas tus metas! ¿Cuál es la siguiente?';
  return 'Abonar Q50 cada quincena te acerca sin apretarte el mes.';
}
