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
import type { MovementDraft, MovementStatus, MovementView } from '@/types/movement';
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

type FilaReciente = Pick<MovementRow, 'id' | 'type' | 'amount' | 'note' | 'occurred_on' | 'status'> & {
  categories: { name: string; icon: string } | null;
  events: { name: string } | null;
};

function toView(fila: FilaReciente): MovementView {
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
  };
}

// Incluye los pendientes de eventos abiertos: el usuario debe verlos con
// su marca "Pendiente" aunque todavía no sumen al balance (regla 4d).
export async function listarRecientes(client: Cliente, limite: number): Promise<MovementView[]> {
  const { data, error } = await client
    .from('movements')
    .select('id, type, amount, note, occurred_on, status, categories(name, icon), events(name)')
    .order('occurred_on', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limite);
  if (error) throw new Error('No pudimos cargar tus movimientos.', { cause: error });
  return data.map(toView);
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
