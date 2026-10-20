/**
 * BudgetBar.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Barra de avance del presupuesto: menta si va bien, dorada
 *            desde el 80% (nunca roja, §3 sistema visual).
 *
 * POR QUÉ EXISTE: Un ancho dinámico normalmente obliga a escribir
 *            style={{ width }}, prohibido por la regla #2. Con SVG el
 *            ancho es un ATRIBUTO del <rect> y el color sigue saliendo
 *            de clases de Tailwind (fill-mint, fill-gold).
 *
 * DEPENDE DE: lib/budget.ts
 * ---------------------------------------------------------------
 */
import { cn } from '@/lib/cn';
import { getBudgetStatus, toPercent } from '@/lib/budget';

const BAR_HEIGHT = 9;
const MAX_PERCENT = 100;

interface BudgetBarProps {
  // Fracción usada (0.85 = 85%). Si pasa de 1, la barra se llena.
  usage: number;
  label: string;
  className?: string;
}

export function BudgetBar({ usage, label, className }: BudgetBarProps) {
  const percent = toPercent(usage);
  const fillWidth = Math.min(MAX_PERCENT, Math.max(0, percent));
  const isWarning = getBudgetStatus(usage) !== 'ok';

  return (
    <svg
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={MAX_PERCENT}
      aria-valuenow={percent}
      width="100%"
      height={BAR_HEIGHT}
      className={cn('block', className)}
    >
      <rect width="100%" height={BAR_HEIGHT} rx={BAR_HEIGHT / 2} className="fill-track" />
      <rect
        width={`${fillWidth}%`}
        height={BAR_HEIGHT}
        rx={BAR_HEIGHT / 2}
        className={cn('transition-all duration-500', isWarning ? 'fill-gold' : 'fill-mint')}
      />
    </svg>
  );
}
