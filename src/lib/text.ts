/**
 * text.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Utilidades puras de texto para la interfaz.
 * ---------------------------------------------------------------
 */
import type { PlanName } from '@/types/database';

// "Andrea López" → "AL". Para el avatar cuando no hay foto.
export function getInitials(fullName: string): string {
  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();
}

const PLAN_LABELS: Record<PlanName, string> = {
  gratis: 'Gratis',
  personal: 'Personal',
  organizador: 'Organizador',
};

// 'organizador' → 'Organizador'. El valor de la base nunca se muestra crudo.
export function planLabel(plan: PlanName): string {
  return PLAN_LABELS[plan];
}

// "1 tarea pendiente" / "3 tareas pendientes" / "Sin tareas pendientes".
export function pendingTasksLabel(pending: number): string {
  if (pending <= 0) return 'Sin tareas pendientes';
  return pending === 1 ? '1 tarea pendiente' : `${pending} tareas pendientes`;
}
