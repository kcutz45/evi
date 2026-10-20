/**
 * CloseEventSummary.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Bloque "Planificado vs. Gasto real" del modal de cierre,
 *            con la barra y el resultado: te sobró o te pasaste.
 *
 * DEPENDE DE: lib/budget.ts, components/events/BudgetBar.tsx
 * USADO EN:   components/events/CloseEventModal.tsx
 * ---------------------------------------------------------------
 */
import { TrendingDown, TrendingUp } from 'lucide-react';
import { calculateBudgetUsage, remainingBudget } from '@/lib/budget';
import { cn } from '@/lib/cn';
import { formatCurrency, formatCurrencyShort } from '@/lib/formatCurrency';
import { BudgetBar } from './BudgetBar';

interface CloseEventSummaryProps {
  planned: number;
  actual: number;
}

export function CloseEventSummary({ planned, actual }: CloseEventSummaryProps) {
  const usage = calculateBudgetUsage(actual, planned);
  const difference = remainingBudget(actual, planned);
  const hasLeftover = difference >= 0;

  return (
    <div className="mt-4 rounded-[22px] bg-white p-4 shadow-card">
      <div className="grid grid-cols-2 gap-3.5">
        <Figure label="Planificado" value={formatCurrency(planned)} />
        <Figure label="Gasto real" value={formatCurrency(actual)} className="border-l border-line pl-3.5" />
      </div>
      <BudgetBar usage={usage} label="Presupuesto usado" className="mt-3.5" />
      <div
        className={cn(
          'mt-3 flex items-center gap-2 rounded-[15px] px-3 py-2.5 text-sm font-black',
          hasLeftover ? 'bg-mint/20 text-mint-dark' : 'bg-gold/30 text-gold-dark',
        )}
      >
        {hasLeftover ? <TrendingDown size={16} aria-hidden /> : <TrendingUp size={16} aria-hidden />}
        {hasLeftover
          ? `Te sobraron ${formatCurrencyShort(difference)} del presupuesto`
          : `Te pasaste ${formatCurrencyShort(difference)} del presupuesto`}
      </div>
    </div>
  );
}

function Figure({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-0.5', className)}>
      <span className="text-[11.5px] font-black uppercase tracking-wider text-muted-soft">{label}</span>
      <span className="tabular text-[21px] font-black tracking-tight">{value}</span>
    </div>
  );
}
