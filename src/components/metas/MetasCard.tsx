/**
 * MetasCard.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Tarjeta "Mis metas" del Inicio: cuánto llevás ahorrado (o
 *            una invitación a crear la primera meta) y el enlace a /metas.
 *
 * POR QUÉ EXISTE: Las metas no tienen pestaña propia en la barra de
 *            abajo (4 pestañas, §3); esta tarjeta es su puerta de entrada.
 * ---------------------------------------------------------------
 */
import Link from 'next/link';
import { ChevronRight, PiggyBank } from 'lucide-react';
import { formatCurrency } from '@/lib/formatCurrency';
import { RUTA_METAS } from '@/lib/routes';

interface MetasCardProps {
  metas: number;
  totalAhorrado: number;
  isHidden: boolean;
}

export function MetasCard({ metas, totalAhorrado, isHidden }: MetasCardProps) {
  const detalle = metas === 0 ? '¿Ahorrando para algo? Creá tu primera meta'
    : `${metas === 1 ? '1 meta' : `${metas} metas`} · Llevás ${isHidden ? 'Q ••••' : formatCurrency(totalAhorrado)}`;
  return (
    <Link href={RUTA_METAS}
      className="mt-3 flex items-center gap-3 rounded-card bg-surface px-4 py-3.5 shadow-card transition hover:ring-2 hover:ring-primary/30">
      <span className="grid h-11 w-11 flex-none place-items-center rounded-tile bg-mint-soft text-mint-dark">
        <PiggyBank size={22} aria-hidden />
      </span>
      <span className="flex flex-1 flex-col">
        <span className="text-xs font-extrabold uppercase tracking-wider text-muted-soft">Mis metas</span>
        <span className="text-[13.5px] font-bold text-dark">{detalle}</span>
      </span>
      <ChevronRight size={20} className="flex-none text-primary" aria-hidden />
    </Link>
  );
}
