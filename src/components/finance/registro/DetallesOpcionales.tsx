/**
 * DetallesOpcionales.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: "+ Agregar nota o evento (opcional)" del paso "¿Cuánto?".
 *
 * POR QUÉ EXISTE: La nota y el evento son útiles pero no obligatorios.
 *            Plegados, no distraen a quien solo quiere registrar rápido;
 *            al abrirlos se explica qué pasa con un gasto de evento.
 *
 * NOTA:      Abierto/cerrado es estado visual: vive aquí.
 * ---------------------------------------------------------------
 */
'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, NotebookPen } from 'lucide-react';
import { EventPicker } from '@/components/finance/EventPicker';
import { cn } from '@/lib/cn';

export interface DetallesOpcionalesProps {
  nota: string;
  onNota: (nota: string) => void;
  // null = no aplica (ingresos): no se muestra el selector de evento.
  eventos: Array<{ id: string; name: string }> | null;
  eventoId: string | null;
  onEvento: (id: string | null) => void;
}

export function DetallesOpcionales(props: DetallesOpcionalesProps) {
  const [abierto, setAbierto] = useState(Boolean(props.nota || props.eventoId));
  const textoBoton = props.eventos ? 'Agregar nota o evento' : 'Agregar una nota';
  const panel = useRef<HTMLDivElement>(null);

  // En celulares chicos el panel puede abrirse fuera de la vista: se lleva
  // a la vista para que el usuario vea que algo pasó al tocar.
  useEffect(() => {
    if (abierto) panel.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [abierto]);

  return (
    <div className="flex flex-col gap-2">
      <button type="button" onClick={() => setAbierto((a) => !a)} aria-expanded={abierto}
        className="flex items-center justify-center gap-1.5 py-1 text-[13px] font-extrabold text-primary">
        {textoBoton} <span className="font-semibold text-muted-soft">(opcional)</span>
        <ChevronDown size={16} className={cn('transition-transform', abierto && 'rotate-180')} aria-hidden />
      </button>
      {abierto && (
        <div ref={panel} className="flex flex-col gap-2 pb-1">
          <label className="flex items-center gap-2 rounded-tile bg-white px-3.5 py-3">
            <NotebookPen size={17} className="flex-none text-muted-faint" aria-hidden />
            <span className="sr-only">Nota</span>
            <input type="text" value={props.nota} maxLength={140} onChange={(e) => props.onNota(e.target.value)}
              placeholder="Ej. Almuerzo con Sofía"
              className="min-w-0 flex-1 bg-transparent text-sm font-bold text-dark outline-none placeholder:text-muted-faint" />
          </label>
          {props.eventos && (
            <EventPicker events={props.eventos} selectedId={props.eventoId} onSelect={props.onEvento} />
          )}
          {/* Solo si el evento sigue activo: uno cerrado ya transfirió sus gastos. */}
          {props.eventoId && props.eventos?.some((e) => e.id === props.eventoId) && (
            <p className="px-1 text-xs font-semibold leading-snug text-muted">
              Este gasto queda <strong className="text-gold-dark">pendiente</strong> en el evento: pasa a tu
              balance cuando cerrés el evento.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
