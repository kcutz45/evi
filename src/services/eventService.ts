/**
 * eventService.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Eventos en Supabase: listarlos con su presupuesto, ver uno,
 *            crearlo y cerrarlo (transfiriendo sus gastos).
 *
 * POR QUÉ EXISTE: Única capa que conoce la tabla `events`, la vista
 *            vw_event_budget y la RPC close_event_and_transfer. No sabe
 *            que React existe (§2.1).
 *
 * REGLA:     El gasto de un evento lo suma la vista (no se suma aquí), y
 *            el cierre es UNA llamada a la RPC atómica: nunca una serie de
 *            updates desde el cliente (§3, 4c).
 *
 * DEPENDE DE: types/supabase.ts, types/event.ts, lib/dates.ts
 * USADO EN:   hooks/useEvents.ts, hooks/useEvento.ts, hooks/useActiveEvents.ts
 * ---------------------------------------------------------------
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { cuentaRegresiva, fechaDeEvento } from '@/lib/dates';
import type { CloseEventResult, EventBudgetRow, EventoDetalle, NuevoEvento } from '@/types/event';
import type { Database } from '@/types/supabase';

type Cliente = SupabaseClient<Database>;

export interface EventoOpcion {
  id: string;
  name: string;
}

// Solo activos: a un evento cerrado la base ya no le acepta gastos.
// Ordenados por fecha: el más próximo aparece primero.
export async function listarEventosActivos(client: Cliente): Promise<EventoOpcion[]> {
  const { data, error } = await client
    .from('events')
    .select('id, name')
    .eq('status', 'activo')
    .order('event_date', { ascending: true });
  if (error) throw new Error('No pudimos cargar tus eventos.', { cause: error });
  return data;
}

function toDetalle(fila: EventBudgetRow): EventoDetalle {
  const countdown = cuentaRegresiva(fila.event_date);
  return {
    id: fila.event_id,
    name: fila.name,
    icon: fila.icon,
    // Activo: "Sáb 14 nov · faltan 9 días". Cerrado: solo la fecha.
    dateLabel: fila.status === 'activo' ? `${fechaDeEvento(fila.event_date)} · ${countdown}` : fechaDeEvento(fila.event_date),
    location: fila.location,
    status: fila.status,
    plannedBudget: Number(fila.planned_budget),
    spentAmount: Number(fila.spent_amount),
    expensesCount: Number(fila.expenses_count),
    tasksDone: Number(fila.tasks_done),
    tasksTotal: Number(fila.tasks_total),
    eventDate: fila.event_date,
    countdown,
    closedAt: fila.closed_at,
  };
}

// Activos primero (el más próximo arriba); cerrados después (el último cerrado arriba).
export async function listarEventos(client: Cliente): Promise<EventoDetalle[]> {
  const { data, error } = await client.from('vw_event_budget').select('*').order('event_date', { ascending: true });
  if (error) throw new Error('No pudimos cargar tus eventos.', { cause: error });
  const eventos = data.map(toDetalle);
  const activos = eventos.filter((e) => e.status === 'activo');
  const cerrados = eventos.filter((e) => e.status === 'cerrado').sort((a, b) => (b.closedAt ?? '').localeCompare(a.closedAt ?? ''));
  return [...activos, ...cerrados];
}

export async function obtenerEvento(client: Cliente, id: string): Promise<EventoDetalle | null> {
  const { data, error } = await client.from('vw_event_budget').select('*').eq('event_id', id).maybeSingle();
  if (error) throw new Error('No pudimos cargar el evento.', { cause: error });
  return data ? toDetalle(data) : null;
}

// user_id lo pone la base (DEFAULT auth.uid()); status nace 'activo'.
export async function crearEvento(client: Cliente, nuevo: NuevoEvento): Promise<string> {
  const { data, error } = await client
    .from('events')
    .insert({
      name: nuevo.name,
      icon: nuevo.icon,
      event_date: nuevo.eventDate,
      location: nuevo.location,
      planned_budget: nuevo.plannedBudget,
    })
    .select('id')
    .single();
  if (error) throw new Error('No pudimos crear el evento. Intentá de nuevo.', { cause: error });
  return data.id;
}

// Cierra y pasa los gastos pendientes a tus finanzas, en UNA transacción.
export async function cerrarEvento(client: Cliente, id: string): Promise<CloseEventResult> {
  const { data, error } = await client.rpc('close_event_and_transfer', { p_event_id: id });
  if (error) {
    const yaCerrado = error.message.includes('ya está cerrado');
    throw new Error(yaCerrado ? 'Este evento ya estaba cerrado.' : 'No pudimos cerrar el evento. Intentá de nuevo.', { cause: error });
  }
  return {
    planned: Number(data.planned),
    actual: Number(data.actual),
    variance: Number(data.variance),
    expensesCount: Number(data.expenses_count),
    totalAmount: Number(data.total_amount),
    targetMonth: data.target_month,
  };
}
