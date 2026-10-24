/**
 * WizardHeader.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Encabezado de cada paso del registro: volver/cerrar, la
 *            barra de progreso "Paso 2 de 3" y la pregunta del paso.
 *
 * POR QUÉ EXISTE: Saber "dónde estoy y cuánto falta" es lo que hace que
 *            un flujo por pasos se sienta controlado y no un laberinto.
 * ---------------------------------------------------------------
 */
import { ArrowLeft, X } from 'lucide-react';
import { cn } from '@/lib/cn';

interface WizardHeaderProps {
  numeroDePaso: number;
  totalDePasos: number;
  titulo: string;
  subtitulo: string;
  // En el primer paso no hay a dónde volver: se muestra la X de cerrar.
  onVolver: (() => void) | null;
  onCerrar: () => void;
}

export function WizardHeader(props: WizardHeaderProps) {
  const puedeVolver = props.onVolver !== null;
  return (
    <header className="flex flex-col gap-4 px-5 pb-4 pt-4">
      <div className="flex items-center gap-3">
        <button type="button" onClick={props.onVolver ?? props.onCerrar}
          aria-label={puedeVolver ? 'Volver al paso anterior' : 'Cerrar sin guardar'}
          className="grid h-10 w-10 flex-none place-items-center rounded-[14px] bg-white shadow-card hover:bg-primary-soft">
          {puedeVolver ? <ArrowLeft size={20} strokeWidth={2.2} /> : <X size={20} strokeWidth={2.2} />}
        </button>
        <Progreso actual={props.numeroDePaso} total={props.totalDePasos} />
        {puedeVolver && (
          <button type="button" onClick={props.onCerrar} aria-label="Cerrar sin guardar"
            className="grid h-10 w-10 flex-none place-items-center rounded-[14px] text-muted-soft hover:bg-white">
            <X size={20} strokeWidth={2.2} />
          </button>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="text-[26px] font-black leading-tight tracking-tight">{props.titulo}</h2>
        <p className="text-sm font-semibold text-muted">{props.subtitulo}</p>
      </div>
    </header>
  );
}

function Progreso({ actual, total }: { actual: number; total: number }) {
  return (
    <div className="flex flex-1 flex-col gap-1.5" role="progressbar" aria-valuemin={1}
      aria-valuemax={total} aria-valuenow={actual + 1} aria-label={`Paso ${actual + 1} de ${total}`}>
      <span className="text-xs font-extrabold text-muted-soft">Paso {actual + 1} de {total}</span>
      <div className="flex gap-1.5">
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={cn('h-1.5 flex-1 rounded-full transition-colors',
            i <= actual ? 'bg-primary' : 'bg-line')} />
        ))}
      </div>
    </div>
  );
}
