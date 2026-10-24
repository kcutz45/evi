/**
 * BalanceCard.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Tarjeta principal del Dashboard: balance del mes con
 *            ingresos y egresos, y opción de ocultar los montos.
 *
 * POR QUÉ EXISTE: Recibe los totales YA calculados por la vista
 *            vw_monthly_summary (§3: "se calculan en una vista, no
 *            sumando en el cliente"). Aquí no se suma nada.
 *
 * PRESTADO:  Lo que pagaste por otros (Te deben) no está en el balance:
 *            al cobrar no es ingreso (§4d). La línea "Tenés Q… prestados"
 *            explica por qué en tu bolsa hay menos de lo que dice aquí.
 *
 * USADO EN:   app/(dashboard)/inicio/page.tsx
 * ---------------------------------------------------------------
 */
import type { ReactNode } from 'react';
import { ArrowDown, ArrowUp, Eye, EyeOff, HandCoins } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/formatCurrency';

const HIDDEN_AMOUNT = 'Q ••••••';

interface BalanceCardProps {
  monthLabel: string;
  balance: number;
  income: number;
  expense: number;
  isHidden: boolean;
  onToggleHidden: () => void;
  // Total pendiente de cobrar (0 = no se muestra la línea).
  prestado?: number;
}

export function BalanceCard(props: BalanceCardProps) {
  const { monthLabel, balance, income, expense, isHidden, onToggleHidden, prestado = 0 } = props;
  const show = (amount: number) => (isHidden ? HIDDEN_AMOUNT : formatCurrency(amount));

  return (
    <Card variant="hero" className="p-5">
      <div aria-hidden className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/[0.07]" />
      <div className="relative flex items-center justify-between">
        <span className="text-[13px] font-bold uppercase tracking-wider text-white/70">
          Balance de {monthLabel}
        </span>
        <button
          type="button"
          onClick={onToggleHidden}
          aria-label={isHidden ? 'Mostrar montos' : 'Ocultar montos'}
          className="grid h-8 w-8 place-items-center rounded-xl bg-white/15 hover:bg-white/25"
        >
          {isHidden ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
      <p className="tabular relative mt-2.5 text-[40px] font-black leading-none tracking-tighter text-mint">
        {show(balance)}
      </p>
      <div className="relative mt-5 grid grid-cols-2 gap-3">
        <BalanceFigure label="Ingresos" value={show(income)} icon={<ArrowUp size={15} />} />
        <BalanceFigure label="Egresos" value={show(expense)} icon={<ArrowDown size={15} />} />
      </div>
      {prestado > 0 && (
        <p className="relative mt-4 flex items-center gap-2 border-t border-white/15 pt-3 text-[12.5px] font-bold text-white/80">
          <HandCoins size={15} className="flex-none text-gold" aria-hidden />
          <span>Tenés <strong className="tabular font-black text-white">{show(prestado)}</strong> prestados: vuelven cuando te paguen.</span>
        </p>
      )}
    </Card>
  );
}

function BalanceFigure({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="inline-flex items-center gap-1 text-xs font-bold text-white/70">
        {icon}
        {label}
      </span>
      <span className="tabular text-lg font-black tracking-tight">{value}</span>
    </div>
  );
}
