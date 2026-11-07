/**
 * CalculatorKeypad.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Teclado numérico grande. Con `conOperaciones` agrega la
 *            fila + − × ÷ (solo en la pantalla Calculadora).
 *
 * POR QUÉ EXISTE: El paso "¿Cuánto?" muestra solo números: la mayoría
 *            solo escribe un monto y las operaciones cargaban la pantalla
 *            (pruebas del 24/10/2026). La calculadora vive en su propia
 *            pantalla (PasoCalculadora) y comparte este mismo teclado.
 *
 * NOTA:      Solo emite la tecla. Qué significa cada una lo decide
 *            lib/calculator.ts. El teclado físico de la PC emite las mismas
 *            teclas (useTecladoFisico) y la tecla dibujada se ilumina.
 * ---------------------------------------------------------------
 */
'use client';

import { useRef, useState } from 'react';
import { Delete } from 'lucide-react';
import { useTecladoFisico } from '@/hooks/useTecladoFisico';
import { OPERADORES, type Digito, type TeclaCalc } from '@/lib/calculator';
import { cn } from '@/lib/cn';

const DIGITOS: Array<Digito | '.' | 'del'> = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'del'];

const NOMBRE_ACCESIBLE: Record<string, string> = {
  '+': 'Más', '−': 'Menos', '×': 'Por', '÷': 'Entre', '.': 'Punto decimal', del: 'Borrar',
};

interface CalculatorKeypadProps {
  onTecla: (tecla: TeclaCalc) => void;
  conOperaciones?: boolean;
  // Enter del teclado físico (Guardar, Usar resultado, Crear).
  onEnter?: () => void;
  // Ayuda que solo se ve en PC.
  ayuda?: string;
}

const ILUMINADA_MS = 130;

// La tecla dibujada se ilumina un instante al usar el teclado físico.
function useTeclaIluminada(onTecla: (tecla: TeclaCalc) => void) {
  const [iluminada, setIluminada] = useState<TeclaCalc | null>(null);
  const reloj = useRef(0);
  const presionar = (tecla: TeclaCalc) => {
    onTecla(tecla);
    setIluminada(tecla);
    window.clearTimeout(reloj.current);
    reloj.current = window.setTimeout(() => setIluminada(null), ILUMINADA_MS);
  };
  return { iluminada, presionar };
}

export function CalculatorKeypad({ onTecla, conOperaciones = false, onEnter, ayuda }: CalculatorKeypadProps) {
  const { iluminada, presionar } = useTeclaIluminada(onTecla);
  useTecladoFisico({ conOperaciones, onTecla: presionar, onEnter });

  return (
    <div className="flex flex-col gap-2">
      {conOperaciones && (
        <div className="grid grid-cols-4 gap-2">
          {OPERADORES.map((op) => (
            <button key={op} type="button" onClick={() => onTecla(op)} aria-label={NOMBRE_ACCESIBLE[op]}
              className={cn('h-12 rounded-[14px] bg-primary text-2xl font-black text-white transition active:scale-95 hover:bg-primary-dark bajo:h-9',
                iluminada === op && 'scale-95 bg-primary-dark')}>
              {op}
            </button>
          ))}
        </div>
      )}
      <div className="grid grid-cols-3 gap-2">
        {DIGITOS.map((tecla) => {
          const esAccion = tecla === '.' || tecla === 'del';
          return (
            <button key={tecla} type="button" onClick={() => onTecla(tecla)}
              aria-label={NOMBRE_ACCESIBLE[tecla] ?? tecla}
              className={cn('grid h-[52px] place-items-center bajo:h-9 rounded-[16px] text-2xl font-extrabold transition active:scale-95',
                esAccion ? 'bg-primary-soft text-primary hover:bg-line' : 'bg-surface text-dark shadow-card hover:bg-primary-soft',
                iluminada === tecla && 'scale-95 ring-2 ring-primary')}>
              {tecla === 'del' ? <Delete size={24} strokeWidth={2} aria-hidden /> : tecla}
            </button>
          );
        })}
      </div>
      {ayuda && <p className="hidden text-center text-xs font-bold text-muted-soft mouse:block">{ayuda}</p>}
    </div>
  );
}
