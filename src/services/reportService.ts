/**
 * reportService.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Gastos CONFIRMADOS de un mes, con su categoría, para el
 *            reporte mensual.
 *
 * POR QUÉ EXISTE: El reporte sigue la misma regla contable que el
 *            balance (§4d): cuenta por accounting_date y solo lo
 *            confirmado. Así un gasto de evento aparece en el mes en que
 *            se cerró el evento, igual que en vw_monthly_summary.
 *
 * DEPENDE DE: types/supabase.ts
 * USADO EN:   hooks/useMonthlyReport.ts
 * ---------------------------------------------------------------
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { GastoDelMes } from '@/lib/report';
import type { Database } from '@/types/supabase';

type Cliente = SupabaseClient<Database>;

export async function listarGastosConfirmados(
  client: Cliente,
  inicioDeMes: string,
  inicioSiguiente: string,
): Promise<GastoDelMes[]> {
  const { data, error } = await client
    .from('movements')
    .select('amount, category_id, event_id, categories(name, icon)')
    .eq('type', 'egreso')
    .eq('status', 'confirmado')
    .gte('accounting_date', inicioDeMes)
    .lt('accounting_date', inicioSiguiente);
  if (error) throw new Error('No pudimos cargar tu reporte.', { cause: error });
  return data.map((fila) => ({
    amount: Number(fila.amount),
    categoryId: fila.category_id,
    name: fila.categories?.name ?? null,
    icon: fila.categories?.icon ?? null,
    fromEvent: fila.event_id !== null,
  }));
}
