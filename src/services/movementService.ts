/**
 * movementService.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Balance del mes, últimos movimientos y registro de un
 *            movimiento nuevo.
 *
 * POR QUÉ EXISTE: Es la única capa que sabe que el balance sale de la
 *            vista vw_monthly_summary y los movimientos de `movements`
 *            (snake_case). Devuelve tipos de dominio. No sabe que React
 *            existe (§2.1).
 *
 * REGLA:     El balance NO se suma aquí: lo calcula la vista en la base
 *            (§3, pantalla 3). status y accounting_date tampoco se
 *            envían: los decide el trigger movements_accounting.
 *
 * DEPENDE DE: types/supabase.ts, types/movement.ts, lib/dates.ts
 * USADO EN:   hooks/useMonthlySummary.ts, hooks/useMovements.ts
 * ---------------------------------------------------------------
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { etiquetaDeDia } from '@/lib/dates';
import type { MovementRow } from '@/types/database';
import type { MovementDetalle, MovementDraft, MovementStatus, MovementView } from '@/types/movement';
import type { Database } from '@/types/supabase';

type Cliente = SupabaseClient<Database>;

export interface ResumenMensual {
  income: number;
  expense: number;
  balance: number;
}

export const RESUMEN_VACIO: ResumenMensual = { income: 0, expense: 0, balance: 0 };

// Sin fila para el mes = todavía no hay movimientos confirmados.
export async function obtenerResumenDelMes(client: Cliente, inicioDeMes: string): Promise<ResumenMensual> {
  const { data, error } = await client
    .from('vw_monthly_summary')
    .select('income, expense, balance')
    .eq('month', inicioDeMes)
    .maybeSingle();
  if (error) throw new Error('No pudimos cargar tu balance del mes.', { cause: error });
  if (!data) return RESUMEN_VACIO;
  // Number(): PostgREST puede enviar numeric como texto si es muy grande.
  return { income: Number(data.income), expense: Number(data.expense), balance: Number(data.balance) };
}

type FilaMovimiento = Pick<
  MovementRow,
  'id' | 'type' | 'amount' | 'note' | 'occurred_on' | 'status' | 'category_id' | 'event_id'
> & {
  categories: { name: string; icon: string } | null;
  events: { name: string } | null;
  receivables: Array<{ debtor_name: string; amount: number; status: string }>;
};

function toDetalle(fila: FilaMovimiento): MovementDetalle {
  const categoria = fila.categories;
  return {
    id: fila.id,
    // Sin nota, el título es la categoría: "Comida" se entiende solo.
    title: fila.note ?? categoria?.name ?? (fila.type === 'ingreso' ? 'Ingreso' : 'Gasto'),
    categoryName: categoria?.name ?? 'Sin categoría',
    categoryIcon: categoria?.icon ?? 'circle',
    dateLabel: etiquetaDeDia(fila.occurred_on),
    type: fila.type,
    amount: Number(fila.amount),
    eventName: fila.events?.name ?? null,
    isPending: fila.status === 'pendiente',
    categoryId: fila.category_id,
    eventId: fila.event_id,
    note: fila.note,
    occurredOn: fila.occurred_on,
    porCobrar: fila.receivables.map((r) => ({
      nombre: r.debtor_name, monto: Number(r.amount), cobrado: r.status === 'cobrado',
    })),
  };
}

// Un solo texto literal: si se parte con +, supabase-js pierde el tipo de la fila.
const COLUMNAS_LISTA =
  'id, type, amount, note, occurred_on, status, category_id, event_id, categories(name, icon), events(name), receivables(debtor_name, amount, status)';

// Incluye los pendientes de eventos abiertos: el usuario debe verlos con
// su marca "Pendiente" aunque todavía no sumen al balance (regla 4d).
export async function listarRecientes(client: Cliente, limite: number): Promise<MovementView[]> {
  const { data, error } = await client
    .from('movements')
    .select(COLUMNAS_LISTA)
    .order('occurred_on', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limite);
  if (error) throw new Error('No pudimos cargar tus movimientos.', { cause: error });
  return data.map(toDetalle);
}

// category_id de los últimos movimientos, para "Tus frecuentes". Solo
// ids: el conteo lo hace lib/categoryRanking.ts (no es dinero, así que
// no aplica la regla de "sumar en la base").
export async function listarUsoDeCategorias(client: Cliente, limite: number): Promise<string[]> {
  const { data, error } = await client
    .from('movements')
    .select('category_id')
    .not('category_id', 'is', null)
    .order('created_at', { ascending: false })
    .limit(limite);
  if (error) throw new Error('No pudimos cargar tus categorías frecuentes.', { cause: error });
  return data.flatMap((fila) => (fila.category_id ? [fila.category_id] : []));
}

// El trigger de la base lanza este texto si el evento ya se cerró.
const ERROR_EVENTO_CERRADO = 'El evento está cerrado';

export async function crearMovimiento(client: Cliente, draft: MovementDraft): Promise<MovementStatus> {
  const { data, error } = await client
    .from('movements')
    .insert({
      type: draft.type,
      amount: draft.amount,
      category_id: draft.categoryId,
      event_id: draft.eventId,
      note: draft.note,
    })
    .select('status')
    .single();
  if (error) {
    const mensaje = error.message.includes(ERROR_EVENTO_CERRADO)
      ? 'Ese evento ya se cerró: no acepta gastos nuevos.'
      : 'No pudimos guardar el movimiento. Intentá de nuevo.';
    throw new Error(mensaje, { cause: error });
  }
  return data.status;
}

// Movimientos que OCURRIERON en el mes (occurred_on), para Dinero. Los
// pendientes de eventos aparecen con su marca aunque no sumen al balance.
export async function listarDelMes(client: Cliente, inicioDeMes: string, inicioSiguiente: string): Promise<MovementDetalle[]> {
  const { data, error } = await client
    .from('movements')
    .select(COLUMNAS_LISTA)
    .gte('occurred_on', inicioDeMes)
    .lt('occurred_on', inicioSiguiente)
    .order('occurred_on', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw new Error('No pudimos cargar los movimientos del mes.', { cause: error });
  return data.map(toDetalle);
}

// Solo columnas que el usuario decide (regla 10). Si cambia el evento o
// la fecha, el trigger recalcula status y accounting_date.
export async function actualizarMovimiento(client: Cliente, id: string, draft: MovementDraft): Promise<void> {
  const { error } = await client
    .from('movements')
    .update({
      type: draft.type,
      amount: draft.amount,
      category_id: draft.categoryId,
      event_id: draft.eventId,
      note: draft.note,
    })
    .eq('id', id);
  if (error) {
    const mensaje = error.message.includes(ERROR_EVENTO_CERRADO)
      ? 'Ese evento ya se cerró: no se le pueden mover gastos.'
      : 'No pudimos guardar los cambios. Intentá de nuevo.';
    throw new Error(mensaje, { cause: error });
  }
}

export async function eliminarMovimiento(client: Cliente, id: string): Promise<void> {
  const { error } = await client.from('movements').delete().eq('id', id);
  if (error) throw new Error('No pudimos eliminar el movimiento. Intentá de nuevo.', { cause: error });
}

// Gastos (e ingresos) asignados a un evento, para la pestaña "Gastos".
export async function listarDelEvento(client: Cliente, eventoId: string): Promise<MovementDetalle[]> {
  const { data, error } = await client
    .from('movements')
    .select(COLUMNAS_LISTA)
    .eq('event_id', eventoId)
    .order('occurred_on', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw new Error('No pudimos cargar los gastos del evento.', { cause: error });
  return data.map(toDetalle);
}
