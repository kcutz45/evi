/**
 * PasoMonto.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Paso 3 del registro: ¿cuánto? Monto enorme, calculadora,
 *            detalles opcionales y el botón Guardar.
 *
 * POR QUÉ EXISTE: Arriba se ve la categoría elegida (con "Cambiar"),
 *            así el usuario confirma de un vistazo QUÉ está guardando
 *            antes de tocar Guardar. No guarda nada: avisa con onGuardar.
 *
 * DEPENDE DE: CalculatorKeypad.tsx, DetallesOpcionales.tsx
 * ---------------------------------------------------------------
 */
import type { ReactNode } from 'react';
import { Calculator, Check, Users } from 'lucide-react';
import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import type { useCalculator } from '@/hooks/useCalculator';
import { cn } from '@/lib/cn';
import type { Category } from '@/types/category';
import { CalculatorKeypad } from './CalculatorKeypad';
import { DetallesOpcionales, type DetallesOpcionalesProps } from './DetallesOpcionales';

interface PasoMontoProps {
  categoria: Category | undefined;
  esIngreso: boolean;
  calc: ReturnType<typeof useCalculator>;
  detalles: DetallesOpcionalesProps;
  error: string | null;
  guardando: boolean;
  onCambiarCategoria: () => void;
  onGuardar: () => void;
  // Abre la pantalla Calculadora (aparte del registro).
  onCalculadora: () => void;
  // Si viene, se ofrece "Dividir esta cuenta" (solo gastos, al crear).
  onDividir?: () => void;
}

export function PasoMonto(props: PasoMontoProps) {
  const { calc } = props;
  return (
    <div className="flex min-h-0 flex-1 animate-step-in flex-col motion-reduce:animate-none">
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5">
        {props.categoria && <ChipCategoria categoria={props.categoria} onCambiar={props.onCambiarCategoria} />}
        <div className="flex flex-col items-center py-2" aria-live="polite">
          <span className="h-5 text-sm font-bold text-muted-soft">{calc.operacion ?? ' '}</span>
          <output className={cn('tabular text-[52px] font-black leading-none tracking-tighter',
            calc.estaVacio ? 'text-line' : props.esIngreso ? 'text-mint-dark' : 'text-dark')}>
            {calc.total}
          </output>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <Atajo onClick={props.onCalculadora} icono={<Calculator size={16} aria-hidden />}>Calculadora</Atajo>
          {props.onDividir && !props.esIngreso && calc.esValido && (
            <Atajo onClick={props.onDividir} icono={<Users size={16} aria-hidden />}>Dividir esta cuenta</Atajo>
          )}
        </div>
        <DetallesOpcionales {...props.detalles} />
        {props.error && <p role="alert" className="text-center text-xs font-bold text-gold-dark">{props.error}</p>}
      </div>
      <div className="flex flex-col gap-3 px-4 pb-5 pt-3">
        <CalculatorKeypad onTecla={calc.presionar} />
        <Button variant="mint" size="lg" fullWidth disabled={!calc.esValido || props.guardando}
          onClick={props.onGuardar} icon={<Check size={21} strokeWidth={2.6} />}>
          {props.guardando ? 'Guardando…' : 'Guardar'}
        </Button>
      </div>
    </div>
  );
}

function ChipCategoria({ categoria, onCambiar }: { categoria: Category; onCambiar: () => void }) {
  return (
    <div className="flex items-center justify-center">
      <button type="button" onClick={onCambiar}
        className="flex items-center gap-2 rounded-full bg-white py-1.5 pl-1.5 pr-3.5 shadow-card hover:ring-2 hover:ring-primary/30">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-primary-soft text-primary">
          <AppIcon name={categoria.icon} size={17} />
        </span>
        <span className="text-sm font-extrabold">{categoria.name}</span>
        <span className="text-xs font-bold text-primary">Cambiar</span>
      </button>
    </div>
  );
}

// Botón redondo secundario del paso: abre otra pantalla (Calculadora, Dividir).
function Atajo({ onClick, icono, children }: { onClick: () => void; icono: ReactNode; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      className="flex items-center gap-2 rounded-full bg-primary-soft px-4 py-2 text-[13px] font-extrabold text-primary hover:bg-line">
      {icono} {children}
    </button>
  );
}
