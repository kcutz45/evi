/**
 * CalculatorKeypad.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Teclado del paso "¿Cuánto?": números grandes y una fila
 *            de operaciones (+ − × ÷) para cuentas como "3 × Q35".
 *
 * NOTA:      Solo emite la tecla. Qué significa cada una lo decide
 *            lib/calculator.ts.
 * ---------------------------------------------------------------
 */
import { Delete } from 'lucide-react';
import { OPERADORES, type Digito, type TeclaCalc } from '@/lib/calculator';
import { cn } from '@/lib/cn';

const DIGITOS: Array<Digito | '.' | 'del'> = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'del'];

const NOMBRE_ACCESIBLE: Record<string, string> = {
  '+': 'Más', '−': 'Menos', '×': 'Por', '÷': 'Entre', '.': 'Punto decimal', del: 'Borrar',
};

export function CalculatorKeypad({ onTecla }: { onTecla: (tecla: TeclaCalc) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-4 gap-2">
        {OPERADORES.map((op) => (
          <button key={op} type="button" onClick={() => onTecla(op)} aria-label={NOMBRE_ACCESIBLE[op]}
            className="h-10 rounded-[14px] bg-primary-soft text-xl font-black text-primary transition active:scale-95 hover:bg-line">
            {op}
          </button>
        ))}
      </div>
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
