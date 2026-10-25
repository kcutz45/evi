/**
 * SelectorDeCuenta.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Fila de botones redondos para elegir una cuenta dentro de
 *            una hoja ("Sale de", "¿De qué cuenta sale?").
 *
 * POR QUÉ EXISTE: Transferir y abonar a una meta eligen cuenta igual;
 *            un solo componente mantiene el mismo aspecto en ambos.
 * ---------------------------------------------------------------
 */
import { AppIcon } from '@/components/ui/AppIcon';
import { cn } from '@/lib/cn';
import type { Cuenta } from '@/types/account';

interface SelectorDeCuentaProps {
  titulo: string;
  cuentas: Cuenta[];
  elegida: string | null;
  onElegir: (id: string) => void;
}

export function SelectorDeCuenta({ titulo, cuentas, elegida, onElegir }: SelectorDeCuentaProps) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-bold text-muted">{titulo}</legend>
      <div className="flex flex-wrap gap-2">
        {cuentas.map((c) => (
          <button key={c.id} type="button" aria-pressed={elegida === c.id} onClick={() => onElegir(c.id)}
            className={cn('flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-extrabold transition',
              elegida === c.id ? 'bg-primary text-white shadow-glow-primary' : 'bg-surface text-dark shadow-card')}>
            <AppIcon name={c.icono} size={15} /> {c.nombre}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
