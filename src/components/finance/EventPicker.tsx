/**
 * EventPicker.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Selector opcional "Asignar a un evento" del registro.
 *
 * POR QUÉ EXISTE: Asignar el gasto a un evento activo es lo que luego
 *            permite transferirlo al cerrar el evento (diferenciador).
 *            Solo recibe eventos ACTIVOS: a uno cerrado la base ya no
 *            le acepta gastos (trigger movements_accounting).
 *
 * NOTA:      El estado "abierto/cerrado" del menú es estado visual,
 *            por eso puede vivir aquí sin romper SRP.
 * ---------------------------------------------------------------
 */
'use client';

import { useState } from 'react';
import { CalendarDays, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';

interface EventOption {
  id: string;
  name: string;
}

interface EventPickerProps {
  events: EventOption[];
  selectedId: string | null;
  onSelect: (eventId: string | null) => void;
}

export function EventPicker({ events, selectedId, onSelect }: EventPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selected = events.find((e) => e.id === selectedId);

  const choose = (eventId: string | null) => {
    onSelect(eventId);
    setIsOpen(false);
  };

  if (events.length === 0) return null;

  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="flex w-full items-center gap-2 rounded-tile bg-white px-3.5 py-3 text-left hover:bg-light"
      >
        <CalendarDays size={17} className="flex-none text-primary" aria-hidden />
        <span className={cn('flex-1 text-[13.5px] font-bold', selected ? 'text-dark' : 'text-muted-soft')}>
          {selected?.name ?? 'Asignar a un evento (opcional)'}
        </span>
        <ChevronRight size={16} className="flex-none text-muted-faint" aria-hidden />
      </button>

      {isOpen && <EventOptions events={events} selectedId={selectedId} onChoose={choose} />}
    </div>
  );
}

// "Ninguno" usa id vacío para poder desasignar el evento.
const NONE_OPTION: EventOption = { id: '', name: 'Ninguno' };

interface EventOptionsProps {
  events: EventOption[];
  selectedId: string | null;
  onChoose: (eventId: string | null) => void;
}

function EventOptions({ events, selectedId, onChoose }: EventOptionsProps) {
  return (
    <ul className="absolute inset-x-0 top-full z-20 mt-1.5 flex flex-col gap-1 rounded-tile bg-white p-2 shadow-float">
      {[...events, NONE_OPTION].map((option) => (
        <li key={option.id || 'ninguno'}>
          <button
            type="button"
            onClick={() => onChoose(option.id || null)}
            className={cn(
              'w-full rounded-xl px-3 py-2.5 text-left text-[13.5px] font-extrabold',
              option.id === (selectedId ?? '') && 'bg-primary-soft',
              option.id ? 'text-dark' : 'text-muted-soft',
            )}
          >
            {option.name}
          </button>
        </li>
      ))}
    </ul>
  );
}
