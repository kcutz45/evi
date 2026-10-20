/**
 * BudgetAlert.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Aviso "Vas al 85% de tu presupuesto" (alcance congelado:
 *            alerta al 80%). Tono dorado y amable, no de error.
 *
 * NOTA:      El componente solo muestra el aviso. Registrar el evento
 *            de telemetría budget_alert_shown es trabajo del hook que
 *            carga el evento, para no duplicarlo en cada render.
 * ---------------------------------------------------------------
 */
import { CircleAlert } from 'lucide-react';
import { toPercent } from '@/lib/budget';
import { formatCurrency } from '@/lib/formatCurrency';

interface BudgetAlertProps {
  usage: number;
  remaining: number;
}

export function BudgetAlert({ usage, remaining }: BudgetAlertProps) {
  const message =
    remaining >= 0
      ? `Vas al ${toPercent(usage)}% de tu presupuesto · te quedan ${formatCurrency(remaining)}`
      : `Te pasaste ${formatCurrency(-remaining)} del presupuesto`;

  return (
    <div role="status" className="mt-3 flex items-center gap-2 rounded-[14px] bg-gold/25 px-3 py-2.5">
      <CircleAlert size={16} strokeWidth={2.2} className="flex-none text-gold-dark" aria-hidden />
      <span className="text-[12.5px] font-black text-gold-ink">{message}</span>
    </div>
  );
}
