/**
 * PasoCuenta.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Pantalla "¿De dónde salió?" / "¿A dónde entró?", aparte
 *            del registro: se toca una cuenta y se vuelve al monto.
 *
 * POR QUÉ EXISTE: La cuenta es opcional y casi siempre la misma (la
 *            última usada ya viene elegida). Por eso no es un paso más:
 *            se abre solo si el usuario quiere cambiarla.
 * ---------------------------------------------------------------
 */
import { Check } from 'lucide-react';
import { AppIcon } from '@/components/ui/AppIcon';
import { cn } from '@/lib/cn';
import { formatCurrency } from '@/lib/formatCurrency';
import type { Cuenta } from '@/types/account';

interface PasoCuentaProps {
  cuentas: Cuenta[];
  elegidaId: string | null;
  onElegir: (id: string | null) => void;
}

export function PasoCuenta({ cuentas, elegidaId, onElegir }: PasoCuentaProps) {
  return (
    <div className="flex min-h-0 flex-1 animate-step-in flex-col gap-2.5 overflow-y-auto px-5 pb-5 motion-reduce:animate-none">
      {cuentas.map((c) => (
        <Opcion key={c.id} elegida={c.id === elegidaId} onClick={() => onElegir(c.id)}
          icono={c.icono} titulo={c.nombre} detalle={`Saldo: ${formatCurrency(c.saldo)}`} />
      ))}
      <Opcion elegida={elegidaId === null} onClick={() => onElegir(null)} icono="circle"
        titulo="Sin cuenta" detalle="No cambia el saldo de ninguna cuenta" />
    </div>
  );
}

interface OpcionProps {
  elegida: boolean;
  onClick: () => void;
  icono: string;
  titulo: string;
  detalle: string;
}

function Opcion({ elegida, onClick, icono, titulo, detalle }: OpcionProps) {
  return (
    <button type="button" onClick={onClick} aria-pressed={elegida}
      className={cn('flex items-center gap-3 rounded-card bg-surface p-3.5 text-left shadow-card transition active:scale-[0.99]',
        elegida && 'ring-2 ring-primary')}>
      <span className="grid h-11 w-11 flex-none place-items-center rounded-tile bg-primary-soft text-primary">
        <AppIcon name={icono} size={21} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-[15px] font-extrabold">{titulo}</span>
        <span className="tabular text-[12.5px] font-bold text-muted-soft">{detalle}</span>
      </span>
      {elegida && <Check size={20} strokeWidth={2.6} className="flex-none text-primary" aria-hidden />}
    </button>
  );
}
