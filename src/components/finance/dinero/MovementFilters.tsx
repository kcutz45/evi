/**
 * MovementFilters.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Filtros de la pantalla Dinero: Todos / Gastos / Ingresos y,
 *            debajo, las categorías que aparecen en el mes.
 *
 * POR QUÉ EXISTE: Solo se ofrecen categorías que tienen movimientos:
 *            un filtro que devuelve una lista vacía frustra.
 * ---------------------------------------------------------------
 */
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import type { FiltroMovimientos } from '@/lib/movementList';
import type { MovementType } from '@/types/movement';

const TIPOS: Array<{ valor: MovementType | null; etiqueta: string }> = [
  { valor: null, etiqueta: 'Todos' },
  { valor: 'egreso', etiqueta: 'Gastos' },
  { valor: 'ingreso', etiqueta: 'Ingresos' },
];

interface MovementFiltersProps {
  filtro: FiltroMovimientos;
  categorias: Array<{ id: string; name: string }>;
  onCambiar: (filtro: FiltroMovimientos) => void;
}

export function MovementFilters({ filtro, categorias, onCambiar }: MovementFiltersProps) {
  return (
    <div className="flex flex-col gap-2.5">
      <div role="radiogroup" aria-label="Tipo de movimiento" className="grid grid-cols-3 gap-1 rounded-[16px] bg-line p-1">
        {TIPOS.map(({ valor, etiqueta }) => (
          <button key={etiqueta} type="button" role="radio" aria-checked={filtro.tipo === valor}
            onClick={() => onCambiar({ tipo: valor, categoriaId: null })}
            className={cn('rounded-[12px] py-2 text-sm font-extrabold transition-colors',
              filtro.tipo === valor ? 'bg-white text-dark shadow-card' : 'text-muted')}>
            {etiqueta}
          </button>
        ))}
      </div>
      {categorias.length > 1 && (
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
          <Chip activo={filtro.categoriaId === null} onClick={() => onCambiar({ ...filtro, categoriaId: null })}>
            Todas
          </Chip>
          {categorias.map((c) => (
            <Chip key={c.id} activo={filtro.categoriaId === c.id} onClick={() => onCambiar({ ...filtro, categoriaId: c.id })}>
              {c.name}
            </Chip>
          ))}
        </div>
      )}
    </div>
  );
}

function Chip({ activo, onClick, children }: { activo: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={activo}
      className={cn('flex-none rounded-full px-3.5 py-1.5 text-[13px] font-extrabold transition-colors',
        activo ? 'bg-primary text-white' : 'bg-white text-muted shadow-card')}>
      {children}
    </button>
  );
}
