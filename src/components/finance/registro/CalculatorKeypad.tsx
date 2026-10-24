/**
 * CalculatorKeypad.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Teclado del paso "¿Cuánto?": números grandes y, solo si se
 *            pide, la fila de operaciones (+ − × ÷) para cuentas como
 *            "3 × Q35".
 *
 * POR QUÉ EXISTE: La mayoría solo escribe un monto. Mostrar la
 *            calculadora siempre hacía la pantalla más cargada (pruebas
 *            del 24/10/2026), así que queda plegada tras el botón
 *            "Calculadora". La elección se recuerda en el teléfono
 *            (usePreferencia) y no se oculta a mitad de una cuenta.
 *
 * NOTA:      Solo emite la tecla. Qué significa cada una lo decide
 *            lib/calculator.ts.
 * ---------------------------------------------------------------
 */
'use client';

import { Calculator, ChevronDown, Delete } from 'lucide-react';
import { usePreferencia } from '@/hooks/usePreferencia';
import { OPERADORES, type Digito, type TeclaCalc } from '@/lib/calculator';
import { cn } from '@/lib/cn';

const DIGITOS: Array<Digito | '.' | 'del'> = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'del'];

const NOMBRE_ACCESIBLE: Record<string, string> = {
  '+': 'Más', '−': 'Menos', '×': 'Por', '÷': 'Entre', '.': 'Punto decimal', del: 'Borrar',
};

interface CalculatorKeypadProps {
  onTecla: (tecla: TeclaCalc) => void;
  // Si ya hay una cuenta escrita ("3 × 35"), la calculadora no se oculta.
  hayOperacion: boolean;
}

export function CalculatorKeypad({ onTecla, hayOperacion }: CalculatorKeypadProps) {
  const [abierta, setAbierta] = usePreferencia('calculadora_abierta', false);
  const visible = abierta || hayOperacion;

  return (
    <div className="flex flex-col gap-2">
      <button type="button" onClick={() => setAbierta(!abierta)} disabled={hayOperacion}
        aria-expanded={visible} aria-controls="fila-operaciones"
        className="flex items-center justify-center gap-1.5 self-center rounded-full px-3 py-1 text-xs font-extrabold text-primary hover:bg-primary-soft disabled:opacity-60">
        <Calculator size={15} aria-hidden />
        {visible ? 'Ocultar calculadora' : 'Calculadora'}
        <ChevronDown size={14} className={cn('transition-transform', visible && 'rotate-180')} aria-hidden />
      </button>
      {visible && <FilaOperaciones onTecla={onTecla} />}
      <div className="grid grid-cols-3 gap-2">
        {DIGITOS.map((tecla) => {
          const esAccion = tecla === '.' || tecla === 'del';
          return (
            <button key={tecla} type="button" onClick={() => onTecla(tecla)}
              aria-label={NOMBRE_ACCESIBLE[tecla] ?? tecla}
              className={cn('grid h-[52px] place-items-center rounded-[16px] text-2xl font-extrabold transition active:scale-95',
                esAccion ? 'bg-primary-soft text-primary hover:bg-line' : 'bg-white text-dark shadow-card hover:bg-primary-soft')}>
              {tecla === 'del' ? <Delete size={24} strokeWidth={2} aria-hidden /> : tecla}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FilaOperaciones({ onTecla }: { onTecla: (tecla: TeclaCalc) => void }) {
  return (
    <div id="fila-operaciones" className="grid animate-step-in grid-cols-4 gap-2 motion-reduce:animate-none">
      {OPERADORES.map((op) => (
        <button key={op} type="button" onClick={() => onTecla(op)} aria-label={NOMBRE_ACCESIBLE[op]}
          className="h-10 rounded-[14px] bg-primary-soft text-xl font-black text-primary transition active:scale-95 hover:bg-line">
          {op}
        </button>
      ))}
    </div>
  );
}
