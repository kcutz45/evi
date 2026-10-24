/**
 * account.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Tipos de "Mis cuentas" (Efectivo, bancos, billeteras):
 *            filas de la base, la vista de saldos y los tipos de
 *            dominio con sus esquemas Zod.
 *
 * POR QUÉ EXISTE: Archivo propio para no pasar las 200 líneas de
 *            database.ts (regla 3). Espeja la sección 12 de schema.sql.
 *
 * USADO EN:   types/supabase.ts, services/accountService.ts, hooks y
 *            componentes de cuentas.
 * ---------------------------------------------------------------
 */
import { z } from 'zod';

export type AccountKind = 'efectivo' | 'banco' | 'digital' | 'otro';

// ---- Filas de la base (snake_case) ----------------------------------
export type AccountRow = {
  id: string;
  user_id: string;
  name: string;
  kind: AccountKind;
  icon: string;
  opening_balance: number;
  archived: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

// Regla 10: user_id viene de auth.uid(); archived solo se cambia al editar.
export type AccountInsert = Pick<AccountRow, 'name'> &
  Partial<Pick<AccountRow, 'kind' | 'icon' | 'opening_balance' | 'metadata'>>;
export type AccountUpdate = Partial<Pick<AccountRow, 'name' | 'kind' | 'icon' | 'opening_balance' | 'archived' | 'metadata'>>;

export type AccountTransferRow = {
  id: string;
  user_id: string;
  from_account_id: string;
  to_account_id: string;
  amount: number;
  occurred_on: string;
  note: string | null;
  created_at: string;
};

export type AccountTransferInsert = Pick<AccountTransferRow, 'from_account_id' | 'to_account_id' | 'amount'> &
  Partial<Pick<AccountTransferRow, 'occurred_on' | 'note'>>;

// Vista vw_account_balances.
export type AccountBalanceRow = {
  account_id: string;
  user_id: string;
  name: string;
  kind: AccountKind;
  icon: string;
  archived: boolean;
  opening_balance: number;
  created_at: string;
  balance: number;
};

// ---- Dominio (lo que usa la interfaz) -------------------------------
export interface Cuenta {
  id: string;
  nombre: string;
  tipo: AccountKind;
  icono: string;
  saldo: number;
  saldoInicial: number;
}

export const NOMBRE_CUENTA_MAX = 40;

// Ícono por tipo: el usuario elige el tipo y el ícono sale solo.
export const TIPOS_DE_CUENTA: Array<{ tipo: AccountKind; etiqueta: string; icono: string }> = [
  { tipo: 'efectivo', etiqueta: 'Efectivo', icono: 'wallet' },
  { tipo: 'banco', etiqueta: 'Banco', icono: 'landmark' },
  { tipo: 'digital', etiqueta: 'Billetera digital', icono: 'smartphone' },
  { tipo: 'otro', etiqueta: 'Otra', icono: 'piggy-bank' },
];

export const nuevaCuentaSchema = z.object({
  nombre: z.string().trim().min(1, 'Escribí el nombre de la cuenta').max(NOMBRE_CUENTA_MAX, `Máximo ${NOMBRE_CUENTA_MAX} caracteres`),
  tipo: z.enum(['efectivo', 'banco', 'digital', 'otro']),
  // Lo que hay hoy en la cuenta. Puede ser 0.
  saldoActual: z.number().min(0, 'El saldo no puede ser negativo'),
});

export type NuevaCuenta = z.infer<typeof nuevaCuentaSchema>;

export const transferenciaSchema = z.object({
  desde: z.string().uuid('Elegí de qué cuenta sale'),
  hacia: z.string().uuid('Elegí a qué cuenta va'),
  monto: z.number().positive('El monto debe ser mayor que Q0'),
}).refine((t) => t.desde !== t.hacia, { message: 'Elegí dos cuentas distintas', path: ['hacia'] });

export type Transferencia = z.infer<typeof transferenciaSchema>;
