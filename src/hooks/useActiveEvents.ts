/**
 * useActiveEvents.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Eventos activos del usuario, para el selector "Asignar a
 *            un evento" del registro de movimiento.
 *
 * DEPENDE DE: services/eventService.ts
 * USADO EN:   app/(dashboard)/inicio/page.tsx
 * ---------------------------------------------------------------
 */
'use client';

import { supabase } from '@/lib/supabase';
import { listarEventosActivos, type EventoOpcion } from '@/services/eventService';
import { useAsyncData } from './useAsyncData';

const SIN_EVENTOS: EventoOpcion[] = [];

export function useActiveEvents() {
  return useAsyncData(() => listarEventosActivos(supabase), SIN_EVENTOS);
}
