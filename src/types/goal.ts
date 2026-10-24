/**
 * goal.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Tipos de "Mis metas" (metas de ahorro): filas de los
 *            abonos, tipos de dominio y esquemas Zod.
 *
 * POR QUÉ EXISTE: Archivo propio para no pasar las 200 líneas de
 *            database.ts (regla 3). La fila de savings_goals vive en
 *            database.ts; los abonos son de la sección 12 de schema.sql.
 *
 * USADO EN:   types/supabase.ts, services/goalService.ts, hooks y
 *            componentes de metas.
 * ---------------------------------------------------------------
 */
import { z } from 'zod';
import type { SavingsGoalStatus } from './database';

// ---- Filas de la base (snake_case) ----------------------------------
// amount > 0 = abono; amount < 0 = retiro (vuelve a la cuenta).
export type SavingsContributionRow = {
  id: string;
  user_id: string;
  goal_id: string;
  account_id: string | null;
  amount: number;
  occurred_on: string;
  created_at: string;
};

export type SavingsContributionInsert = Pick<SavingsContributionRow, 'goal_id' | 'amount'> &
  Partial<Pick<SavingsContributionRow, 'account_id' | 'occurred_on'>>;

// ---- Dominio (lo que usa la interfaz) -------------------------------
export interface Meta {
  id: string;
  nombre: string;
  icono: string;
  objetivo: number;
  ahorrado: number;
  fechaLimite: string | null;
  estado: SavingsGoalStatus;
}

export const NOMBRE_META_MAX = 60;

export const ICONOS_META = [
  'piggy-bank', 'plane', 'laptop', 'smartphone', 'graduation-cap', 'car', 'house', 'gift', 'tree-palm', 'heart-pulse',
];

export const nuevaMetaSchema = z.object({
  nombre: z.string().trim().min(1, 'Escribí el nombre de la meta').max(NOMBRE_META_MAX, `Máximo ${NOMBRE_META_MAX} caracteres`),
  icono: z.string().min(1),
  objetivo: z.number().positive('El objetivo debe ser mayor que Q0'),
  fechaLimite: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
});

export type NuevaMeta = z.infer<typeof nuevaMetaSchema>;

export const abonoSchema = z.object({
  metaId: z.string().uuid(),
  cuentaId: z.string().uuid().nullable(),
  // Positivo = abonar; negativo = retirar.
  monto: z.number().refine((m) => m !== 0, 'El monto debe ser mayor que Q0'),
});

export type Abono = z.infer<typeof abonoSchema>;
