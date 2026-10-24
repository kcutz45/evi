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
import { z } from 'zod';

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

// Pantalla de detalle: lo de la tarjeta más la fecha cruda, la cuenta
// regresiva y cuándo se cerró.
export interface EventoDetalle extends EventSummary {
  eventDate: string;
  countdown: string;
  closedAt: string | null;
}

// ---- Crear un evento (formulario por pasos) ------------------------------
export const NOMBRE_EVENTO_MAX = 80;

export const nuevoEventoSchema = z.object({
  name: z.string().trim().min(1, 'Escribí el nombre del evento').max(NOMBRE_EVENTO_MAX, `Máximo ${NOMBRE_EVENTO_MAX} letras`),
  icon: z.string().min(1),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Elegí la fecha del evento'),
  location: z.string().trim().max(NOMBRE_EVENTO_MAX).nullable(),
  plannedBudget: z.number().positive('El presupuesto debe ser mayor que Q0'),
});

export type NuevoEvento = z.infer<typeof nuevoEventoSchema>;

// ---- Fila de la vista vw_event_budget (schema.sql, sección 7) ------------
export type EventBudgetRow = {
  event_id: string;
  user_id: string;
  name: string;
  icon: string;
  event_date: string;
  location: string | null;
  status: EventStatus;
  planned_budget: number;
  closed_at: string | null;
  spent_amount: number;
  expenses_count: number;
  tasks_done: number;
  tasks_total: number;
};
