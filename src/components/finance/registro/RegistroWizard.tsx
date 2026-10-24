/**
 * RegistroWizard.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Registro de un movimiento paso a paso, a pantalla completa:
 *            1 ¿Gasto o ingreso? → 2 ¿En qué? → 3 ¿Cuánto? → ¡Listo!
 *
 * POR QUÉ EXISTE: Reemplaza al formulario de una sola pantalla, que a
 *            varios usuarios se les complicó (24/10/2026). Une los pasos;
 *            el estado vive en useRegistroWizard y guardar es trabajo de
 *            la página (onGuardar). En escritorio se ve como una columna
 *            de celular centrada (max-w-md): el MVP es móvil primero.
 *
 * DEPENDE DE: hooks/useRegistroWizard.ts y los Paso*.tsx de esta carpeta
 * USADO EN:   app/(dashboard)/inicio/page.tsx, app/demo/page.tsx
 * ---------------------------------------------------------------
 */
'use client';

import { useState } from 'react';
import { PASOS_NUMERADOS, useRegistroWizard } from '@/hooks/useRegistroWizard';
import type { Category } from '@/types/category';
import type { MovementDraft } from '@/types/movement';
import { PasoCategoria } from './PasoCategoria';
import { PasoListo } from './PasoListo';
import { PasoMonto } from './PasoMonto';
import { PasoTipo } from './PasoTipo';
import { WizardHeader } from './WizardHeader';

interface RegistroWizardProps {
  categorias: Category[];
  usos: string[];
  eventosActivos: Array<{ id: string; name: string }>;
  guardando: boolean;
  errorGuardado: string | null;
  // Devuelve true si se guardó; el wizard muestra entonces "¡Listo!".
  onGuardar: (draft: MovementDraft, segundos: number) => Promise<boolean>;
  onCerrar: () => void;
}

const TEXTOS = {
  tipo: { titulo: '¿Qué querés registrar?', sub: 'Tocá una opción para empezar.' },
  categoria: {
    egreso: { titulo: '¿En qué gastaste?', sub: 'Elegí la categoría que mejor lo describa.' },
    ingreso: { titulo: '¿De dónde vino el dinero?', sub: 'Elegí la categoría que mejor lo describa.' },
  },
  monto: {
    egreso: { titulo: '¿Cuánto gastaste?', sub: 'Podés sumar o multiplicar: 3 × 35.' },
    ingreso: { titulo: '¿Cuánto recibiste?', sub: 'Podés sumar o multiplicar: 2 × 750.' },
  },
};

export function RegistroWizard(props: RegistroWizardProps) {
  const w = useRegistroWizard();
  const [errorLocal, setErrorLocal] = useState<string | null>(null);
  const categoria = props.categorias.find((c) => c.id === w.categoriaId);
  const evento = props.eventosActivos.find((e) => e.id === w.eventoId);

  const guardar = async () => {
    const borrador = w.construirBorrador();
    if (!borrador.ok) return setErrorLocal(borrador.error);
    setErrorLocal(null);
    if (await props.onGuardar(borrador.draft, borrador.segundos)) w.terminar();
  };

  return (
    <div className="fixed inset-0 z-50 bg-light">
      <div className="mx-auto flex h-dvh max-w-md flex-col">
        {w.paso === 'listo' ? (
          <PasoListo monto={w.calc.total} categoria={categoria?.name ?? 'Sin categoría'}
            esIngreso={w.tipo === 'ingreso'} evento={evento?.name ?? null} onListo={props.onCerrar} />
        ) : (
          <>
            <WizardHeader numeroDePaso={w.numeroDePaso} totalDePasos={PASOS_NUMERADOS.length}
              {...textosDelPaso(w.paso, w.tipo)} onVolver={w.paso === 'tipo' ? null : w.volver}
              onCerrar={props.onCerrar} />
            {w.paso === 'tipo' && <PasoTipo onElegir={w.elegirTipo} />}
            {w.paso === 'categoria' && (
              <PasoCategoria categorias={props.categorias.filter((c) => c.kind === w.tipo)}
                usos={props.usos} seleccionadaId={w.categoriaId} onElegir={w.elegirCategoria} />
            )}
            {w.paso === 'monto' && (
              <PasoMonto categoria={categoria} esIngreso={w.tipo === 'ingreso'} calc={w.calc}
                detalles={{ nota: w.nota, onNota: w.setNota, eventoId: w.eventoId, onEvento: w.setEventoId,
                  eventos: w.tipo === 'egreso' ? props.eventosActivos : null }}
                error={errorLocal ?? props.errorGuardado} guardando={props.guardando}
                onCambiarCategoria={w.volver} onGuardar={guardar} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function textosDelPaso(paso: 'tipo' | 'categoria' | 'monto', tipo: 'egreso' | 'ingreso') {
  const t = paso === 'tipo' ? TEXTOS.tipo : TEXTOS[paso][tipo];
  return { titulo: t.titulo, subtitulo: t.sub };
}
