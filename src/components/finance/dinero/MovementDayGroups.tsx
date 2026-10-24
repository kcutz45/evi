/**
 * MovementDayGroups.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Lista de movimientos del mes agrupada por día ("Hoy",
 *            "Ayer", "22 oct"), con sus estados de carga y vacío.
 *
 * POR QUÉ EXISTE: Agrupar por día responde de un vistazo "¿qué gasté el
 *            sábado?". Cada fila se puede tocar para ver el detalle.
 * ---------------------------------------------------------------
 */
import { Inbox } from 'lucide-react';
import { MovementItem } from '@/components/finance/MovementItem';
import type { GrupoDelDia } from '@/lib/movementList';
import type { MovementDetalle } from '@/types/movement';

const FILAS_DE_CARGA = 4;

interface MovementDayGroupsProps {
  grupos: GrupoDelDia[];
  isLoading: boolean;
  hayFiltro: boolean;
  onElegir: (mov: MovementDetalle) => void;
}

export function MovementDayGroups({ grupos, isLoading, hayFiltro, onElegir }: MovementDayGroupsProps) {
  if (isLoading) {
    return (
      <div aria-busy className="flex flex-col gap-2.5">
        {Array.from({ length: FILAS_DE_CARGA }, (_, i) => (
          <div key={i} className="h-[70px] animate-pulse rounded-[18px] bg-white/70" />
        ))}
      </div>
    );
  }

  if (grupos.length === 0) return <ListaVacia hayFiltro={hayFiltro} />;

  return (
    <div className="flex flex-col gap-5">
      {grupos.map((grupo) => (
        <section key={grupo.fecha} className="flex flex-col gap-2.5">
          <h3 className="text-xs font-black uppercase tracking-widest text-muted-soft">{grupo.etiqueta}</h3>
          <ul className="flex flex-col gap-2.5">
            {grupo.movimientos.map((m) => (
              <MovementItem key={m.id} movement={m} onSelect={() => onElegir(m)} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function ListaVacia({ hayFiltro }: { hayFiltro: boolean }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card bg-white px-6 py-10 text-center shadow-card">
      <Inbox size={36} strokeWidth={1.6} className="text-muted-faint" aria-hidden />
      <p className="text-sm font-bold text-muted">
        {hayFiltro
          ? 'No hay movimientos con este filtro. Probá con "Todos".'
          : 'No registraste movimientos este mes. Tocá + para agregar uno.'}
      </p>
    </div>
  );
}
