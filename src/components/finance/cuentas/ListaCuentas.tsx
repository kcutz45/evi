/**
 * ListaCuentas.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: "Mis cuentas": el total arriba (tarjeta morada) y cada
 *            cuenta con su saldo. Tocar una cuenta abre "Ajustar saldo".
 *
 * POR QUÉ EXISTE: Responde "¿cuánto tengo y dónde?" de un vistazo. Los
 *            saldos vienen calculados por vw_account_balances.
 * ---------------------------------------------------------------
 */
import { ChevronRight } from 'lucide-react';
import { AppIcon } from '@/components/ui/AppIcon';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/cn';
import { formatCurrency } from '@/lib/formatCurrency';
import type { Cuenta } from '@/types/account';

export function TotalCuentas({ total, cuentas }: { total: number; cuentas: number }) {
  return (
    <Card variant="hero" className="p-5">
      <span className="text-[13px] font-bold uppercase tracking-wider text-white/70">Tu dinero hoy</span>
      <p className="tabular mt-2 text-[38px] font-black leading-none tracking-tighter text-mint">{formatCurrency(total)}</p>
      <p className="mt-2 text-[12.5px] font-bold text-white/80">
        Sumando {cuentas === 1 ? 'tu cuenta' : `tus ${cuentas} cuentas`}. Lo que te deben y lo apartado en metas no está aquí.
      </p>
    </Card>
  );
}

export function ListaCuentas({ cuentas, onElegir }: { cuentas: Cuenta[]; onElegir: (cuenta: Cuenta) => void }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {cuentas.map((c) => (
        <li key={c.id}>
          <button type="button" onClick={() => onElegir(c)}
            className="flex w-full items-center gap-3 rounded-[18px] bg-white p-3.5 text-left shadow-card transition hover:ring-2 hover:ring-primary/30 active:scale-[0.99]">
            <span className="grid h-[42px] w-[42px] flex-none place-items-center rounded-tile bg-primary-soft text-primary">
              <AppIcon name={c.icono} size={20} />
            </span>
            <span className="flex-1 truncate text-[15px] font-extrabold tracking-tight">{c.nombre}</span>
            <span className={cn('tabular text-[15.5px] font-black', c.saldo < 0 ? 'text-gold-dark' : 'text-dark')}>
              {formatCurrency(c.saldo)}
            </span>
            <ChevronRight size={18} className="flex-none text-muted-faint" aria-hidden />
          </button>
        </li>
      ))}
    </ul>
  );
}
