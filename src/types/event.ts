/**
 * event.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Tipos de los eventos, sus tareas y el resumen del cierre.
 *
 * POR QUÉ EXISTE: EventSummary refleja la vista vw_event_budget de
 *            schema.sql; los componentes de eventos solo conocen esto.
 *
 * USADO EN:   components/events/*, hooks/useEvents.ts
 * ---------------------------------------------------------------
 */

export type EventStatus = 'activo' | 'cerrado';

export interface EventSummary {
  id: string;
  name: string;
  icon: string;
  dateLabel: string;
  location: string | null;
  status: EventStatus;
  plannedBudget: number;
  spentAmount: number;
  expensesCount: number;
  tasksDone: number;
  tasksTotal: number;
}

export interface EventTask {
  id: string;
  title: string;
  isDone: boolean;
}

// Respuesta de la RPC close_event_and_transfer (schema.sql, sección 6).
export interface CloseEventResult {
  planned: number;
  actual: number;
  variance: number;
  expensesCount: number;
  totalAmount: number;
  targetMonth: string;
}
