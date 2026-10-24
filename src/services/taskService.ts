/**
 * taskService.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Tareas (checklist) de un evento: listar, agregar, marcar y
 *            borrar.
 *
 * POR QUÉ EXISTE: Única capa que conoce `event_tasks`. La pertenencia se
 *            hereda del evento (RLS con EXISTS): no hace falta user_id.
 *            completed_at lo llena un trigger al marcar la tarea.
 *
 * DEPENDE DE: types/supabase.ts, types/event.ts
 * USADO EN:   hooks/useEventTasks.ts
 * ---------------------------------------------------------------
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { EventTask } from '@/types/event';
import type { Database } from '@/types/supabase';

type Cliente = SupabaseClient<Database>;

export const TITULO_TAREA_MAX = 120;

export async function listarTareas(client: Cliente, eventoId: string): Promise<EventTask[]> {
  const { data, error } = await client
    .from('event_tasks')
    .select('id, title, is_done')
    .eq('event_id', eventoId)
    .order('position')
    .order('created_at');
  if (error) throw new Error('No pudimos cargar las tareas.', { cause: error });
  return data.map((t) => ({ id: t.id, title: t.title, isDone: t.is_done }));
}

// position = cantidad actual: la nueva va al final de la lista.
export async function crearTarea(client: Cliente, eventoId: string, titulo: string, posicion: number): Promise<EventTask> {
  const { data, error } = await client
    .from('event_tasks')
    .insert({ event_id: eventoId, title: titulo.trim(), position: posicion })
    .select('id, title, is_done')
    .single();
  if (error) throw new Error('No pudimos agregar la tarea.', { cause: error });
  return { id: data.id, title: data.title, isDone: data.is_done };
}

export async function marcarTarea(client: Cliente, id: string, hecha: boolean): Promise<void> {
  const { error } = await client.from('event_tasks').update({ is_done: hecha }).eq('id', id);
  if (error) throw new Error('No pudimos actualizar la tarea.', { cause: error });
}

export async function eliminarTarea(client: Cliente, id: string): Promise<void> {
  const { error } = await client.from('event_tasks').delete().eq('id', id);
  if (error) throw new Error('No pudimos borrar la tarea.', { cause: error });
}
