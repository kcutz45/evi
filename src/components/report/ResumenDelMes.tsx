/**
 * ResumenDelMes.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: "Tu resumen": la frase que explica el mes en palabras
 *            (dónde gastaste más y cuánto al día) y cuánto de lo gastado
 *            vino de eventos cerrados.
 *
 * POR QUÉ EXISTE: Un número solo no dice nada; una frase sí. Mostrar lo
 *            que vino de eventos hace visible el diferenciador de EVI.
 * ---------------------------------------------------------------
 */
import { CalendarCheck, Lightbulb } from 'lucide-react';
import { toPercent } from '@/lib/budget';
import { formatCurrency } from '@/lib/formatCurrency';
import type { CategorySlice } from '@/types/category';

interface ResumenDelMesProps {
  mayor: CategorySlice;
  total: number;
  promedioDiario: number;
  desdeEventos: number;
}

export function ResumenDelMes({ mayor, total, promedioDiario, desdeEventos }: ResumenDelMesProps) {
  return (
    <section className="flex flex-col gap-2.5">
      <h2 className="text-lg font-black tracking-tight">Tu resumen</h2>
      <div className="flex gap-3 rounded-card bg-white p-4 shadow-card">
        <span className="grid h-10 w-10 flex-none place-items-center rounded-tile bg-gold/25 text-gold-dark">
          <Lightbulb size={20} aria-hidden />
        </span>
        <div className="flex flex-col gap-1">
          <p className="text-[15px] font-black leading-snug">Tu gasto más grande fue en {mayor.name}</p>
          <p className="text-[13px] font-semibold leading-relaxed text-muted">
            {formatCurrency(mayor.amount)} de {formatCurrency(total)}: el {toPercent(mayor.share)}% del mes. Un promedio
            de {formatCurrency(promedioDiario)} al día.
          </p>
        </div>
      </div>
      {desdeEventos > 0 && (
        <div className="flex items-center gap-3 rounded-card bg-primary-soft p-4">
          <CalendarCheck size={22} className="flex-none text-primary" aria-hidden />
          <p className="text-[13px] font-bold leading-relaxed text-closed-ink">
            <strong className="tabular font-black text-primary">{formatCurrency(desdeEventos)}</strong> vinieron de
            eventos que cerraste este mes.
          </p>
        </div>
      )}
    </section>
  );
}
