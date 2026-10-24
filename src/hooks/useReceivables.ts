/**
 * useReceivables.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Lo que te deben: el total (tarjeta del Inicio) y la lista
 *            de deudas con la acción de marcarlas cobradas.
 *
 * POR QUÉ EXISTE: Frontera entre la interfaz y receivableService (§2.1).
 *            Registra receivable_collected (§4.3): cuánto se recupera de
 *            lo que se presta.
 *
 * DEPENDE DE: services/receivableService.ts, services/telemetryService.ts
 * USADO EN:   app/(dashboard)/inicio/page.tsx, app/(dashboard)/por-cobrar/page.tsx
 * ---------------------------------------------------------------
 */
'use client';

import { useCallback, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  SIN_DEUDAS, listarPorCobrar, marcarCobrado, obtenerResumenPorCobrar,
} from '@/services/receivableService';
import { track } from '@/services/telemetryService';
import type { PorCobrar } from '@/types/receivable';
import { useAsyncData } from './useAsyncData';

const SIN_LISTA: PorCobrar[] = [];

export function useReceivablesSummary() {
  return useAsyncData(() => obtenerResumenPorCobrar(supabase), SIN_DEUDAS);
}

export function useReceivables() {
  const estado = useAsyncData(() => listarPorCobrar(supabase), SIN_LISTA);
  const [ocupadoId, setOcupadoId] = useState<string | null>(null);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);
  const { recargar } = estado;

  // Alterna cobrado/pendiente: "Deshacer" sirve si se tocó por error.
  const alternarCobro = useCallback(
    async (deuda: PorCobrar) => {
      setOcupadoId(deuda.id);
      setErrorAccion(null);
      try {
        await marcarCobrado(supabase, deuda.id, !deuda.cobrado);
        if (!deuda.cobrado) void track('receivable_collected', { amount: deuda.monto });
        recargar();
      } catch (err) {
        setErrorAccion(err instanceof Error ? err.message : 'Ocurrió un error inesperado.');
      } finally {
        setOcupadoId(null);
      }
    },
    [recargar],
  );

  return { ...estado, alternarCobro, ocupadoId, errorAccion };
}
