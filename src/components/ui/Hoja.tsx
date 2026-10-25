/**
 * Hoja.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Hoja que sube desde abajo (bottom sheet) con título,
 *            subtítulo y contenido libre.
 *
 * POR QUÉ EXISTE: Nueva cuenta, transferir, ajustar saldo, elegir
 *            cuenta, abonar a una meta… todas son la misma hoja con
 *            distinto contenido. Un solo lugar para el fondo oscuro, la
 *            animación y la accesibilidad del diálogo.
 * ---------------------------------------------------------------
 */
'use client';

import { useId, type ReactNode } from 'react';

interface HojaProps {
  titulo: string;
  subtitulo?: string;
  onCerrar: () => void;
  children: ReactNode;
}

export function Hoja({ titulo, subtitulo, onCerrar, children }: HojaProps) {
  const idTitulo = useId();
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <button type="button" aria-label="Cerrar" onClick={onCerrar} className="absolute inset-0 bg-black/60" />
      <div role="dialog" aria-modal="true" aria-labelledby={idTitulo}
        className="relative mx-auto max-h-[88dvh] w-full max-w-md animate-sheet-in overflow-y-auto rounded-t-sheet bg-light px-5 pb-6 pt-2 shadow-float motion-reduce:animate-none">
        <div aria-hidden className="mx-auto mb-3.5 h-[5px] w-11 rounded-full bg-line" />
        <h2 id={idTitulo} className="text-xl font-black tracking-tight">{titulo}</h2>
        {subtitulo && <p className="mt-0.5 text-[13px] font-semibold text-muted">{subtitulo}</p>}
        <div className="mt-4 flex flex-col gap-3">{children}</div>
      </div>
    </div>
  );
}
