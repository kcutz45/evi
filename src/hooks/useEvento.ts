/**
 * useEvento.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Un evento con su presupuesto y sus gastos, y la acción de
 *            CERRARLO (transferir sus gastos a tus finanzas).
 *
 * POR QUÉ EXISTE: Es el flujo que define el producto (§0). El cierre es
 *            una sola llamada a la RPC atómica; este hook registra
 *            event_closed y expenses_transferred (§4.3) y avisa
 *            budget_alert_shown una sola vez por visita.
 *
 * DEPENDE DE: services/eventService.ts, services/movementService.ts,
 *            services/telemetryService.ts, lib/budget.ts
 * USADO EN:   app/(dashboard)/eventos/[id]/page.tsx
 * ---------------------------------------------------------------
 */
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { calculateBudgetUsage, getBudgetStatus, toPercent } from '@/lib/budget';
import { supabase } from '@/lib/supabase';
import { cerrarEvento, obtenerEvento } from '@/services/eventService';
import { listarDelEvento } from '@/services/movementService';
import { track } from '@/services/telemetryService';
import type { EventoDetalle } from '@/types/event';
import type { MovementDetalle } from '@/types/movement';
import { useAsyncData } from './useAsyncData';

const SIN_GASTOS: MovementDetalle[] = [];

// budget_alert_shown / budget_exceeded: una vez por visita al evento.
function useAvisoDePresupuesto(evento: EventoDetalle | null) {
  const avisado = useRef(false);
  useEffect(() => {
    if (!evento || evento.status !== 'activo' || avisado.current) return;
    const uso = calculateBudgetUsage(evento.spentAmount, evento.plannedBudget);
    const estado = getBudgetStatus(uso);
    if (estado === 'ok') return;
    avisado.current = true;
    void track('budget_alert_shown', { event_id: evento.id, usage_pct: toPercent(uso) });
    if (estado === 'excedido') void track('budget_exceeded', { overspend_amount: evento.spentAmount - evento.plannedBudget });
  }, [evento]);
}

export function useEvento(id: string) {
  const evento = useAsyncData(() => obtenerEvento(supabase, id), null as EventoDetalle | null, id);
  const gastos = useAsyncData(() => listarDelEvento(supabase, id), SIN_GASTOS, id);
  const [cerrando, setCerrando] = useState(false);
  const [errorCierre, setErrorCierre] = useState<string | null>(null);
  const { recargar: recargarEvento } = evento;
  const { recargar: recargarGastos } = gastos;
  useAvisoDePresupuesto(evento.data);

  const cerrar = useCallback(async () => {
    setCerrando(true);
    setErrorCierre(null);
    try {
      const r = await cerrarEvento(supabase, id);
      void track('event_closed', { planned: r.planned, actual: r.actual, variance: r.variance, expenses_count: r.expensesCount });
      void track('expenses_transferred', { expenses_count: r.expensesCount, total_amount: r.totalAmount, target_month: r.targetMonth });
      recargarEvento();
      recargarGastos();
      return true;
    } catch (err) {
      setErrorCierre(err instanceof Error ? err.message : 'No pudimos cerrar el evento.');
      return false;
    } finally {
      setCerrando(false);
    }
  }, [id, recargarEvento, recargarGastos]);

  const recargar = useCallback(() => {
    recargarEvento();
    recargarGastos();
  }, [recargarEvento, recargarGastos]);

  return { evento, gastos, cerrar, cerrando, errorCierre, limpiarErrorCierre: () => setErrorCierre(null), recargar };
}
