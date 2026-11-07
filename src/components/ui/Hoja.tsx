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

import { useId, type FormEvent, type ReactNode } from 'react';
import { MarcoHoja } from './MarcoHoja';

interface HojaProps {
  titulo: string;
  subtitulo?: string;
  onCerrar: () => void;
  // Enter: si viene, el contenido es un formulario y su botón es type="submit".
  onEnviar?: () => void;
  children: ReactNode;
}

export function Hoja({ titulo, subtitulo, onCerrar, onEnviar, children }: HojaProps) {
  const idTitulo = useId();
  const enviar = (e: FormEvent) => {
    e.preventDefault();
    onEnviar?.();
  };
  return (
    <MarcoHoja onCerrar={onCerrar} tituloId={idTitulo} clasePanel="max-h-[88dvh]">
      <h2 id={idTitulo} className="text-xl font-black tracking-tight">{titulo}</h2>
      {subtitulo && <p className="mt-0.5 text-[13px] font-semibold text-muted">{subtitulo}</p>}
      <form onSubmit={enviar} noValidate className="mt-4 flex flex-col gap-3">{children}</form>
    </MarcoHoja>
  );
}
