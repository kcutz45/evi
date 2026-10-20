/**
 * Checklist.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Lista de tareas del evento (pestaña "Tareas" del detalle).
 *
 * POR QUÉ EXISTE: Marcar una tarea solo AVISA con onToggle; guardar en
 *            event_tasks y registrar event_task_completed es trabajo
 *            del hook useEvents.
 * ---------------------------------------------------------------
 */
import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { EventTask } from '@/types/event';

interface ChecklistProps {
  tasks: EventTask[];
  disabled?: boolean;
  onToggle: (taskId: string, isDone: boolean) => void;
}

export function Checklist({ tasks, disabled = false, onToggle }: ChecklistProps) {
  const done = tasks.filter((t) => t.isDone).length;

  if (tasks.length === 0) {
    return <p className="py-4 text-center text-sm font-semibold text-muted">Este evento no tiene tareas todavía.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-col gap-1">
        {tasks.map((task) => (
          <ChecklistItem key={task.id} task={task} disabled={disabled} onToggle={onToggle} />
        ))}
      </ul>
      <p className="text-right text-xs font-bold text-muted-soft">
        {done} de {tasks.length} completadas
      </p>
    </div>
  );
}

interface ChecklistItemProps {
  task: EventTask;
  disabled: boolean;
  onToggle: (taskId: string, isDone: boolean) => void;
}

// Checkbox nativo oculto (sr-only) + caja dibujada: se conserva la
// accesibilidad del teclado y el lector de pantalla con el diseño propio.
function ChecklistItem({ task, disabled, onToggle }: ChecklistItemProps) {
  return (
    <li>
      <label className="flex cursor-pointer items-center gap-3 rounded-tile px-2 py-2.5 hover:bg-white">
        <input
          type="checkbox"
          checked={task.isDone}
          disabled={disabled}
          onChange={(e) => onToggle(task.id, e.target.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden
          className={cn(
            'grid h-6 w-6 flex-none place-items-center rounded-lg border-2 transition-colors',
            'peer-focus-visible:ring-2 peer-focus-visible:ring-primary',
            task.isDone ? 'border-mint bg-mint text-mint-ink' : 'border-line bg-white text-transparent',
          )}
        >
          <Check size={15} strokeWidth={3} />
        </span>
        <span className={cn('text-sm font-bold', task.isDone ? 'text-muted-faint line-through' : 'text-dark')}>
          {task.title}
        </span>
      </label>
    </li>
  );
}
