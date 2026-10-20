/**
 * text.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Utilidades puras de texto para la interfaz.
 * ---------------------------------------------------------------
 */

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

// "1 tarea pendiente" / "3 tareas pendientes" / "Sin tareas pendientes".
export function pendingTasksLabel(pending: number): string {
  if (pending <= 0) return 'Sin tareas pendientes';
  return pending === 1 ? '1 tarea pendiente' : `${pending} tareas pendientes`;
}
