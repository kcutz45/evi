/**
 * PasoNombreEvento.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Paso 1 de "Nuevo evento": nombre + ícono.
 *
 * POR QUÉ EXISTE: El ícono hace que el evento se reconozca de un vistazo
 *            en la lista (pastel = cumple, palmera = viaje). Solo pinta:
 *            el estado vive en useEventoWizard.
 * ---------------------------------------------------------------
 */
import { AppIcon, EVENT_ICON_NAMES } from '@/components/ui/AppIcon';
import type { EventoWizardEstado } from '@/hooks/useEventoWizard';
import { cn } from '@/lib/cn';
import { NOMBRE_EVENTO_MAX } from '@/types/event';

export function PasoNombreEvento({ w }: { w: EventoWizardEstado }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 pb-4">
      <label className="flex items-center gap-3 rounded-card bg-white p-3 shadow-card">
        <span className="grid h-12 w-12 flex-none place-items-center rounded-full bg-primary-soft text-primary">
          <AppIcon name={w.icono} size={24} />
        </span>
        <span className="sr-only">Nombre del evento</span>
        <input type="text" value={w.nombre} onChange={(e) => w.setNombre(e.target.value)} autoFocus
          maxLength={NOMBRE_EVENTO_MAX} placeholder="Ej. Cumple de Sofi"
          className="min-w-0 flex-1 bg-transparent text-lg font-black text-dark outline-none placeholder:text-muted-faint" />
      </label>
      <section className="flex flex-col gap-2">
        <h3 className="text-xs font-black uppercase tracking-widest text-muted-soft">Elegí un ícono</h3>
        <div role="radiogroup" aria-label="Ícono del evento" className="grid grid-cols-5 gap-2">
          {EVENT_ICON_NAMES.map((nombreIcono) => (
            <button key={nombreIcono} type="button" role="radio" aria-checked={w.icono === nombreIcono}
              aria-label={nombreIcono} onClick={() => w.setIcono(nombreIcono)}
              className={cn('grid aspect-square place-items-center rounded-tile transition active:scale-95',
                w.icono === nombreIcono ? 'bg-primary text-white shadow-glow-primary' : 'bg-white text-primary shadow-card')}>
              <AppIcon name={nombreIcono} size={22} />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
