/**
 * movementList.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Filtra los movimientos del mes y los agrupa por día para
 *            la pantalla Dinero.
 *
 * POR QUÉ EXISTE: Filtrar por tipo o categoría sobre la lista ya
 *            cargada es instantáneo y no necesita otra consulta. Al ser
 *            funciones puras, la página solo pinta el resultado.
 *
 * DEPENDE DE: lib/dates.ts
 * USADO EN:   app/(dashboard)/dinero/page.tsx
 * ---------------------------------------------------------------
 */
import type { MovementDetalle, MovementType } from '@/types/movement';
import { etiquetaDeDia } from './dates';

export interface FiltroMovimientos {
  // null = todos.
  tipo: MovementType | null;
  categoriaId: string | null;
}

export const SIN_FILTRO: FiltroMovimientos = { tipo: null, categoriaId: null };

export interface GrupoDelDia {
  fecha: string;
  etiqueta: string;
  movimientos: MovementDetalle[];
}

export function filtrarMovimientos(lista: MovementDetalle[], filtro: FiltroMovimientos): MovementDetalle[] {
  return lista.filter(
    (m) =>
      (filtro.tipo === null || m.type === filtro.tipo) &&
      (filtro.categoriaId === null || m.categoryId === filtro.categoriaId),
  );
}

// La lista llega ordenada de más reciente a más antiguo; se respeta ese orden.
export function agruparPorDia(lista: MovementDetalle[]): GrupoDelDia[] {
  const grupos: GrupoDelDia[] = [];
  lista.forEach((m) => {
    const ultimo = grupos[grupos.length - 1];
    if (ultimo && ultimo.fecha === m.occurredOn) ultimo.movimientos.push(m);
    else grupos.push({ fecha: m.occurredOn, etiqueta: etiquetaDeDia(m.occurredOn), movimientos: [m] });
  });
  return grupos;
}

// Categorías que aparecen en la lista, para ofrecer solo filtros útiles.
export function categoriasPresentes(lista: MovementDetalle[]): Array<{ id: string; name: string }> {
  const vistas = new Map<string, string>();
  lista.forEach((m) => {
    if (m.categoryId && !vistas.has(m.categoryId)) vistas.set(m.categoryId, m.categoryName);
  });
  return [...vistas].map(([id, name]) => ({ id, name }));
}
