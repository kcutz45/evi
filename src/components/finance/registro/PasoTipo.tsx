/**
 * PasoTipo.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Paso 1 del registro: ¿Gasto o ingreso?
 *
 * POR QUÉ EXISTE: Antes, "Gasto/Ingreso" era un interruptor pequeño
 *            que varios usuarios no notaban. Dos tarjetas grandes, con
 *            una frase de ejemplo, no dejan dudas. Un toque y avanza.
 * ---------------------------------------------------------------
 */
import { ArrowDownRight, ArrowUpRight, ChevronRight, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { MovementType } from '@/types/movement';

interface Opcion {
  tipo: MovementType;
  titulo: string;
  ejemplo: string;
  Icono: LucideIcon;
  estiloIcono: string;
}

const OPCIONES: Opcion[] = [
  {
    tipo: 'egreso',
    titulo: 'Un gasto',
    ejemplo: 'Algo que pagaste: comida, bus, la renta…',
    Icono: ArrowDownRight,
    estiloIcono: 'bg-primary text-white',
  },
  {
    tipo: 'ingreso',
    titulo: 'Un ingreso',
    ejemplo: 'Dinero que recibiste: salario, ventas, una remesa…',
    Icono: ArrowUpRight,
    estiloIcono: 'bg-mint text-mint-ink',
  },
];

export function PasoTipo({ onElegir }: { onElegir: (tipo: MovementType) => void }) {
  return (
    <div className="flex animate-step-in flex-col gap-3 px-5 motion-reduce:animate-none">
      {OPCIONES.map(({ tipo, titulo, ejemplo, Icono, estiloIcono }) => (
        <button key={tipo} type="button" onClick={() => onElegir(tipo)}
          className="flex min-h-[112px] items-center gap-4 rounded-card bg-white p-5 text-left shadow-card transition active:scale-[0.98] hover:ring-2 hover:ring-primary/30">
          <span className={cn('grid h-14 w-14 flex-none place-items-center rounded-tile', estiloIcono)}>
            <Icono size={28} strokeWidth={2.4} aria-hidden />
          </span>
          <span className="flex flex-1 flex-col gap-1">
            <span className="text-xl font-black tracking-tight">{titulo}</span>
            <span className="text-sm font-semibold leading-snug text-muted">{ejemplo}</span>
          </span>
          <ChevronRight size={22} className="flex-none text-muted-faint" aria-hidden />
        </button>
      ))}
    </div>
  );
}
