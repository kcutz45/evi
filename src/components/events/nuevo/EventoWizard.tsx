/**
 * EventoWizard.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Crear un evento paso a paso, a pantalla completa:
 *            1 ¿Qué evento es? → 2 ¿Cuándo es? → 3 ¿Cuánto querés gastar?
 *
 * POR QUÉ EXISTE: Mismo formato que el registro de movimientos (una
 *            pregunta por pantalla), así el usuario ya sabe usarlo. El
 *            estado vive en useEventoWizard; crear es trabajo de la
 *            página (onCrear), que luego lleva al detalle del evento.
 *
 * DEPENDE DE: hooks/useEventoWizard.ts, finance/registro/WizardHeader.tsx
 * USADO EN:   app/(dashboard)/eventos/page.tsx
 * ---------------------------------------------------------------
 */
'use client';

import { ArrowRight } from 'lucide-react';
import { WizardHeader } from '@/components/finance/registro/WizardHeader';
import { Button } from '@/components/ui/Button';
import { PASOS_EVENTO, useEventoWizard, type PasoEvento } from '@/hooks/useEventoWizard';
import type { NuevoEvento } from '@/types/event';
import { PasoFechaEvento } from './PasoFechaEvento';
import { PasoNombreEvento } from './PasoNombreEvento';
import { PasoPresupuesto } from './PasoPresupuesto';

interface EventoWizardProps {
  creando: boolean;
  error: string | null;
  onCrear: (datos: NuevoEvento) => void;
  onCerrar: () => void;
}

const TEXTOS: Record<PasoEvento, { titulo: string; subtitulo: string }> = {
  nombre: { titulo: '¿Qué evento es?', subtitulo: 'Ponele un nombre y elegí un ícono.' },
  fecha: { titulo: '¿Cuándo es?', subtitulo: 'Elegí la fecha. El lugar es opcional.' },
  presupuesto: { titulo: '¿Cuánto querés gastar?', subtitulo: 'Te avisamos cuando llevés el 80%.' },
};

export function EventoWizard({ creando, error, onCrear, onCerrar }: EventoWizardProps) {
  const w = useEventoWizard();
  const esUltimo = w.paso === 'presupuesto';

  return (
    <div className="fixed inset-0 z-50 bg-light">
      <div className="mx-auto flex h-dvh max-w-md flex-col">
        <WizardHeader numeroDePaso={w.numeroDePaso} totalDePasos={PASOS_EVENTO.length} {...TEXTOS[w.paso]}
          onVolver={w.paso === 'nombre' ? null : w.volver} onCerrar={onCerrar} />
        <div key={w.paso} className="flex min-h-0 flex-1 animate-step-in flex-col motion-reduce:animate-none">
          {w.paso === 'nombre' && <PasoNombreEvento w={w} />}
          {w.paso === 'fecha' && <PasoFechaEvento w={w} />}
          {esUltimo && <PasoPresupuesto calc={w.presupuesto} />}
        </div>
        <div className="flex flex-col gap-2 px-5 pb-5 pt-3">
          {esUltimo && error && <p role="alert" className="text-center text-xs font-bold text-gold-dark">{error}</p>}
          <Button variant={esUltimo ? 'mint' : 'primary'} size="lg" fullWidth
            disabled={!w.puedeAvanzar || creando} icon={esUltimo ? undefined : <ArrowRight size={20} strokeWidth={2.6} />}
            onClick={esUltimo ? () => onCrear(w.construir()) : w.siguiente}>
            {esUltimo ? (creando ? 'Creando…' : 'Crear evento') : 'Siguiente'}
          </Button>
        </div>
      </div>
    </div>
  );
}
