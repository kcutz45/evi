/**
 * ClosedEventCard.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Tarjeta compacta de un evento CERRADO: cuánto se gastó
 *            y la confirmación de que sus gastos ya pasaron a las
 *            finanzas personales.
 *
 * POR QUÉ EXISTE: Un evento cerrado ya no pide acción; por eso es más
 *            discreto (fondo apagado, sin barra ni alertas).
 * ---------------------------------------------------------------
 */
import Link from 'next/link';
import { ArrowLeftRight } from 'lucide-react';
import { AppIcon } from '@/components/ui/AppIcon';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/formatCurrency';
import type { EventSummary } from '@/types/event';

export function ClosedEventCard({ event }: { event: EventSummary }) {
  return (
    <Link href={`/eventos/${event.id}`} className="block">
      <Card variant="muted" className="flex flex-col gap-2.5 px-4 py-3.5">
        <div className="flex items-center gap-3">
          <span className="grid h-[38px] w-[38px] flex-none place-items-center rounded-[14px] bg-closed-badge text-muted-soft">
            <AppIcon name={event.icon} size={19} />
          </span>
          <div className="flex min-w-0 flex-1 flex-col">
            <h3 className="truncate text-[15px] font-extrabold tracking-tight text-closed-ink">{event.name}</h3>
            <span className="tabular text-xs font-bold text-muted-faint">
              {event.dateLabel} · gastaste {formatCurrency(event.spentAmount)} de{' '}
              {formatCurrency(event.plannedBudget)}
            </span>
          </div>
          <Badge tone="neutral">Cerrado</Badge>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-mint-dark">
          <ArrowLeftRight size={13} aria-hidden />
          Gastos pasados a tus finanzas
        </span>
      </Card>
    </Link>
  );
}
