/**
 * TeDebenCard.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Tarjeta del Inicio "Te deben Q200.00 · 2 personas" que
 *            lleva a la lista de deudas.
 *
 * POR QUÉ EXISTE: Es el "dinero flotante": no es un gasto tuyo ni un
 *            ingreso, pero es plata tuya que tiene que volver. Solo
 *            aparece si hay algo pendiente, para no ocupar espacio.
 * ---------------------------------------------------------------
 */
import Link from 'next/link';
import { ChevronRight, HandCoins } from 'lucide-react';
import { formatCurrency } from '@/lib/formatCurrency';
import { RUTA_POR_COBRAR } from '@/lib/routes';
import type { ResumenPorCobrar } from '@/types/receivable';

export function TeDebenCard({ resumen }: { resumen: ResumenPorCobrar }) {
  if (resumen.total <= 0) return null;
  const personas = resumen.personas === 1 ? '1 persona' : `${resumen.personas} personas`;

  return (
    <Link href={RUTA_POR_COBRAR}
      className="mt-3 flex items-center gap-3 rounded-card bg-gold/25 px-4 py-3.5 transition hover:bg-gold/35">
      <span className="grid h-11 w-11 flex-none place-items-center rounded-tile bg-gold text-gold-ink">
        <HandCoins size={22} aria-hidden />
      </span>
      <span className="flex flex-1 flex-col">
        <span className="text-xs font-extrabold uppercase tracking-wider text-gold-ink">Te deben</span>
        <span className="tabular text-xl font-black tracking-tight text-dark">{formatCurrency(resumen.total)}</span>
        <span className="text-xs font-bold text-gold-ink">{personas} · tocá para cobrar</span>
      </span>
      <ChevronRight size={20} className="flex-none text-gold-dark" aria-hidden />
    </Link>
  );
}
