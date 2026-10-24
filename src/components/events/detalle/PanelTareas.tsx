/**
 * PanelTareas.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Pestaña "Tareas" del evento: el checklist y un campo para
 *            agregar una tarea nueva ("Comprar hielo").
 *
 * POR QUÉ EXISTE: Organizar el evento es la otra mitad del producto.
 *            Solo pinta y avisa: guardar es trabajo de useEventTasks.
 *            En un evento cerrado el checklist queda de solo lectura.
 *
 * DEPENDE DE: Checklist.tsx
 * ---------------------------------------------------------------
 */
'use client';

import { useState, type FormEvent } from 'react';
import { Plus } from 'lucide-react';
import { FormAlert } from '@/components/auth/AuthHeading';
import { TITULO_TAREA_MAX } from '@/services/taskService';
import type { EventTask } from '@/types/event';
import { Checklist } from '../Checklist';

interface PanelTareasProps {
  tareas: EventTask[];
  cargando: boolean;
  error: string | null;
  soloLectura: boolean;
  onAlternar: (id: string, hecha: boolean) => void;
  // Devuelve true si se agregó (para limpiar el campo).
  onAgregar: (titulo: string) => Promise<boolean>;
}

export function PanelTareas(props: PanelTareasProps) {
  if (props.cargando) return <div aria-busy className="h-32 animate-pulse rounded-card bg-white/70" />;
  return (
    <div className="flex flex-col gap-3">
      <FormAlert message={props.error} />
      <div className="rounded-card bg-white/60 p-2">
        <Checklist tasks={props.tareas} disabled={props.soloLectura} onToggle={props.onAlternar} />
      </div>
      {!props.soloLectura && <NuevaTarea onAgregar={props.onAgregar} />}
    </div>
  );
}

function NuevaTarea({ onAgregar }: { onAgregar: (titulo: string) => Promise<boolean> }) {
  const [titulo, setTitulo] = useState('');
  const [enviando, setEnviando] = useState(false);

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    if (await onAgregar(titulo)) setTitulo('');
    setEnviando(false);
  };

  return (
    <form onSubmit={enviar} className="flex items-center gap-2 rounded-card bg-white p-2 pl-4 shadow-card">
      <label htmlFor="nueva-tarea" className="sr-only">Nueva tarea</label>
      <input id="nueva-tarea" value={titulo} onChange={(e) => setTitulo(e.target.value)} maxLength={TITULO_TAREA_MAX}
        placeholder="Agregar tarea (ej. Comprar hielo)"
        className="min-w-0 flex-1 bg-transparent text-sm font-bold text-dark outline-none placeholder:text-muted-faint" />
      <button type="submit" disabled={titulo.trim() === '' || enviando} aria-label="Agregar tarea"
        className="grid h-10 w-10 flex-none place-items-center rounded-[14px] bg-primary text-white transition hover:bg-primary-dark disabled:opacity-40">
        <Plus size={20} strokeWidth={2.6} />
      </button>
    </form>
  );
}
