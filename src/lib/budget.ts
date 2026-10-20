/**
 * budget.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Cálculos puros del presupuesto de un evento.
 *
 * POR QUÉ EXISTE: Las mismas reglas se usan en la tarjeta del evento,
 *            en el detalle y en el modal de cierre. Al ser funciones
 *            puras (sin React ni Supabase) se pueden probar a mano en
 *            la consola y reutilizar en cualquier lado.
 *
 * DEPENDE DE: lib/constants.ts
 * USADO EN:   components/events/*
 * ---------------------------------------------------------------
 */
import { BUDGET_ALERT_THRESHOLD, BUDGET_EXCEEDED_THRESHOLD } from './constants';

export type BudgetStatus = 'ok' | 'alerta' | 'excedido';

// Devuelve una fracción (0.85 = 85%). Puede pasar de 1 si hubo exceso.
export function calculateBudgetUsage(spent: number, planned: number): number {
  if (planned <= 0) return 0;
  return spent / planned;
}

export function getBudgetStatus(usage: number): BudgetStatus {
  if (usage > BUDGET_EXCEEDED_THRESHOLD) return 'excedido';
  if (usage >= BUDGET_ALERT_THRESHOLD) return 'alerta';
  return 'ok';
}

export function toPercent(usage: number): number {
  return Math.round(usage * 100);
}

// Positivo = sobró dinero; negativo = se pasó.
export function remainingBudget(spent: number, planned: number): number {
  return planned - spent;
}
