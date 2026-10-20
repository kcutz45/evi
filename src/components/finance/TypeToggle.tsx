/**
 * TypeToggle.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Selector Gasto / Ingreso del registro de movimiento.
 *
 * NOTA:      "Gasto" va primero y es el valor por defecto: es lo que
 *            el usuario registra la mayoría de las veces, así se ahorra
 *            un toque (§3: menos de 3 toques).
 * ---------------------------------------------------------------
 */
import { cn } from '@/lib/cn';
import type { MovementType } from '@/types/movement';

const OPTIONS: Array<{ value: MovementType; label: string; activeClass: string }> = [
  { value: 'egreso', label: 'Gasto', activeClass: 'bg-primary text-white shadow-glow-primary' },
  { value: 'ingreso', label: 'Ingreso', activeClass: 'bg-mint text-mint-ink shadow-glow-mint' },
];

interface TypeToggleProps {
  value: MovementType;
  onChange: (value: MovementType) => void;
}

export function TypeToggle({ value, onChange }: TypeToggleProps) {
  return (
    <div role="radiogroup" aria-label="Tipo de movimiento" className="grid grid-cols-2 gap-1.5 rounded-[18px] bg-line p-1.5">
      {OPTIONS.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(option.value)}
            className={cn(
              'rounded-[14px] py-2.5 text-[15px] font-extrabold tracking-tight transition-colors',
              isActive ? option.activeClass : 'bg-transparent text-muted',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
