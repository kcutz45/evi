/**
 * EventoEncabezado.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Parte de arriba del detalle de un evento: volver, nombre,
 *            fecha con cuenta regresiva y la tarjeta del presupuesto
 *            (con la alerta del 80%, dorada, nunca roja).
 *
 * POR QUÉ EXISTE: Lo primero que se quiere saber de un evento es
 *            "¿cuánto me queda?". Si ya está cerrado, la tarjeta lo dice
 *            y confirma que los gastos pasaron a tus finanzas.
 *
 * DEPENDE DE: lib/budget.ts, BudgetBar.tsx, BudgetAlert.tsx
 * USADO EN:   app/(dashboard)/eventos/[id]/page.tsx
 * ---------------------------------------------------------------
 */
import Link from 'next/link';
import { ArrowLeft, ArrowLeftRight, MapPin } from 'lucide-react';
import { AppIcon } from '@/components/ui/AppIcon';
import { Badge } from '@/components/ui/Badge';
import { calculateBudgetUsage, getBudgetStatus, remainingBudget } from '@/lib/budget';
import { fechaLarga, hoyGT } from '@/lib/dates';
import { formatCurrency } from '@/lib/formatCurrency';
import type { EventoDetalle } from '@/types/event';
import { BudgetAlert } from '../BudgetAlert';
import { BudgetBar } from '../BudgetBar';

export function EventoEncabezado({ evento }: { evento: EventoDetalle }) {
  const activo = evento.status === 'activo';
  return (
    <header className="flex flex-col gap-4 pb-4 pt-4">
      <Link href="/eventos" className="inline-flex items-center gap-1.5 text-sm font-extrabold text-primary">
        <ArrowLeft size={17} aria-hidden /> Mis eventos
      </Link>
      <div className="flex items-start gap-3">
        <span className="grid h-14 w-14 flex-none place-items-center rounded-card bg-primary text-white shadow-glow-primary">
          <AppIcon name={evento.icon} size={26} />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h1 className="text-2xl font-black leading-tight tracking-tight">{evento.name}</h1>
          <span className="text-[13px] font-bold text-muted-soft">{evento.dateLabel}</span>
          {evento.location && (
            <span className="inline-flex items-center gap-1 text-[13px] font-bold text-muted-soft">
              <MapPin size={14} aria-hidden /> {evento.location}
            </span>
          )}
        </div>
        <Badge tone={activo ? 'mint' : 'neutral'}>{activo ? 'Activo' : 'Cerrado'}</Badge>
      </div>
      <TarjetaPresupuesto evento={evento} />
    </header>
  );
}

function TarjetaPresupuesto({ evento }: { evento: EventoDetalle }) {
  const uso = calculateBudgetUsage(evento.spentAmount, evento.plannedBudget);
  const restante = remainingBudget(evento.spentAmount, evento.plannedBudget);
  const activo = evento.status === 'activo';

  return (
    <section aria-label="Presupuesto" className="rounded-card bg-white p-4 shadow-card">
      <div className="flex items-baseline justify-between">
        <span className="text-[13px] font-extrabold text-muted">{activo ? 'Llevás gastado' : 'Gastaste'}</span>
        <span className="text-[13px] font-bold text-muted-soft">
          de <span className="tabular font-black text-dark">{formatCurrency(evento.plannedBudget)}</span>
        </span>
      </div>
      <p className="tabular mt-1 text-[34px] font-black leading-none tracking-tighter">
        {formatCurrency(evento.spentAmount)}
      </p>
      <BudgetBar usage={uso} label={`Presupuesto usado de ${evento.name}`} className="mt-3" />
      {activo && getBudgetStatus(uso) !== 'ok' && <BudgetAlert usage={uso} remaining={restante} />}
      {activo && getBudgetStatus(uso) === 'ok' && (
        <p className="mt-2 text-[12.5px] font-bold text-muted-soft">
          Te quedan <span className="tabular font-black text-mint-dark">{formatCurrency(restante)}</span>
        </p>
      )}
      {!activo && evento.closedAt && (
        <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-mint-dark">
          <ArrowLeftRight size={13} aria-hidden />
          Cerrado el {fechaLarga(hoyGT(new Date(evento.closedAt))).toLowerCase()}: sus gastos ya están en tus finanzas.
        </p>
      )}
    </section>
  );
}
