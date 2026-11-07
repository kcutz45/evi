/**
 * useTecladoFisico.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Convierte el teclado físico en teclas de la calculadora:
 *            números, punto o coma, Retroceso, operaciones y Enter.
 *
 * POR QUÉ EXISTE: En PC nadie quiere escribir un monto con el mouse
 *            sobre un teclado dibujado. El teclado en pantalla se queda
 *            (tablets y celulares); esto es una segunda forma de escribir.
 *
 * REGLA:     Si el foco está en un campo de texto (la nota, por ejemplo),
 *            las teclas son de ese campo; solo Enter se atiende aquí.
 *
 * USADO EN:   components/finance/registro/CalculatorKeypad.tsx
 * ---------------------------------------------------------------
 */
'use client';

import { useEffect, useRef } from 'react';
import type { TeclaCalc } from '@/lib/calculator';

const OPERACIONES: Record<string, TeclaCalc> = { '+': '+', '-': '−', '*': '×', x: '×', X: '×', '/': '÷' };

function traducir(tecla: string, conOperaciones: boolean): TeclaCalc | null {
  if (/^[0-9]$/.test(tecla)) return tecla as TeclaCalc;
  if (tecla === '.' || tecla === ',') return '.';
  if (tecla === 'Backspace' || tecla === 'Delete') return 'del';
  return conOperaciones ? OPERACIONES[tecla] ?? null : null;
}

const esCampo = (el: HTMLElement) => el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable;

interface Opciones {
  conOperaciones: boolean;
  onTecla: (tecla: TeclaCalc) => void;
  onEnter?: () => void;
}

export function useTecladoFisico(opciones: Opciones) {
  // En un ref: el escuchador se registra una sola vez y siempre usa lo último.
  const actual = useRef(opciones);
  actual.current = opciones;

  useEffect(() => {
    const alTeclear = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const { conOperaciones, onTecla, onEnter } = actual.current;
      const destino = e.target as HTMLElement;
      if (e.key === 'Enter') {
        // En un botón o enlace, Enter ya activa ese elemento.
        if (destino.tagName === 'BUTTON' || destino.tagName === 'A') return;
        e.preventDefault();
        onEnter?.();
        return;
      }
      if (esCampo(destino)) return;
      const tecla = traducir(e.key, conOperaciones);
      if (!tecla || (e.repeat && tecla !== 'del')) return;
      // Evita la búsqueda rápida del navegador con "/" y volver atrás con Retroceso.
      e.preventDefault();
      onTecla(tecla);
    };
    window.addEventListener('keydown', alTeclear);
    return () => window.removeEventListener('keydown', alTeclear);
  }, []);
}
