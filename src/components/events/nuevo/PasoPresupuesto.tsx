/**
 * PasoPresupuesto.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Paso 3 de "Nuevo evento": el presupuesto, con el mismo
 *            teclado grande del registro.
 *
 * POR QUÉ EXISTE: El presupuesto es lo que activa la alerta del 80%;
 *            mostrarlo enorme deja claro que es el número importante.
 * ---------------------------------------------------------------
 */
import { CalculatorKeypad } from '@/components/finance/registro/CalculatorKeypad';
import type { useCalculator } from '@/hooks/useCalculator';
import { cn } from '@/lib/cn';

export function PasoPresupuesto({ calc, onEnter }: { calc: ReturnType<typeof useCalculator>; onEnter: () => void }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col justify-between gap-3 overflow-y-auto px-4 bajo:flex-row bajo:items-center">
      <div className="flex flex-1 flex-col items-center justify-center" aria-live="polite">
        <output className={cn('tabular text-[52px] font-black leading-none tracking-tighter',
          calc.estaVacio ? 'text-line' : 'text-dark')}>
          {calc.total}
        </output>
      </div>
      <CalculatorKeypad onTecla={calc.presionar} onEnter={onEnter} ayuda="Escribí con tu teclado · Enter crea el evento · Esc vuelve" />
    </div>
  );
}
