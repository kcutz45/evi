/**
 * category.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Tipos de las categorías y del desglose del reporte mensual.
 *
 * USADO EN:   components/finance/registro/PasoCategoria.tsx, MonthlyChart.tsx
 * ---------------------------------------------------------------
 */
import type { MovementType } from './movement';

export interface Category {
  id: string;
  name: string;
  // Nombre de ícono de Lucide guardado en la base (ej. 'utensils').
  icon: string;
  kind: MovementType;
}

// Una porción de la dona del reporte, ya calculada por lib/report.ts.
export interface CategorySlice {
  categoryId: string;
  name: string;
  icon: string;
  amount: number;
  share: number;
  color: string;
}
