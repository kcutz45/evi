/**
 * PantallaPasoAPaso.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Marco de los flujos paso a paso (registro de movimiento y
 *            nuevo evento).
 *
 * POR QUÉ EXISTE: En el celular ocupan toda la pantalla: una pregunta a
 *            la vez, sin distracciones. En tablet y PC eso dejaría una
 *            columna perdida en un fondo vacío, así que se abren como
 *            ventana centrada sobre la página. Un celular acostado (poca
 *            altura) sigue a pantalla completa, aprovechando todo el ancho.
 * ---------------------------------------------------------------
 */
'use client';

import type { ReactNode } from 'react';
import { useVentana } from '@/hooks/useVentana';

export function PantallaPasoAPaso({ children }: { children: ReactNode }) {
  // Esc lo maneja WizardHeader: vuelve un paso, no cierra todo.
  const panel = useVentana<HTMLDivElement>();
  return (
    <div className="fixed inset-0 z-50 bg-light md:grid md:place-items-center md:bg-black/60 md:p-6 md:backdrop-blur-sm bajo:block bajo:bg-light bajo:p-0">
      <div ref={panel} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Paso a paso"
        className="mx-auto flex h-dvh max-w-md flex-col outline-none md:h-[min(800px,100%)] md:w-full md:overflow-hidden md:rounded-sheet md:bg-light md:shadow-float bajo:h-dvh bajo:max-w-3xl bajo:rounded-none bajo:shadow-none">
        {children}
      </div>
    </div>
  );
}
