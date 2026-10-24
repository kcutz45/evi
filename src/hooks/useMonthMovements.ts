/**
 * useMonthMovements.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Todos los movimientos de un mes, para la pantalla Dinero.
 *
 * POR QUÉ EXISTE: Se cargan una vez por mes; filtrar y agrupar se hace
 *            sobre esta lista (lib/movementList.ts) sin más consultas.
 *
 * DEPENDE DE: services/movementService.ts, lib/dates.ts
 * USADO EN:   app/(dashboard)/dinero/page.tsx
 * ---------------------------------------------------------------
 */
'use client';

import { moverMes } from '@/lib/dates';
import { supabase } from '@/lib/supabase';
import { listarDelMes } from '@/services/movementService';
import type { MovementDetalle } from '@/types/movement';
import { useAsyncData } from './useAsyncData';

const SIN_MOVIMIENTOS: MovementDetalle[] = [];

export function useMonthMovements(inicioDeMes: string) {
  return useAsyncData(
    () => listarDelMes(supabase, inicioDeMes, moverMes(inicioDeMes, 1)),
    SIN_MOVIMIENTOS,
    inicioDeMes,
  );
}
