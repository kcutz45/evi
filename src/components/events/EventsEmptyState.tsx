/**
 * EventsEmptyState.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Estado vacío de /eventos (Definición de Terminado, §7).
 *
 * POR QUÉ EXISTE: Una lista vacía sin explicación parece un error. Este
 *            estado dice qué hace la sección e invita a la acción.
 * ---------------------------------------------------------------
 */
import { CalendarPlus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function EventsEmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 px-2 pt-16 text-center">
      <div className="grid h-[108px] w-[108px] place-items-center rounded-[40px] bg-primary/15 text-primary">
        <CalendarPlus size={52} strokeWidth={1.5} aria-hidden />
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="text-[21px] font-black leading-tight tracking-tight">Todavía no tenés eventos</h2>
        <p className="px-3 text-sm font-semibold leading-relaxed text-muted">
          Armá una tardeada, un cumple o un viaje: EVI te lleva el presupuesto y las tareas.
        </p>
      </div>
      <Button size="lg" onClick={onCreate} className="mt-1.5">
        Crear mi primer evento
      </Button>
    </div>
  );
}
