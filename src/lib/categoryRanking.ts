/**
 * categoryRanking.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Separa las categorías en "Tus frecuentes" y "Todas" según
 *            lo que el usuario registra de verdad.
 *
 * POR QUÉ EXISTE: El registro se adapta al comportamiento de cada uno
 *            sin que tenga que configurar nada: si siempre registra
 *            Comida y Transporte, esas aparecen primero (un toque menos
 *            de búsqueda). Función pura: recibe los datos ya cargados.
 *
 * DEPENDE DE: lib/constants.ts
 * USADO EN:   components/finance/registro/PasoCategoria.tsx
 * ---------------------------------------------------------------
 */
import type { Category } from '@/types/category';
import { FRECUENTES_MAX, FRECUENTES_MIN_USOS } from './constants';

export interface CategoriasOrdenadas {
  frecuentes: Category[];
  resto: Category[];
}

// usos: category_id de los últimos movimientos (puede repetirse).
export function ordenarPorFrecuencia(categorias: Category[], usos: string[]): CategoriasOrdenadas {
  const conteo = new Map<string, number>();
  usos.forEach((id) => conteo.set(id, (conteo.get(id) ?? 0) + 1));

  const frecuentes = categorias
    .filter((c) => (conteo.get(c.id) ?? 0) >= FRECUENTES_MIN_USOS)
    .sort((a, b) => (conteo.get(b.id) ?? 0) - (conteo.get(a.id) ?? 0))
    .slice(0, FRECUENTES_MAX);

  const idsFrecuentes = new Set(frecuentes.map((c) => c.id));
  return { frecuentes, resto: categorias.filter((c) => !idsFrecuentes.has(c.id)) };
}
