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
import type { MovementDetalle, MovementView } from '@/types/movement';

// UUID fijos: el esquema Zod del formulario exige UUID válidos.
const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;

// Misma lista que supabase/schema.sql (sección 9).
const CATEGORIAS: Array<[string, string, Category['kind']]> = [
  ['Comida', 'utensils', 'egreso'], ['Transporte', 'bus', 'egreso'], ['Salidas', 'party-popper', 'egreso'],
  ['Despensa', 'shopping-basket', 'egreso'], ['Estudio', 'graduation-cap', 'egreso'],
  ['Salud', 'heart-pulse', 'egreso'], ['Vivienda', 'house', 'egreso'], ['Suscripciones', 'tv', 'egreso'],
  ['Ropa', 'shirt', 'egreso'], ['Regalos', 'gift', 'egreso'], ['Otros', 'ellipsis', 'egreso'],
  ['Salario', 'briefcase', 'ingreso'], ['Freelance', 'laptop', 'ingreso'], ['Ventas', 'tag', 'ingreso'],
  ['Remesas', 'globe', 'ingreso'], ['Mesada', 'wallet', 'ingreso'], ['Regalo', 'gift', 'ingreso'],
  ['Otros ingresos', 'banknote', 'ingreso'],
];

export const demoCategories: Category[] = CATEGORIAS.map(([name, icon, kind], i) => ({
  id: id(i + 1), name, icon, kind,
}));

// Historial simulado: Despensa ×3 y Transporte ×2 aparecen en "Tus frecuentes".
export const demoUsos: string[] = [id(4), id(2), id(4), id(1), id(2), id(4), id(12), id(12)];

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
  { categoryId: id(7), name: 'Vivienda', icon: 'house', amount: 1500 },
  { categoryId: id(4), name: 'Despensa', icon: 'shopping-basket', amount: 980 },
  { categoryId: id(1), name: 'Comida', icon: 'utensils', amount: 640 },
  { categoryId: id(2), name: 'Transporte', icon: 'bus', amount: 310 },
  { categoryId: id(5), name: 'Estudio', icon: 'graduation-cap', amount: 199.5 },
]);

// Mes de ejemplo para la sección "Dinero" de la demo.
const det = (n: number, title: string, cat: number, fecha: string, type: 'ingreso' | 'egreso', amount: number,
  extra: Partial<MovementDetalle> = {}): MovementDetalle => {
  const c = demoCategories[cat - 1];
  return {
    id: `d${n}`, title, categoryName: c?.name ?? 'Sin categoría', categoryIcon: c?.icon ?? 'circle',
    dateLabel: '', type, amount, eventName: null, isPending: false, categoryId: c?.id ?? null,
    eventId: null, note: title, occurredOn: fecha, ...extra,
  };
};

export const demoDetalles: MovementDetalle[] = [
  det(1, '3 almuerzos en Xela', 1, '2026-10-24', 'egreso', 105),
  det(2, 'Decoración', 11, '2026-10-24', 'egreso', 320, { eventName: 'Cumpleaños de Sofía', eventId: id(20), isPending: true }),
  det(3, 'Quincena', 12, '2026-10-23', 'ingreso', 1500),
  det(4, 'Bus a la U', 2, '2026-10-23', 'egreso', 12),
  det(5, 'Súper La Torre', 4, '2026-10-20', 'egreso', 412.75),
  det(6, 'Netflix', 8, '2026-10-15', 'egreso', 79),
];
