/**
 * MovementDetailSheet.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Hoja que sube desde abajo con el detalle de un movimiento
 *            y los botones Editar y Eliminar.
 *
 * POR QUÉ EXISTE: Eliminar no se puede deshacer, así que pide una
 *            confirmación clara en la misma hoja (sin ventanas del
 *            navegador). Editar abre el registro paso a paso ya cargado.
 *
 * NOTA:      "¿Seguro?" es estado visual: vive aquí. Las acciones llegan
 *            por props.
 * ---------------------------------------------------------------
 */
'use client';

import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { FormAlert } from '@/components/auth/AuthHeading';
import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { fechaLarga } from '@/lib/dates';
import { formatCurrency, formatSignedCurrency } from '@/lib/formatCurrency';
import type { MovementDetalle } from '@/types/movement';

interface MovementDetailSheetProps {
  movimiento: MovementDetalle;
  ocupado: boolean;
  error: string | null;
  onEditar: () => void;
  onEliminar: () => void;
  onCerrar: () => void;
}

export function MovementDetailSheet({ movimiento: m, ocupado, error, onEditar, onEliminar, onCerrar }: MovementDetailSheetProps) {
  const [confirmando, setConfirmando] = useState(false);
  const esIngreso = m.type === 'ingreso';

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <button type="button" aria-label="Cerrar detalle" onClick={onCerrar} className="absolute inset-0 bg-dark/60" />
      <div role="dialog" aria-modal="true" aria-label="Detalle del movimiento"
        className="relative mx-auto w-full max-w-md animate-sheet-in rounded-t-sheet bg-light px-5 pb-6 pt-2 motion-reduce:animate-none">
        <div aria-hidden className="mx-auto mb-4 h-[5px] w-11 rounded-full bg-line" />
        <div className="flex flex-col items-center gap-2 text-center">
          <span className={cn('grid h-14 w-14 place-items-center rounded-tile',
            esIngreso ? 'bg-mint-soft text-mint-dark' : 'bg-primary-soft text-primary')}>
            <AppIcon name={m.categoryIcon} size={26} />
          </span>
          <span className="text-base font-extrabold">{m.title}</span>
          <span className={cn('tabular text-4xl font-black tracking-tighter', esIngreso ? 'text-mint-dark' : 'text-dark')}>
            {formatSignedCurrency(m.amount, esIngreso)}
          </span>
        </div>
        <dl className="mt-5 flex flex-col divide-y divide-line rounded-card bg-white px-4 shadow-card">
          <Fila etiqueta="Categoría" valor={m.categoryName} />
          <Fila etiqueta="Fecha" valor={fechaLarga(m.occurredOn)} />
          {m.eventName && <Fila etiqueta="Evento" valor={m.eventName} />}
          {m.eventName && <Fila etiqueta="Estado" valor={m.isPending ? 'Pendiente: suma al cerrar el evento' : 'Pasado a tus finanzas'} />}
          {m.note && m.note !== m.title && <Fila etiqueta="Nota" valor={m.note} />}
        </dl>
        <DivisionResumen personas={m.porCobrar} />
        {error && <div className="mt-3"><FormAlert message={error} /></div>}
        {confirmando ? (
          <Confirmacion esIngreso={esIngreso} conDeudas={m.porCobrar.length > 0} ocupado={ocupado} onSi={onEliminar} onNo={() => setConfirmando(false)} />
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <Button variant="soft" icon={<Trash2 size={17} aria-hidden />} onClick={() => setConfirmando(true)}>Eliminar</Button>
            <Button icon={<Pencil size={17} aria-hidden />} onClick={onEditar}>Editar</Button>
          </div>
        )}
      </div>
    </div>
  );
}

function Fila({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <dt className="text-sm font-bold text-muted-soft">{etiqueta}</dt>
      <dd className="text-right text-sm font-extrabold">{valor}</dd>
    </div>
  );
}

interface ConfirmacionProps {
  esIngreso: boolean;
  // El gasto dividido arrastra sus deudas (ON DELETE CASCADE): se avisa.
  conDeudas: boolean;
  ocupado: boolean;
  onSi: () => void;
  onNo: () => void;
}

function Confirmacion({ esIngreso, conDeudas, ocupado, onSi, onNo }: ConfirmacionProps) {
  return (
    <div className="mt-4 flex flex-col gap-2.5 rounded-card bg-gold/25 p-4">
      <p className="text-center text-sm font-extrabold text-gold-ink">
        ¿Eliminar este {esIngreso ? 'ingreso' : 'gasto'}?{conDeudas && ' También se borran sus deudas por cobrar.'} No se
        puede deshacer.
      </p>
      <div className="grid grid-cols-2 gap-2.5">
        <Button variant="ghost" onClick={onNo} disabled={ocupado}>Cancelar</Button>
        <Button onClick={onSi} disabled={ocupado}>{ocupado ? 'Eliminando…' : 'Sí, eliminar'}</Button>
      </div>
    </div>
  );
}

// Gasto dividido: con quién y si ya te pagaron.
function DivisionResumen({ personas }: { personas: MovementDetalle['porCobrar'] }) {
  if (personas.length === 0) return null;
  return (
    <div className="mt-3 rounded-card bg-gold/20 px-4 py-3">
      <p className="text-xs font-black uppercase tracking-widest text-gold-ink">Dividida con</p>
      <ul className="mt-1.5 flex flex-col gap-1">
        {personas.map((p, i) => (
          <li key={i} className="flex items-center justify-between text-sm font-bold">
            <span>{p.nombre}</span>
            <span className="tabular">
              {formatCurrency(p.monto)}{' '}
              <span className={cn('text-xs', p.cobrado ? 'text-mint-dark' : 'text-gold-dark')}>
                {p.cobrado ? '· cobrado' : '· pendiente'}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
