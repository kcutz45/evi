/**
 * useMonthlySummary.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Balance, ingresos y egresos del mes actual (Guatemala).
 *
 * POR QUÉ EXISTE: BalanceCard solo pinta números; este hook decide
 *            "qué mes" y se los pide al servicio.
 *
 * DEPENDE DE: services/movementService.ts, lib/dates.ts
 * USADO EN:   app/(dashboard)/inicio/page.tsx
 * ---------------------------------------------------------------
 */
'use client';

import { supabase } from '@/lib/supabase';
import { inicioDeMesGT } from '@/lib/dates';
import { RESUMEN_VACIO, obtenerResumenDelMes } from '@/services/movementService';
import { useAsyncData } from './useAsyncData';

export function useMonthlySummary() {
  const inicioDeMes = inicioDeMesGT();
  const estado = useAsyncData(() => obtenerResumenDelMes(supabase, inicioDeMes), RESUMEN_VACIO);
  return { ...estado, inicioDeMes };
}
