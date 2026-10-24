/**
 * MonthHeader.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Selector de mes (‹ Octubre 2026 ›) y los totales del mes
 *            elegido en la pantalla Dinero.
 *
 * POR QUÉ EXISTE: "¿Cuánto gasté en septiembre?" es la segunda pregunta
 *            más común después de "¿cuánto llevo este mes?". No se
 *            permite ir a meses futuros: no hay nada que ver ahí.
 * ---------------------------------------------------------------
 */
import type { ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency } from '@/lib/formatCurrency';
import { cn } from '@/lib/cn';

interface MonthHeaderProps {
  etiqueta: string;
  puedeAvanzar: boolean;
  onAnterior: () => void;
  onSiguiente: () => void;
  ingresos: number;
  egresos: number;
  isLoading: boolean;
}

export function MonthHeader(props: MonthHeaderProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between rounded-[18px] bg-white p-2 shadow-card">
        <BotonMes etiqueta="Mes anterior" onClick={props.onAnterior}><ChevronLeft size={19} strokeWidth={2.3} /></BotonMes>
        <span className="text-[15.5px] font-black tracking-tight">{props.etiqueta}</span>
        <BotonMes etiqueta="Mes siguiente" onClick={props.onSiguiente} deshabilitado={!props.puedeAvanzar}>
          <ChevronRight size={19} strokeWidth={2.3} />
        </BotonMes>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <Total titulo="Ingresos" monto={props.ingresos} isLoading={props.isLoading} esIngreso />
        <Total titulo="Egresos" monto={props.egresos} isLoading={props.isLoading} />
      </div>
    </div>
  );
}

interface BotonMesProps {
  etiqueta: string;
  onClick: () => void;
  deshabilitado?: boolean;
  children: ReactNode;
}

function BotonMes({ etiqueta, onClick, deshabilitado = false, children }: BotonMesProps) {
  return (
    <button type="button" onClick={onClick} disabled={deshabilitado} aria-label={etiqueta}
      className="grid h-9 w-9 place-items-center rounded-[13px] bg-primary-soft text-primary hover:bg-line disabled:opacity-30">
      {children}
    </button>
  );
}

function Total({ titulo, monto, isLoading, esIngreso = false }: { titulo: string; monto: number; isLoading: boolean; esIngreso?: boolean }) {
  return (
    <div className="rounded-[18px] bg-white px-4 py-3 shadow-card">
      <span className="text-xs font-extrabold uppercase tracking-wider text-muted-soft">{titulo}</span>
      <p className={cn('tabular mt-0.5 text-lg font-black tracking-tight', esIngreso ? 'text-mint-dark' : 'text-dark',
        isLoading && 'animate-pulse text-line')}>
        {formatCurrency(monto)}
      </p>
    </div>
  );
}
