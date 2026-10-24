/**
 * useMonthlySummary.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Balance, ingresos y egresos de un mes (por defecto, el
 *            actual en Guatemala).
 *
 * POR QUÉ EXISTE: BalanceCard y Dinero solo pintan números; este hook
 *            decide "qué mes" y se los pide al servicio. Al cambiar el
 *            mes, vuelve a cargar solo.
 *
 * DEPENDE DE: services/movementService.ts, lib/dates.ts
 * USADO EN:   app/(dashboard)/inicio/page.tsx, app/(dashboard)/dinero/page.tsx
 * ---------------------------------------------------------------
 */
'use client';

import { supabase } from '@/lib/supabase';
import { inicioDeMesGT } from '@/lib/dates';
import { RESUMEN_VACIO, obtenerResumenDelMes } from '@/services/movementService';
import { useAsyncData } from './useAsyncData';

export function useMonthlySummary(inicioDeMes: string = inicioDeMesGT()) {
  const estado = useAsyncData(() => obtenerResumenDelMes(supabase, inicioDeMes), RESUMEN_VACIO, inicioDeMes);
  return { ...estado, inicioDeMes };
}
