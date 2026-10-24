/**
 * TotalGastado.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Tarjeta "Total gastado" del reporte, con la comparación
 *            contra el mes anterior.
 *
 * POR QUÉ EXISTE: "¿Gasté más o menos que el mes pasado?" es la primera
 *            pregunta al abrir un reporte. Gastar más se pinta dorado,
 *            nunca rojo (§3, sistema visual): avisar sin regañar.
 * ---------------------------------------------------------------
 */
import { ArrowDown } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatCurrency } from '@/lib/formatCurrency';
import type { Comparacion } from '@/lib/report';

interface TotalGastadoProps {
  total: number;
  comparacion: Comparacion | null;
  nombreMesAnterior: string;
}

export function TotalGastado({ total, comparacion, nombreMesAnterior }: TotalGastadoProps) {
  return (
    <section className="flex flex-col rounded-card bg-white p-[18px] shadow-card">
      <span className="text-[13px] font-extrabold text-muted">Total gastado</span>
      <span className="tabular mt-1 text-[34px] font-black leading-none tracking-tighter">{formatCurrency(total)}</span>
      <Chip comparacion={comparacion} nombreMesAnterior={nombreMesAnterior} />
    </section>
  );
}

function Chip({ comparacion, nombreMesAnterior }: Omit<TotalGastadoProps, 'total'>) {
  if (!comparacion) {
    return <span className="mt-2 text-[13px] font-bold text-muted-soft">Sin gastos en {nombreMesAnterior} para comparar</span>;
  }
  const texto = comparacion.diferencia === 0
    ? `Gastaste lo mismo que en ${nombreMesAnterior}`
    : `Gastaste ${formatCurrency(comparacion.diferencia)} ${comparacion.subio ? 'más' : 'menos'} que en ${nombreMesAnterior}`;
  return (
    <span className={cn('mt-2 inline-flex items-center gap-1.5 self-start rounded-[14px] px-3 py-1.5 text-[13.5px] font-extrabold',
      comparacion.subio ? 'bg-gold/30 text-gold-ink' : 'bg-mint-soft text-mint-dark')}>
      <ArrowDown size={15} strokeWidth={2.6} aria-hidden className={cn(comparacion.subio && 'rotate-180')} />
      {texto}
    </span>
  );
}
