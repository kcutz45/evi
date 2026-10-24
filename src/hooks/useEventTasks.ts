/**
 * useEventTasks.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Checklist de un evento: listar, agregar, marcar y borrar
 *            tareas.
 *
 * POR QUÉ EXISTE: Marcar una tarea debe sentirse instantáneo: se cambia
 *            en pantalla primero y se guarda después; si falla, se
 *            vuelve atrás y se muestra el error. Registra
 *            event_task_completed (§4.3).
 *
 * DEPENDE DE: services/taskService.ts, services/telemetryService.ts
 * USADO EN:   app/(dashboard)/eventos/[id]/page.tsx
 * ---------------------------------------------------------------
 */
'use client';

import { useCallback, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { crearTarea, eliminarTarea, listarTareas, marcarTarea } from '@/services/taskService';
import { track } from '@/services/telemetryService';
import type { EventTask } from '@/types/event';
import { useAsyncData } from './useAsyncData';

const SIN_TAREAS: EventTask[] = [];

const mensaje = (err: unknown, porDefecto: string) => (err instanceof Error ? err.message : porDefecto);

export function useEventTasks(eventoId: string) {
  const estado = useAsyncData(() => listarTareas(supabase, eventoId), SIN_TAREAS, eventoId);
  const [errorTarea, setErrorTarea] = useState<string | null>(null);
  const { data: tareas, establecer } = estado;

  const alternar = useCallback(async (id: string, hecha: boolean) => {
    const nuevas = tareas.map((t) => (t.id === id ? { ...t, isDone: hecha } : t));
    establecer(nuevas);
    setErrorTarea(null);
    try {
      await marcarTarea(supabase, id, hecha);
      const hechas = nuevas.filter((t) => t.isDone).length;
      if (hecha) void track('event_task_completed', { event_id: eventoId, tasks_done: hechas, tasks_total: nuevas.length });
    } catch (err) {
      establecer(tareas);
      setErrorTarea(mensaje(err, 'No pudimos actualizar la tarea.'));
    }
  }, [tareas, establecer, eventoId]);

  const agregar = useCallback(async (titulo: string) => {
    if (!titulo.trim()) return false;
    setErrorTarea(null);
    try {
      const nueva = await crearTarea(supabase, eventoId, titulo, tareas.length);
      establecer((actuales) => [...actuales, nueva]);
      return true;
    } catch (err) {
      setErrorTarea(mensaje(err, 'No pudimos agregar la tarea.'));
      return false;
    }
  }, [eventoId, tareas.length, establecer]);

  const borrar = useCallback(async (id: string) => {
    try {
      await eliminarTarea(supabase, id);
      establecer((actuales) => actuales.filter((t) => t.id !== id));
    } catch (err) {
      setErrorTarea(mensaje(err, 'No pudimos borrar la tarea.'));
    }
  }, [establecer]);

  return { ...estado, alternar, agregar, borrar, errorTarea };
}
