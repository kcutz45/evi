/**
 * DeudasList.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Tarjetas por persona ("Ana te debe Q150.00") con cada
 *            cuenta y su botón Cobrar, y la lista de lo ya cobrado.
 *
 * POR QUÉ EXISTE: Cobrar es un toque. Si fue por error, "Deshacer" en la
 *            lista de cobrados lo devuelve a pendiente.
 * ---------------------------------------------------------------
 */
'use client';

import { useState } from 'react';
import { Check, ChevronDown, RotateCcw, UserRound } from 'lucide-react';
import { cn } from '@/lib/cn';
import { etiquetaDeDia } from '@/lib/dates';
import { formatCurrency } from '@/lib/formatCurrency';
import type { DeudaDePersona } from '@/lib/porCobrar';
import type { PorCobrar } from '@/types/receivable';

interface AccionProps {
  ocupadoId: string | null;
  onAlternar: (deuda: PorCobrar) => void;
}

export function TarjetaPersona({ persona, ocupadoId, onAlternar }: { persona: DeudaDePersona } & AccionProps) {
  return (
    <section className="rounded-card bg-white p-4 shadow-card">
      <header className="flex items-center gap-3">
        <span className="grid h-10 w-10 flex-none place-items-center rounded-full bg-gold/30 text-gold-ink">
          <UserRound size={20} aria-hidden />
        </span>
        <h2 className="flex-1 text-base font-black tracking-tight">{persona.nombre} te debe</h2>
        <span className="tabular text-lg font-black text-gold-dark">{formatCurrency(persona.pendiente)}</span>
      </header>
      <ul className="mt-3 flex flex-col divide-y divide-line">
        {persona.deudas.map((d) => (
          <FilaDeuda key={d.id} deuda={d} ocupadoId={ocupadoId} onAlternar={onAlternar} />
        ))}
      </ul>
    </section>
  );
}

function FilaDeuda({ deuda, ocupadoId, onAlternar }: { deuda: PorCobrar } & AccionProps) {
  const ocupado = ocupadoId === deuda.id;
  return (
    <li className="flex items-center gap-3 py-2.5">
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-extrabold">{deuda.concepto}</span>
        <span className="text-xs font-bold text-muted-soft">{deuda.fecha ? etiquetaDeDia(deuda.fecha) : ''}</span>
      </span>
      <span className="tabular text-sm font-black">{formatCurrency(deuda.monto)}</span>
      <button type="button" onClick={() => onAlternar(deuda)} disabled={ocupado}
        aria-label={deuda.cobrado ? `Deshacer cobro de ${deuda.nombre}` : `Marcar cobrado a ${deuda.nombre}`}
        className={cn('flex flex-none items-center gap-1 rounded-full px-3 py-1.5 text-xs font-black transition disabled:opacity-50',
          deuda.cobrado ? 'bg-light text-muted' : 'bg-mint text-mint-ink hover:brightness-95')}>
        {deuda.cobrado ? <RotateCcw size={13} aria-hidden /> : <Check size={14} strokeWidth={3} aria-hidden />}
        {ocupado ? '…' : deuda.cobrado ? 'Deshacer' : 'Cobrar'}
      </button>
    </li>
  );
}

export function ListaCobradas({ deudas, ocupadoId, onAlternar }: { deudas: PorCobrar[] } & AccionProps) {
  const [abierta, setAbierta] = useState(false);
  if (deudas.length === 0) return null;
  return (
    <section className="flex flex-col gap-2">
      <button type="button" onClick={() => setAbierta((a) => !a)} aria-expanded={abierta}
        className="flex items-center gap-1.5 self-start text-xs font-black uppercase tracking-widest text-muted-soft">
        Ya cobrado ({deudas.length})
        <ChevronDown size={15} className={cn('transition-transform', abierta && 'rotate-180')} aria-hidden />
      </button>
      {abierta && (
        <ul className="flex flex-col divide-y divide-line rounded-card bg-white px-4 shadow-card">
          {deudas.map((d) => (
            <FilaDeuda key={d.id} deuda={{ ...d, concepto: `${d.nombre} · ${d.concepto}` }}
              ocupadoId={ocupadoId} onAlternar={onAlternar} />
          ))}
        </ul>
      )}
    </section>
  );
}
