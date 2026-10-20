/**
 * mockData.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Datos de ejemplo para la página /demo.
 *
 * TEMPORAL:  /demo existe para revisar los componentes sin depender
 *            de Supabase. Se borra antes de la beta (semana 7).
 * ---------------------------------------------------------------
 */
import { buildCategorySlices } from '@/lib/report';
import type { Category } from '@/types/category';
import type { EventSummary, EventTask } from '@/types/event';
import type { MovementView } from '@/types/movement';

// UUID fijos: el esquema Zod del formulario exige UUID válidos.
const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;

export const demoCategories: Category[] = [
  { id: id(1), name: 'Comida', icon: 'utensils', kind: 'egreso' },
  { id: id(2), name: 'Transporte', icon: 'bus', kind: 'egreso' },
  { id: id(3), name: 'Despensa', icon: 'shopping-basket', kind: 'egreso' },
  { id: id(4), name: 'Vivienda', icon: 'house', kind: 'egreso' },
  { id: id(5), name: 'Estudio', icon: 'graduation-cap', kind: 'egreso' },
  { id: id(6), name: 'Salud', icon: 'heart-pulse', kind: 'egreso' },
  { id: id(7), name: 'Otros', icon: 'ellipsis', kind: 'egreso' },
  { id: id(8), name: 'Ingresos', icon: 'banknote', kind: 'ingreso' },
];

export const demoMovements: MovementView[] = [
  { id: 'm1', title: 'Decoración', categoryName: 'Otros', categoryIcon: 'ellipsis', dateLabel: 'Hoy', type: 'egreso', amount: 320, eventName: 'Cumpleaños de Sofía', isPending: true },
  { id: 'm2', title: 'Súper La Torre', categoryName: 'Despensa', categoryIcon: 'shopping-basket', dateLabel: 'Ayer', type: 'egreso', amount: 412.75, eventName: null, isPending: false },
  { id: 'm3', title: 'Pago de freelance', categoryName: 'Ingresos', categoryIcon: 'banknote', dateLabel: '26 sep', type: 'ingreso', amount: 2800, eventName: null, isPending: false },
];

export const demoEvents: EventSummary[] = [
  { id: id(20), name: 'Cumpleaños de Sofía', icon: 'cake', dateLabel: 'Sáb 10 oct', location: 'Xela', status: 'activo', plannedBudget: 2000, spentAmount: 1700, expensesCount: 12, tasksDone: 5, tasksTotal: 8 },
  { id: id(21), name: 'Viaje a Monterrico', icon: 'tree-palm', dateLabel: 'Sáb 24 oct', location: '8 personas', status: 'activo', plannedBudget: 4000, spentAmount: 950, expensesCount: 3, tasksDone: 0, tasksTotal: 7 },
  { id: id(22), name: 'Cena de generación', icon: 'utensils', dateLabel: '22 ago', location: null, status: 'cerrado', plannedBudget: 1500, spentAmount: 1240, expensesCount: 6, tasksDone: 4, tasksTotal: 4 },
];

export const demoTasks: EventTask[] = [
  { id: 't1', title: 'Reservar el salón', isDone: true },
  { id: 't2', title: 'Confirmar el pastel', isDone: true },
  { id: 't3', title: 'Comprar decoración', isDone: false },
  { id: 't4', title: 'Enviar invitaciones', isDone: false },
];

export const demoSlices = buildCategorySlices([
  { categoryId: id(4), name: 'Vivienda', icon: 'house', amount: 1500 },
  { categoryId: id(3), name: 'Despensa', icon: 'shopping-basket', amount: 980 },
  { categoryId: id(1), name: 'Comida', icon: 'utensils', amount: 640 },
  { categoryId: id(2), name: 'Transporte', icon: 'bus', amount: 310 },
  { categoryId: id(5), name: 'Estudio', icon: 'graduation-cap', amount: 199.5 },
]);
