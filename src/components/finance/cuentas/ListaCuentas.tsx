/**
 * ListaCuentas.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: "Mis cuentas": el total arriba (tarjeta morada) y cada
 *            cuenta con su saldo. Tocar una cuenta abre su historial
 *            (/cuentas/[id]); corregir el saldo vive allá, en Opciones.
 *
 * POR QUÉ EXISTE: Responde "¿cuánto tengo y dónde?" de un vistazo. Los
 *            saldos vienen calculados por vw_account_balances.
 * ---------------------------------------------------------------
 */
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { AppIcon } from '@/components/ui/AppIcon';
import { Brillo } from '@/components/ui/Brillo';
import { Card } from '@/components/ui/Card';
import { MontoGrande } from '@/components/ui/MontoGrande';
import { cn } from '@/lib/cn';
import { formatCurrency } from '@/lib/formatCurrency';
import { RUTA_CUENTAS } from '@/lib/routes';
import type { Cuenta } from '@/types/account';

export function TotalCuentas({ total, cuentas }: { total: number; cuentas: number }) {
  return (
    <Card variant="hero" className="p-5">
      <Brillo />
      <span className="relative text-[13px] font-bold uppercase tracking-wider text-white/70">Tu dinero hoy</span>
      <MontoGrande monto={total} className="relative mt-2 text-[42px] text-mint" />
      <p className="vidrio relative mt-3 rounded-2xl px-3 py-2.5 text-[12.5px] font-bold text-white/85">
        Sumando {cuentas === 1 ? 'tu cuenta' : `tus ${cuentas} cuentas`}. Lo que te deben y lo apartado en metas no está aquí.
      </p>
    </Card>
  );
}

export function ListaCuentas({ cuentas }: { cuentas: Cuenta[] }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {cuentas.map((c) => (
        <li key={c.id}>
          <Link href={`${RUTA_CUENTAS}/${c.id}`}
            className="flex w-full items-center gap-3 rounded-[18px] bg-surface p-3.5 text-left shadow-card transition hover:ring-2 hover:ring-primary/30 active:scale-[0.99]">
            <span className="grid h-[42px] w-[42px] flex-none place-items-center rounded-tile bg-primary-soft text-primary">
              <AppIcon name={c.icono} size={20} />
            </span>
            <span className="flex-1 truncate text-[15px] font-extrabold tracking-tight">{c.nombre}</span>
            <span className={cn('tabular text-[15.5px] font-black', c.saldo < 0 ? 'text-gold-dark' : 'text-dark')}>
              {formatCurrency(c.saldo)}
            </span>
            <ChevronRight size={18} className="flex-none text-muted-faint" aria-hidden />
          </Link>
        </li>
      ))}
    </ul>
  );
}

// Encabezado del historial de UNA cuenta: nombre, saldo y lo que entró
// y salió (de lo que muestra el historial).
export function EncabezadoCuenta({ cuenta, entro, salio }: { cuenta: Cuenta; entro: number; salio: number }) {
  return (
    <Card variant="hero" className="p-5">
      <Brillo />
      <span className="relative flex items-center gap-2 text-[13px] font-bold uppercase tracking-wider text-white/75">
        <AppIcon name={cuenta.icono} size={16} /> {cuenta.nombre}
      </span>
      <MontoGrande monto={cuenta.saldo} className="relative mt-2 text-[42px] text-mint" />
      <div className="relative mt-4 grid grid-cols-2 gap-2.5">
        <span className="vidrio flex flex-col rounded-2xl px-3 py-2.5">
          <span className="text-xs font-bold text-white/70">Entró</span>
          <span className="tabular text-base font-black">{formatCurrency(entro)}</span>
        </span>
        <span className="vidrio flex flex-col rounded-2xl px-3 py-2.5">
          <span className="text-xs font-bold text-white/70">Salió</span>
          <span className="tabular text-base font-black">{formatCurrency(salio)}</span>
        </span>
      </div>
    </Card>
  );
}
