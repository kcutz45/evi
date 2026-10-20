/**
 * EventCard.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Tarjeta de un evento ACTIVO en el listado de /eventos.
 *
 * POR QUÉ EXISTE: Muestra de un vistazo lo que importa: cuánto llevás
 *            gastado, si vas cerca del límite y cuántas tareas faltan.
 *            Los eventos cerrados usan ClosedEventCard (más discreta).
 *
 * DEPENDE DE: lib/budget.ts, components/events/BudgetBar.tsx
 * USADO EN:   app/(dashboard)/eventos/page.tsx
 * ---------------------------------------------------------------
 */
import Link from 'next/link';
import { ChevronRight, ListChecks } from 'lucide-react';
import { AppIcon } from '@/components/ui/AppIcon';
import { Badge } from '@/components/ui/Badge';
import { calculateBudgetUsage, getBudgetStatus, remainingBudget } from '@/lib/budget';
import { formatCurrency } from '@/lib/formatCurrency';
import { pendingTasksLabel } from '@/lib/text';
import type { EventSummary } from '@/types/event';
import { BudgetAlert } from './BudgetAlert';
import { BudgetBar } from './BudgetBar';

export function EventCard({ event }: { event: EventSummary }) {
  // Se calcula ANTES del JSX: mezclar el cálculo con la presentación
  // rompería SRP y se recalcularía en cada línea que lo use.
  const usage = calculateBudgetUsage(event.spentAmount, event.plannedBudget);
  const showAlert = getBudgetStatus(usage) !== 'ok';

  return (
    <Link href={`/eventos/${event.id}`} className="block rounded-card bg-white p-4 shadow-card">
      <div className="flex items-start gap-3">
        <span className="grid h-[42px] w-[42px] flex-none place-items-center rounded-tile bg-primary/10 text-primary">
          <AppIcon name={event.icon} size={21} strokeWidth={1.9} />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h3 className="text-base font-black leading-tight tracking-tight">{event.name}</h3>
          <span className="text-[12.5px] font-bold text-muted-soft">
            {event.dateLabel}
            {event.location && ` · ${event.location}`}
          </span>
        </div>
        <Badge tone="mint">Activo</Badge>
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <span className="text-[12.5px] font-extrabold text-muted">Presupuesto</span>
        <span className="tabular text-[13.5px] font-black">
          {formatCurrency(event.spentAmount)}{' '}
          <span className="font-bold text-muted-soft">de {formatCurrency(event.plannedBudget)}</span>
        </span>
      </div>
      <BudgetBar usage={usage} label={`Presupuesto usado de ${event.name}`} className="mt-2" />
      {showAlert && <BudgetAlert usage={usage} remaining={remainingBudget(event.spentAmount, event.plannedBudget)} />}

      <EventCardFooter pending={event.tasksTotal - event.tasksDone} />
    </Link>
  );
}

function EventCardFooter({ pending }: { pending: number }) {
  return (
    <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
      <span className="inline-flex items-center gap-2 text-[12.5px] font-extrabold text-closed-ink">
        <ListChecks size={16} className="text-primary" aria-hidden />
        {pendingTasksLabel(pending)}
      </span>
      <span className="inline-flex items-center gap-1 text-[12.5px] font-black text-primary">
        Ver evento
        <ChevronRight size={15} strokeWidth={2.4} aria-hidden />
      </span>
    </div>
  );
}
