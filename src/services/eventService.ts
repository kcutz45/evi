/**
 * eventService.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Lectura y escritura de eventos en Supabase.
 *
 * POR QUÉ EXISTE: Única capa que conoce la tabla `events`. Por ahora
 *            solo lista los activos para el selector "Asignar a un
 *            evento" del registro; el resto llega con la pantalla de
 *            eventos (§3, pantalla 4).
 *
 * DEPENDE DE: types/supabase.ts
 * USADO EN:   hooks/useActiveEvents.ts
 * ---------------------------------------------------------------
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

export interface EventoOpcion {
  id: string;
  name: string;
}

// Solo activos: a un evento cerrado la base ya no le acepta gastos.
// Ordenados por fecha: el más próximo aparece primero.
export async function listarEventosActivos(client: SupabaseClient<Database>): Promise<EventoOpcion[]> {
  const { data, error } = await client
    .from('events')
    .select('id, name')
    .eq('status', 'activo')
    .order('event_date', { ascending: true });
  if (error) throw new Error('No pudimos cargar tus eventos.', { cause: error });
  return data;
}
