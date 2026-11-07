/**
 * MarcoHoja.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Marco común de las hojas: fondo oscuro, panel, Esc para
 *            cerrar y foco dentro de la ventana.
 *
 * POR QUÉ EXISTE: Hoja, el cierre de evento y el detalle de un
 *            movimiento repetían el mismo marco; así los tres se comportan
 *            igual con mouse, dedo y teclado.
 *
 * DEPENDE DE: hooks/useVentana.ts
 * USADO EN:   components/ui/Hoja.tsx, events/CloseEventModal.tsx,
 *            finance/dinero/MovementDetailSheet.tsx
 * ---------------------------------------------------------------
 */
'use client';

import type { ReactNode } from 'react';
import { useVentana } from '@/hooks/useVentana';
import { cn } from '@/lib/cn';

interface MarcoHojaProps {
  onCerrar: () => void;
  etiquetaCerrar?: string;
  // Título que nombra la ventana (id de su <h2>) o, sin título, un texto.
  tituloId?: string;
  etiqueta?: string;
  clasePanel?: string;
  children: ReactNode;
}

export function MarcoHoja({ onCerrar, etiquetaCerrar = 'Cerrar', tituloId, etiqueta, clasePanel, children }: MarcoHojaProps) {
  const panel = useVentana<HTMLDivElement>(onCerrar);
  return (
    <div className="hoja-marco">
      <button type="button" tabIndex={-1} aria-label={etiquetaCerrar} onClick={onCerrar}
        className="absolute inset-0 bg-black/60 backdrop-blur-[1.5px]" />
      <div ref={panel} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby={tituloId} aria-label={etiqueta}
        className={cn('hoja-panel overflow-y-auto px-5 pb-6 pt-2 outline-none md:pt-5', clasePanel)}>
        <div aria-hidden className="mx-auto mb-3.5 h-[5px] w-11 rounded-full bg-line md:hidden" />
        {children}
      </div>
    </div>
  );
}
