/**
 * CloseEventModal.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Hoja modal del cierre de evento — LA pantalla del
 *            diferenciador (§3, 4c).
 *
 * POR QUÉ EXISTE: Le muestra al usuario, antes de confirmar, cuánto
 *            planeó, cuánto gastó y a qué mes van a pasar los gastos.
 *            Al confirmar NO hace el cierre: llama onConfirm, y el hook
 *            invoca la RPC atómica close_event_and_transfer.
 *
 * DEPENDE DE: CloseEventSummary.tsx, TransferAnimation.tsx
 * USADO EN:   app/(dashboard)/eventos/[id]/page.tsx
 * ---------------------------------------------------------------
 */
'use client';

import { Check, CircleCheck, Info } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/formatCurrency';
import { CloseEventSummary } from './CloseEventSummary';
import { TransferAnimation } from './TransferAnimation';

interface CloseEventModalProps {
  isOpen: boolean;
  eventName: string;
  planned: number;
  actual: number;
  expensesCount: number;
  targetMonthLabel: string;
  isClosing: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function CloseEventModal(props: CloseEventModalProps) {
  if (!props.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <button type="button" aria-label="Cancelar cierre" onClick={props.onCancel}
        className="absolute inset-0 bg-dark/70 backdrop-blur-[1.5px]" />
      <div role="dialog" aria-modal="true" aria-labelledby="close-event-title"
        className="relative mx-auto max-h-full w-full max-w-md animate-sheet-in overflow-y-auto rounded-t-sheet bg-light px-5 pb-6 pt-2 shadow-float motion-reduce:animate-none">
        <div aria-hidden className="mx-auto mb-3.5 h-[5px] w-11 rounded-full bg-line" />
        <ModalTitle eventName={props.eventName} />
        <CloseEventSummary planned={props.planned} actual={props.actual} />
        <div className="mt-2.5 rounded-[22px] bg-white px-4 py-3.5 shadow-card">
          <TransferAnimation />
          <p className="mt-0.5 border-t border-line px-0.5 pt-3 text-center text-[15px] font-bold leading-normal text-closed-ink">
            {props.expensesCount === 1 ? 'El ' : 'Los '}
            <strong className="font-black text-dark">{expensesLabel(props.expensesCount)}</strong> de este evento (
            <strong className="font-black text-dark">{formatCurrency(props.actual)}</strong>) pasarán a tus
            finanzas personales de <strong className="font-black text-dark">{props.targetMonthLabel}</strong>.
          </p>
        </div>
        <p className="mt-2.5 flex items-center justify-center gap-2 text-[12.5px] font-bold text-muted">
          <Info size={15} className="flex-none text-muted-soft" aria-hidden />
          Después de cerrarlo ya no podrás agregar gastos.
        </p>
        {props.error && <p role="alert" className="mt-2 text-center text-xs font-bold text-gold-dark">{props.error}</p>}
        <ModalActions isClosing={props.isClosing} onConfirm={props.onConfirm} onCancel={props.onCancel} />
      </div>
    </div>
  );
}

function expensesLabel(count: number): string {
  return count === 1 ? '1 gasto' : `${count} gastos`;
}

function ModalTitle({ eventName }: { eventName: string }) {
  return (
    <div className="flex flex-col items-center gap-2.5 text-center">
      <span className="inline-flex items-center gap-1.5 rounded-xl bg-primary/10 px-3 py-1.5 text-[11.5px] font-black uppercase tracking-widest text-primary-dark">
        <CircleCheck size={14} strokeWidth={2.4} aria-hidden />
        Cierre de evento
      </span>
      <h2 id="close-event-title" className="px-1.5 text-2xl font-black leading-tight tracking-tight">
        Cerrar {eventName}
      </h2>
    </div>
  );
}

interface ModalActionsProps {
  isClosing: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function ModalActions({ isClosing, onConfirm, onCancel }: ModalActionsProps) {
  return (
    <div className="mt-3.5 flex flex-col gap-1.5">
      {/* disabled mientras cierra: evita el doble toque (la RPC además bloquea la fila). */}
      <Button variant="mint" size="lg" fullWidth disabled={isClosing} onClick={onConfirm}
        icon={<Check size={20} strokeWidth={2.6} />}>
        {isClosing ? 'Pasando tus gastos…' : 'Cerrar evento y pasar los gastos'}
      </Button>
      <Button variant="ghost" fullWidth disabled={isClosing} onClick={onCancel}>
        Todavía no
      </Button>
    </div>
  );
}
