/**
 * receivable.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Tipos de "Dividir cuenta / Por cobrar": las filas de la
 *            tabla receivables, la vista del total y los tipos de
 *            dominio que usa la interfaz.
 *
 * POR QUÉ EXISTE: Archivo propio para no pasar las 200 líneas de
 *            database.ts (regla 3). Espeja la sección 11 de schema.sql.
 *
 * USADO EN:   types/supabase.ts, services/receivableService.ts, hooks y
 *            componentes de por cobrar.
 * ---------------------------------------------------------------
 */

export type ReceivableStatus = 'pendiente' | 'cobrado';

// ---- Filas de la base (snake_case) ----------------------------------
export type ReceivableRow = {
  id: string;
  user_id: string;
  movement_id: string;
  debtor_name: string;
  amount: number;
  status: ReceivableStatus;
  collected_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

// Regla 10: collected_at lo pone el trigger; user_id viene de auth.uid().
export type ReceivableInsert = Pick<ReceivableRow, 'movement_id' | 'debtor_name' | 'amount'> &
  Partial<Pick<ReceivableRow, 'metadata'>>;
export type ReceivableUpdate = Partial<Pick<ReceivableRow, 'debtor_name' | 'amount' | 'status' | 'metadata'>>;

export type ReceivablesSummaryRow = {
  user_id: string;
  pending_total: number;
  pending_count: number;
  debtors_count: number;
};

// ---- Dominio (lo que usa la interfaz) -------------------------------

// Una persona y su parte, al dividir una cuenta en el registro.
export interface Deudor {
  nombre: string;
  monto: number;
}

// Una deuda en la pantalla "Te deben".
export interface PorCobrar {
  id: string;
  nombre: string;
  monto: number;
  cobrado: boolean;
  concepto: string;
  fecha: string;
}

export interface ResumenPorCobrar {
  total: number;
  personas: number;
}
