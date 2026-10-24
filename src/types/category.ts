/**
 * category.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Tipos de las categorías, del desglose del reporte mensual
 *            y el esquema Zod para crear una categoría propia.
 *
 * USADO EN:   components/finance/registro/PasoCategoria.tsx, MonthlyChart.tsx
 * ---------------------------------------------------------------
 */
import { z } from 'zod';
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

// ---- Crear una categoría propia ("Mis categorías", aprobada 24/10/2026) ----
export const NOMBRE_CATEGORIA_MAX = 40;

export const nuevaCategoriaSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Escribí un nombre')
    .max(NOMBRE_CATEGORIA_MAX, `Máximo ${NOMBRE_CATEGORIA_MAX} letras`),
  icon: z.string().min(1, 'Elegí un ícono'),
  kind: z.enum(['ingreso', 'egreso']),
});

export type NuevaCategoria = z.infer<typeof nuevaCategoriaSchema>;
