/**
 * PasoListo.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Pantalla de éxito a pantalla completa: ✓, el monto y en
 *            qué quedó guardado. Vuelve sola al inicio.
 *
 * POR QUÉ EXISTE: Una confirmación clara y grande da tranquilidad ("sí
 *            se guardó"). Si el gasto quedó pendiente en un evento, lo
 *            explica aquí, que es cuando al usuario le importa (§4d).
 *
 * DEPENDE DE: lib/constants.ts (REGISTRO_EXITO_MS)
 * ---------------------------------------------------------------
 */
'use client';

import { useEffect } from 'react';
import { Check } from 'lucide-react';
import { REGISTRO_EXITO_MS } from '@/lib/constants';

interface PasoListoProps {
  monto: string;
  categoria: string;
  esIngreso: boolean;
  // Si el gasto quedó pendiente en un evento, su nombre.
  evento: string | null;
  onListo: () => void;
}

export function PasoListo({ monto, categoria, esIngreso, evento, onListo }: PasoListoProps) {
  // Con un evento pendiente hay más que leer: se queda el doble de tiempo.
  const duracion = evento ? REGISTRO_EXITO_MS * 2 : REGISTRO_EXITO_MS;

  useEffect(() => {
    const timer = window.setTimeout(onListo, duracion);
    return () => window.clearTimeout(timer);
  }, [onListo, duracion]);

  return (
    <button type="button" onClick={onListo} aria-label="Volver al inicio"
      className="flex h-full w-full flex-col items-center justify-center gap-4 bg-mint px-8 text-center text-mint-ink">
      <span className="grid h-24 w-24 animate-pop place-items-center rounded-full bg-white text-mint-dark shadow-glow-mint motion-reduce:animate-none">
        <Check size={52} strokeWidth={3} aria-hidden />
      </span>
      <span role="status" className="flex flex-col gap-1">
        <span className="text-sm font-extrabold uppercase tracking-widest">
          {esIngreso ? 'Ingreso guardado' : 'Gasto guardado'}
        </span>
        <span className="tabular text-5xl font-black tracking-tighter">{monto}</span>
        <span className="text-base font-bold">en {categoria}</span>
      </span>
      {evento && (
        <span className="max-w-xs rounded-tile bg-white/40 px-4 py-3 text-sm font-bold leading-snug">
          Quedó pendiente en «{evento}». Pasa a tu balance cuando cerrés el evento.
        </span>
      )}
      <span className="mt-6 text-xs font-bold opacity-70">Tocá para continuar</span>
    </button>
  );
}
