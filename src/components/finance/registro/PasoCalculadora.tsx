/**
 * PasoCalculadora.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Pantalla Calculadora, aparte del registro: se hace la
 *            cuenta ("3 × 35") y "Usar este resultado" vuelve al paso
 *            del monto con el total cargado.
 *
 * POR QUÉ EXISTE: Tener las operaciones dentro del paso del monto lo
 *            hacía más complicado para quien solo escribe un número
 *            (24/10/2026). Aquí la calculadora tiene toda la pantalla
 *            y su propio estado: si se vuelve con ←, el monto no cambia.
 *
 * DEPENDE DE: hooks/useCalculator.ts, CalculatorKeypad.tsx
 * ---------------------------------------------------------------
 */
'use client';

import { CornerDownLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCalculator } from '@/hooks/useCalculator';
import { cn } from '@/lib/cn';
import { CalculatorKeypad } from './CalculatorKeypad';

interface PasoCalculadoraProps {
  // Arranca con el monto que ya estaba escrito (si había).
  montoInicial: number | null;
  onUsar: (resultado: number) => void;
}

export function PasoCalculadora({ montoInicial, onUsar }: PasoCalculadoraProps) {
  const calc = useCalculator(montoInicial ?? undefined);

  return (
    <div className="flex min-h-0 flex-1 animate-step-in flex-col motion-reduce:animate-none">
      <div className="mx-5 flex flex-1 flex-col items-end justify-end gap-2 rounded-card bg-dark px-5 py-5 text-white"
        aria-live="polite">
        <span className="min-h-6 break-all text-right text-lg font-bold text-white/60">{calc.operacion ?? ' '}</span>
        <output className={cn('tabular text-right text-5xl font-black leading-none tracking-tighter',
          calc.estaVacio ? 'text-white/30' : 'text-mint')}>
          {calc.total}
        </output>
      </div>
      <div className="flex flex-col gap-3 px-4 pb-5 pt-4">
        <CalculatorKeypad onTecla={calc.presionar} conOperaciones />
        <Button variant="mint" size="lg" fullWidth disabled={!calc.esValido}
          onClick={() => calc.valor !== null && onUsar(calc.valor)} icon={<CornerDownLeft size={20} strokeWidth={2.6} />}>
          Usar este resultado
        </Button>
      </div>
    </div>
  );
}
