/**
 * PasoFechaEvento.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Paso 2 de "Nuevo evento": fecha (con atajos) y lugar
 *            opcional.
 *
 * POR QUÉ EXISTE: La mayoría de eventos son "este sábado" o "en una
 *            semana": un toque en el atajo es más rápido que abrir el
 *            calendario del celular. El calendario sigue disponible.
 * ---------------------------------------------------------------
 */
import { MapPin } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import type { EventoWizardEstado } from '@/hooks/useEventoWizard';
import { cn } from '@/lib/cn';
import { cuentaRegresiva, enDiasGT, fechaDeEvento, hoyGT, proximoSabadoGT } from '@/lib/dates';
import { NOMBRE_EVENTO_MAX } from '@/types/event';

const DIAS_SEMANA = 7;
const DIAS_MES = 30;

function atajos() {
  return [
    { etiqueta: 'Próximo sábado', fecha: proximoSabadoGT() },
    { etiqueta: 'En una semana', fecha: enDiasGT(DIAS_SEMANA) },
    { etiqueta: 'En un mes', fecha: enDiasGT(DIAS_MES) },
  ];
}

export function PasoFechaEvento({ w }: { w: EventoWizardEstado }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 pb-4">
      <div className="flex flex-wrap gap-2">
        {atajos().map((a) => (
          <button key={a.etiqueta} type="button" onClick={() => w.setFecha(a.fecha)} aria-pressed={w.fecha === a.fecha}
            className={cn('rounded-full px-4 py-2 text-[13px] font-extrabold transition active:scale-95',
              w.fecha === a.fecha ? 'bg-primary text-white shadow-glow-primary' : 'bg-white text-primary shadow-card')}>
            {a.etiqueta}
          </button>
        ))}
      </div>
      <Input label="O elegí otra fecha" type="date" value={w.fecha} min={hoyGT()}
        onChange={(e) => w.setFecha(e.target.value)} />
      {w.fecha && (
        <p className="rounded-tile bg-primary-soft px-4 py-3 text-center text-sm font-extrabold text-primary" aria-live="polite">
          {fechaDeEvento(w.fecha)} · {cuentaRegresiva(w.fecha)}
        </p>
      )}
      <Input label="¿Dónde? (opcional)" value={w.lugar} maxLength={NOMBRE_EVENTO_MAX} placeholder="Ej. Casa de Sofi"
        icon={<MapPin size={18} aria-hidden />} onChange={(e) => w.setLugar(e.target.value)} />
    </div>
  );
}
