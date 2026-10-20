/**
 * report.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Convierte los totales por categoría en porciones de la
 *            dona del reporte mensual.
 *
 * POR QUÉ EXISTE: Ordenar, calcular porcentajes y asignar colores es
 *            lógica de negocio; MonthlyChart solo recibe el resultado.
 *
 * DEPENDE DE: styles/tokens.ts
 * USADO EN:   hooks/useMonthlyReport.ts
 * ---------------------------------------------------------------
 */
import { chartPalette } from '@/styles/tokens';
import type { CategorySlice } from '@/types/category';

export interface CategoryTotal {
  categoryId: string;
  name: string;
  icon: string;
  amount: number;
}

export function buildCategorySlices(totals: CategoryTotal[]): CategorySlice[] {
  const grandTotal = totals.reduce((sum, t) => sum + t.amount, 0);
  if (grandTotal <= 0) return [];

  // De mayor a menor: la categoría principal siempre lleva el color de marca.
  return [...totals]
    .sort((a, b) => b.amount - a.amount)
    .map((total, index) => ({
      ...total,
      share: total.amount / grandTotal,
      color: chartPalette[index % chartPalette.length] ?? chartPalette[0],
    }));
}
