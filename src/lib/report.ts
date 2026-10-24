/**
 * report.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Cálculos del reporte mensual: totales por categoría,
 *            porciones de la dona, comparación con el mes anterior y
 *            promedio diario.
 *
 * POR QUÉ EXISTE: Ordenar, sumar, calcular porcentajes y asignar colores
 *            es lógica de negocio; los componentes solo reciben el
 *            resultado. Funciones puras: se prueban sin base de datos.
 *
 * DEPENDE DE: styles/tokens.ts, date-fns
 * USADO EN:   hooks/useMonthlyReport.ts, app/demo
 * ---------------------------------------------------------------
 */
import { differenceInCalendarDays, getDaysInMonth, parseISO } from 'date-fns';
import { chartPalette } from '@/styles/tokens';
import type { CategorySlice } from '@/types/category';

export interface CategoryTotal {
  categoryId: string;
  name: string;
  icon: string;
  amount: number;
}

// Un gasto confirmado tal como lo entrega reportService.
export interface GastoDelMes {
  amount: number;
  categoryId: string | null;
  name: string | null;
  icon: string | null;
  fromEvent: boolean;
}

const SIN_CATEGORIA: Omit<CategoryTotal, 'amount'> = { categoryId: 'sin-categoria', name: 'Sin categoría', icon: 'ellipsis' };

export function totalesPorCategoria(gastos: GastoDelMes[]): CategoryTotal[] {
  const porId = new Map<string, CategoryTotal>();
  for (const g of gastos) {
    const base = g.categoryId ? { categoryId: g.categoryId, name: g.name ?? SIN_CATEGORIA.name, icon: g.icon ?? SIN_CATEGORIA.icon } : SIN_CATEGORIA;
    const actual = porId.get(base.categoryId);
    porId.set(base.categoryId, { ...base, amount: (actual?.amount ?? 0) + g.amount });
  }
  return [...porId.values()];
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

export interface Comparacion {
  diferencia: number;
  // true = gastaste MÁS que el mes anterior (se pinta dorado, nunca rojo).
  subio: boolean;
}

// null si el mes anterior no tiene gastos: no hay contra qué comparar.
export function compararConAnterior(total: number, anterior: number): Comparacion | null {
  if (anterior <= 0) return null;
  const diferencia = total - anterior;
  return { diferencia: Math.abs(diferencia), subio: diferencia > 0 };
}

// En el mes en curso se divide entre los días que ya pasaron; en un mes
// pasado, entre todos sus días.
export function promedioDiario(monto: number, inicioDeMes: string, hoy: string): number {
  const inicio = parseISO(inicioDeMes);
  const enCurso = hoy.slice(0, 7) === inicioDeMes.slice(0, 7);
  const dias = enCurso ? differenceInCalendarDays(parseISO(hoy), inicio) + 1 : getDaysInMonth(inicio);
  return monto / Math.max(1, dias);
}
