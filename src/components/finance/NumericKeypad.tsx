/**
 * NumericKeypad.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Teclado numérico grande propio de la app.
 *
 * POR QUÉ EXISTE: El teclado del sistema tapa media pantalla y cambia
 *            entre Android e iPhone. Uno propio, con teclas de 56 px,
 *            hace que escribir el monto sea el primer toque y no una
 *            búsqueda del campo de texto.
 *
 * NOTA:      Solo emite la tecla. Qué significa cada tecla lo decide
 *            lib/amountInput.ts.
 * ---------------------------------------------------------------
 */
import { Delete } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { KeypadKey } from '@/lib/amountInput';

const KEYS: KeypadKey[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'del'];

export function NumericKeypad({ onKey }: { onKey: (key: KeypadKey) => void }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {KEYS.map((key) => {
        const isAction = key === '.' || key === 'del';
        return (
          <button
            key={key}
            type="button"
            onClick={() => onKey(key)}
            aria-label={key === 'del' ? 'Borrar' : key === '.' ? 'Punto decimal' : key}
            className={cn(
              'grid h-14 place-items-center rounded-[18px] text-[25px] font-extrabold transition-colors active:scale-95',
              isAction ? 'bg-primary-soft text-primary hover:bg-line' : 'bg-white text-dark hover:bg-primary-soft',
            )}
          >
            {key === 'del' ? <Delete size={24} strokeWidth={2} /> : key}
          </button>
        );
      })}
    </div>
  );
}
