/**
 * PestanasEvento.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Selector "Tareas | Gastos" del detalle del evento.
 *
 * POR QUÉ EXISTE: En el celular no caben las dos listas a la vez; dos
 *            pestañas con su contador dejan ver ambas con un toque.
 *            Usa los roles ARIA de pestañas para el lector de pantalla.
 * ---------------------------------------------------------------
 */
import { cn } from '@/lib/cn';

export type Pestana = 'tareas' | 'gastos';

interface PestanasEventoProps {
  activa: Pestana;
  tareasPendientes: number;
  gastos: number;
  onCambiar: (pestana: Pestana) => void;
}

export function PestanasEvento({ activa, tareasPendientes, gastos, onCambiar }: PestanasEventoProps) {
  const opciones: Array<{ id: Pestana; texto: string; cuenta: number }> = [
    { id: 'tareas', texto: 'Tareas', cuenta: tareasPendientes },
    { id: 'gastos', texto: 'Gastos', cuenta: gastos },
  ];
  return (
    <div role="tablist" aria-label="Secciones del evento" className="grid grid-cols-2 gap-1 rounded-tile bg-line/60 p-1">
      {opciones.map((o) => (
        <button key={o.id} type="button" role="tab" id={`tab-${o.id}`} aria-selected={activa === o.id}
          aria-controls={`panel-${o.id}`} onClick={() => onCambiar(o.id)}
          className={cn('flex items-center justify-center gap-2 rounded-[13px] py-2.5 text-sm font-black transition',
            activa === o.id ? 'bg-white text-dark shadow-card' : 'text-muted hover:text-dark')}>
          {o.texto}
          {o.cuenta > 0 && (
            <span className="tabular rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-black text-primary">
              {o.cuenta}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
