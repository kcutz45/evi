/**
 * historialService.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Trae todo lo que movió el saldo de UNA cuenta: movimientos,
 *            cobros que entraron a ella, transferencias y abonos a metas.
 *
 * POR QUÉ EXISTE: Cada cosa vive en su tabla (§12 de schema.sql). Aquí
 *            se consultan en paralelo y se traducen a un mismo formato
 *            (MovimientoDeCuenta); ordenar y calcular saldos lo hace
 *            lib/historialCuenta.ts. RLS garantiza que solo vengan filas
 *            propias.
 *
 * DEPENDE DE: types/supabase.ts, lib/historialCuenta.ts, lib/dates.ts
 * USADO EN:   hooks/useHistorialCuenta.ts
 * ---------------------------------------------------------------
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { hoyGT } from '@/lib/dates';
import { formatCurrency } from '@/lib/formatCurrency';
import type { MovimientoDeCuenta } from '@/lib/historialCuenta';
import type { Database } from '@/types/supabase';

type Cliente = SupabaseClient<Database>;

// Suficiente para meses de uso; el historial más viejo queda en Dinero.
const LIMITE = 300;

async function movimientos(client: Cliente, id: string): Promise<MovimientoDeCuenta[]> {
  const { data, error } = await client.from('movements')
    .select('id, type, amount, note, occurred_on, created_at, categories(name, icon), events(name), receivables(amount)')
    .eq('account_id', id).order('occurred_on', { ascending: false }).limit(LIMITE);
  if (error) throw new Error('No pudimos cargar el historial.', { cause: error });
  return data.map((f) => {
    const prestado = f.receivables.reduce((s, r) => s + Number(r.amount), 0);
    const categoria = f.categories?.name ?? 'Sin categoría';
    const extra = prestado > 0 ? ` · pagaste todo (tu parte ${formatCurrency(Number(f.amount))})` : '';
    const ingreso = f.type === 'ingreso';
    return {
      id: f.id, tipo: ingreso ? 'ingreso' : 'gasto', fecha: f.occurred_on, creado: f.created_at,
      titulo: f.note ?? categoria, detalle: `${categoria}${f.events ? ` · ${f.events.name}` : ''}${extra}`,
      icono: f.categories?.icon ?? 'circle', monto: ingreso ? Number(f.amount) : -(Number(f.amount) + prestado),
    };
  });
}

async function cobros(client: Cliente, id: string): Promise<MovimientoDeCuenta[]> {
  const { data, error } = await client.from('receivables')
    .select('id, debtor_name, amount, collected_at, movements(note)')
    .eq('collected_account_id', id).eq('status', 'cobrado').limit(LIMITE);
  if (error) throw new Error('No pudimos cargar el historial.', { cause: error });
  return data.flatMap((f) => (f.collected_at ? [{
    id: f.id, tipo: 'cobro' as const, fecha: hoyGT(new Date(f.collected_at)), creado: f.collected_at,
    titulo: `${f.debtor_name} te pagó`, detalle: `Cobro${f.movements?.note ? ` · ${f.movements.note}` : ''} (no es ingreso)`,
    icono: 'hand-coins', monto: Number(f.amount),
  }] : []));
}

async function transferencias(client: Cliente, id: string, nombres: Map<string, string>): Promise<MovimientoDeCuenta[]> {
  const { data, error } = await client.from('account_transfers')
    .select('id, from_account_id, to_account_id, amount, occurred_on, created_at')
    .or(`from_account_id.eq.${id},to_account_id.eq.${id}`).limit(LIMITE);
  if (error) throw new Error('No pudimos cargar el historial.', { cause: error });
  return data.map((f) => {
    const sale = f.from_account_id === id;
    const otra = nombres.get(sale ? f.to_account_id : f.from_account_id) ?? 'otra cuenta';
    return {
      id: f.id, tipo: 'transferencia', fecha: f.occurred_on, creado: f.created_at,
      titulo: sale ? `Transferencia a ${otra}` : `Transferencia de ${otra}`, detalle: 'Entre tus cuentas',
      icono: 'arrow-left-right', monto: sale ? -Number(f.amount) : Number(f.amount),
    };
  });
}

async function abonos(client: Cliente, id: string): Promise<MovimientoDeCuenta[]> {
  const { data, error } = await client.from('savings_contributions')
    .select('id, goal_id, amount, occurred_on, created_at').eq('account_id', id).limit(LIMITE);
  if (error) throw new Error('No pudimos cargar el historial.', { cause: error });
  const ids = [...new Set(data.map((f) => f.goal_id))];
  const { data: metas } = ids.length > 0 ? await client.from('savings_goals').select('id, name').in('id', ids) : { data: [] };
  const nombre = new Map((metas ?? []).map((m) => [m.id, m.name]));
  return data.map((f) => {
    const abono = Number(f.amount) > 0;
    const meta = nombre.get(f.goal_id) ?? 'una meta';
    return {
      id: f.id, tipo: 'meta', fecha: f.occurred_on, creado: f.created_at,
      titulo: abono ? `Abono a ${meta}` : `Retiro de ${meta}`, detalle: abono ? 'Apartado para tu meta' : 'Volvió de tu meta',
      icono: 'piggy-bank', monto: -Number(f.amount),
    };
  });
}

export async function listarHistorialDeCuenta(
  client: Cliente,
  cuentaId: string,
  nombresDeCuentas: Map<string, string>,
): Promise<MovimientoDeCuenta[]> {
  const partes = await Promise.all([
    movimientos(client, cuentaId),
    cobros(client, cuentaId),
    transferencias(client, cuentaId, nombresDeCuentas),
    abonos(client, cuentaId),
  ]);
  return partes.flat();
}
