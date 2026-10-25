/**
 * TuDineroCard.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Tarjeta "Tu dinero hoy" del Inicio: cuánto tenés sumando
 *            todas tus cuentas, y el enlace a "Mis cuentas".
 *
 * POR QUÉ EXISTE: Es el segundo número de EVI (§12 de schema.sql). El
 *            balance dice cómo te fue en el mes; esto dice cuánto tenés.
 *            Un cobro de "Te deben" sube este número, no el balance.
 * ---------------------------------------------------------------
 */
import Link from 'next/link';
import { ChevronRight, Wallet } from 'lucide-react';
import { formatCurrency } from '@/lib/formatCurrency';
import { RUTA_CUENTAS } from '@/lib/routes';

interface TuDineroCardProps {
  total: number;
  cuentas: number;
  isHidden: boolean;
}

export function TuDineroCard({ total, cuentas, isHidden }: TuDineroCardProps) {
  if (cuentas === 0) return null;
  const detalle = cuentas === 1 ? 'en 1 cuenta' : `en ${cuentas} cuentas`;
  return (
    <Link href={RUTA_CUENTAS}
      className="mt-3 flex items-center gap-3 rounded-card bg-surface px-4 py-3.5 shadow-card transition hover:ring-2 hover:ring-primary/30">
      <span className="grid h-11 w-11 flex-none place-items-center rounded-tile bg-primary-soft text-primary">
        <Wallet size={22} aria-hidden />
      </span>
      <span className="flex flex-1 flex-col">
        <span className="text-xs font-extrabold uppercase tracking-wider text-muted-soft">Tu dinero hoy</span>
        <span className="tabular text-xl font-black tracking-tight text-dark">{isHidden ? 'Q ••••••' : formatCurrency(total)}</span>
        <span className="text-xs font-bold text-muted-soft">{detalle} · tocá para verlas</span>
      </span>
      <ChevronRight size={20} className="flex-none text-primary" aria-hidden />
    </Link>
  );
}
