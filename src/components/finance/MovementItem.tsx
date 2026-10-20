/**
 * MovementItem.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Una fila de la lista de movimientos.
 *
 * POR QUÉ EXISTE: Si el movimiento pertenece a un evento, muestra su
 *            etiqueta de origen (§3, pantalla 3) y, si el evento sigue
 *            abierto, la marca "Pendiente": ese gasto todavía no suma
 *            al balance del mes (regla contable v1.2).
 * ---------------------------------------------------------------
 */
import { CalendarDays } from 'lucide-react';
import { AppIcon } from '@/components/ui/AppIcon';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/cn';
import { formatSignedCurrency } from '@/lib/formatCurrency';
import type { MovementView } from '@/types/movement';

export function MovementItem({ movement }: { movement: MovementView }) {
  const isIncome = movement.type === 'ingreso';

  return (
    <li className="flex items-center gap-3 rounded-[18px] bg-white p-3.5 shadow-card">
      <span
        className={cn(
          'grid h-[42px] w-[42px] flex-none place-items-center rounded-tile',
          isIncome ? 'bg-mint-soft text-mint-dark' : 'bg-primary-soft text-primary',
        )}
      >
        <AppIcon name={movement.categoryIcon} size={20} strokeWidth={1.9} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-extrabold tracking-tight">{movement.title}</p>
        <p className="mt-0.5 text-[12.5px] font-semibold text-muted-soft">
          {movement.categoryName} · {movement.dateLabel}
        </p>
        {movement.eventName && (
          <p className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-primary">
            <CalendarDays size={13} aria-hidden />
            {movement.eventName}
            {movement.isPending && <Badge tone="gold" className="ml-1 px-1.5 py-0.5">Pendiente</Badge>}
          </p>
        )}
      </div>

      <span className={cn('tabular text-[15.5px] font-black', isIncome ? 'text-mint-dark' : 'text-dark')}>
        {formatSignedCurrency(movement.amount, isIncome)}
      </span>
    </li>
  );
}
