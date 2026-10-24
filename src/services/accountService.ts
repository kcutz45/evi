/**
 * accountService.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: "Mis cuentas": listar con su saldo, crear, ajustar el
 *            saldo, archivar y transferir entre cuentas.
 *
 * POR QUÉ EXISTE: Única capa que conoce accounts, account_transfers y
 *            vw_account_balances. El saldo lo calcula la vista (§12 de
 *            schema.sql), nunca el cliente. Ajustar el saldo cambia el
 *            saldo inicial: así no se inventa un ingreso ni un gasto.
 *
 * DEPENDE DE: types/supabase.ts, types/account.ts
 * USADO EN:   hooks/useAccounts.ts
 * ---------------------------------------------------------------
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { TIPOS_DE_CUENTA, type Cuenta, type NuevaCuenta, type Transferencia } from '@/types/account';
import type { Database } from '@/types/supabase';

type Cliente = SupabaseClient<Database>;

const DUPLICADA = '23505';

export async function listarCuentas(client: Cliente): Promise<Cuenta[]> {
  const { data, error } = await client
    .from('vw_account_balances')
    .select('account_id, name, kind, icon, opening_balance, balance')
    .eq('archived', false)
    .order('created_at');
  if (error) throw new Error('No pudimos cargar tus cuentas.', { cause: error });
  return data.map((f) => ({
    id: f.account_id,
    nombre: f.name,
    tipo: f.kind,
    icono: f.icon,
    saldo: Number(f.balance),
    saldoInicial: Number(f.opening_balance),
  }));
}

// Al crear, "lo que tenés hoy" es el saldo inicial.
export async function crearCuenta(client: Cliente, nueva: NuevaCuenta): Promise<string> {
  const icono = TIPOS_DE_CUENTA.find((t) => t.tipo === nueva.tipo)?.icono ?? 'wallet';
  const { data, error } = await client
    .from('accounts')
    .insert({ name: nueva.nombre.trim(), kind: nueva.tipo, icon: icono, opening_balance: nueva.saldoActual })
    .select('id')
    .single();
  if (error?.code === DUPLICADA) throw new Error('Ya tenés una cuenta con ese nombre.', { cause: error });
  if (error) throw new Error('No pudimos crear la cuenta.', { cause: error });
  return data.id;
}

// "Hoy tengo Q800 aquí": mueve el saldo inicial para que el saldo
// calculado quede igual a lo que el usuario dice tener.
export async function ajustarSaldo(client: Cliente, cuenta: Cuenta, saldoReal: number): Promise<void> {
  const nuevoInicial = cuenta.saldoInicial + (saldoReal - cuenta.saldo);
  const { error } = await client.from('accounts').update({ opening_balance: nuevoInicial }).eq('id', cuenta.id);
  if (error) throw new Error('No pudimos ajustar el saldo.', { cause: error });
}

// Archivar en vez de borrar: sus movimientos viejos conservan la cuenta.
export async function archivarCuenta(client: Cliente, id: string): Promise<void> {
  const { error } = await client.from('accounts').update({ archived: true }).eq('id', id);
  if (error) throw new Error('No pudimos quitar la cuenta.', { cause: error });
}

export async function transferir(client: Cliente, t: Transferencia): Promise<void> {
  const { error } = await client
    .from('account_transfers')
    .insert({ from_account_id: t.desde, to_account_id: t.hacia, amount: t.monto });
  if (error) throw new Error('No pudimos hacer la transferencia.', { cause: error });
}
