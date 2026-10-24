/**
 * useEvents.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Lista de eventos del usuario (activos y cerrados) y la
 *            acción para crear uno nuevo.
 *
 * POR QUÉ EXISTE: Frontera entre la pantalla Eventos y eventService
 *            (§2.1). Valida con Zod antes de crear y registra
 *            event_created (§4.3).
 *
 * DEPENDE DE: services/eventService.ts, services/telemetryService.ts
 * USADO EN:   app/(dashboard)/eventos/page.tsx
 * ---------------------------------------------------------------
 */
'use client';

import { useCallback, useState } from 'react';
import { differenceInCalendarDays, parseISO } from 'date-fns';
import { hoyGT } from '@/lib/dates';
import { supabase } from '@/lib/supabase';
import { crearEvento, listarEventos } from '@/services/eventService';
import { track } from '@/services/telemetryService';
import { nuevoEventoSchema, type EventoDetalle, type NuevoEvento } from '@/types/event';
import { useAsyncData } from './useAsyncData';

const SIN_EVENTOS: EventoDetalle[] = [];

export function useEvents() {
  const estado = useAsyncData(() => listarEventos(supabase), SIN_EVENTOS);
  const [creando, setCreando] = useState(false);
  const [errorCrear, setErrorCrear] = useState<string | null>(null);

  // Devuelve el id del evento creado, o null si hubo un error.
  const crear = useCallback(async (datos: NuevoEvento): Promise<string | null> => {
    const parsed = nuevoEventoSchema.safeParse(datos);
    if (!parsed.success) {
      setErrorCrear(parsed.error.issues[0]?.message ?? 'Revisá los datos');
      return null;
    }
    setCreando(true);
    setErrorCrear(null);
    try {
      const id = await crearEvento(supabase, parsed.data);
      void track('event_created', {
        planned_budget: parsed.data.plannedBudget,
        days_until_event: differenceInCalendarDays(parseISO(parsed.data.eventDate), parseISO(hoyGT())),
        has_checklist: false,
      });
      return id;
    } catch (err) {
      setErrorCrear(err instanceof Error ? err.message : 'No pudimos crear el evento.');
      return null;
    } finally {
      setCreando(false);
    }
  }, []);

  return { ...estado, crear, creando, errorCrear };
}
