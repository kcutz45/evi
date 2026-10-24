/**
 * receivableService.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: "Dividir cuenta / Por cobrar" en Supabase: crear un gasto
 *            dividido, ver cuánto te deben y marcar deudas cobradas.
 *
 * POR QUÉ EXISTE: Única capa que conoce la tabla receivables, la vista
 *            vw_receivables_summary y la RPC create_split_expense
 *            (schema.sql, sección 11). No sabe que React existe (§2.1).
 *
 * REGLA:     El gasto dividido se crea con la RPC (una transacción): o
 *            se guardan el gasto y todas las deudas, o nada.
 *
 * DEPENDE DE: types/supabase.ts, types/receivable.ts
 * USADO EN:   hooks/useMovements.ts, hooks/useReceivables.ts
 * ---------------------------------------------------------------
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { MovementDraft } from '@/types/movement';
import type { Deudor, PorCobrar, ResumenPorCobrar } from '@/types/receivable';
import type { Database } from '@/types/supabase';

type Cliente = SupabaseClient<Database>;

export const SIN_DEUDAS: ResumenPorCobrar = { total: 0, personas: 0 };

// draft.amount es TU parte; los deudores, el resto de la cuenta.
export async function crearGastoDividido(client: Cliente, draft: MovementDraft, deudores: Deudor[]): Promise<void> {
  const { error } = await client.rpc('create_split_expense', {
    p_amount: draft.amount,
    p_category_id: draft.categoryId,
    p_event_id: draft.eventId,
    p_note: draft.note,
    p_debtors: deudores.map((d) => ({ name: d.nombre.trim(), amount: d.monto })),
  });
  if (error) {
    const mensaje = error.message.includes('El evento está cerrado')
      ? 'Ese evento ya se cerró: no acepta gastos nuevos.'
      : 'No pudimos guardar la cuenta dividida. Intentá de nuevo.';
    throw new Error(mensaje, { cause: error });
  }
}

export async function obtenerResumenPorCobrar(client: Cliente): Promise<ResumenPorCobrar> {
  const { data, error } = await client
    .from('vw_receivables_summary')
    .select('pending_total, debtors_count')
    .maybeSingle();
  if (error) throw new Error('No pudimos cargar lo que te deben.', { cause: error });
  if (!data) return SIN_DEUDAS;
  return { total: Number(data.pending_total), personas: Number(data.debtors_count) };
}

export async function listarPorCobrar(client: Cliente): Promise<PorCobrar[]> {
  const { data, error } = await client
    .from('receivables')
    .select('id, debtor_name, amount, status, movements(note, occurred_on, categories(name))')
    .order('created_at', { ascending: false });
  if (error) throw new Error('No pudimos cargar lo que te deben.', { cause: error });
  return data.map((fila) => ({
    id: fila.id,
    nombre: fila.debtor_name,
    monto: Number(fila.amount),
    cobrado: fila.status === 'cobrado',
    // El concepto es la nota del gasto ("Cena en Xela") o su categoría.
    concepto: fila.movements?.note ?? fila.movements?.categories?.name ?? 'Gasto compartido',
    fecha: fila.movements?.occurred_on ?? '',
  }));
}

// Cobrar NO crea un ingreso: solo marca la deuda (regla de la sección 11).
export async function marcarCobrado(client: Cliente, id: string, cobrado: boolean): Promise<void> {
  const { error } = await client
    .from('receivables')
    .update({ status: cobrado ? 'cobrado' : 'pendiente' })
    .eq('id', id);
  if (error) throw new Error('No pudimos actualizar la deuda. Intentá de nuevo.', { cause: error });
}
