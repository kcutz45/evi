/**
 * useRegistroWizard.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Estado del registro paso a paso:
 *            1 ¿Gasto o ingreso? → 2 ¿En qué? → 3 ¿Cuánto? → ¡Listo!
 *
 * POR QUÉ EXISTE: Una pregunta por pantalla es más fácil de entender
 *            que un formulario con todo junto (pruebas con usuarios,
 *            24/10/2026). Este hook decide en qué paso se está, qué se
 *            eligió y valida el borrador con Zod antes de guardar. Los
 *            componentes de cada paso solo pintan.
 *
 * MÉTRICA:   segundos = desde que se abrió el registro hasta Guardar
 *            (seconds_to_complete, §4.3).
 *
 * DEPENDE DE: hooks/useCalculator.ts, types/movement.ts
 * USADO EN:   components/finance/registro/RegistroWizard.tsx
 * ---------------------------------------------------------------
 */
'use client';

import { useRef, useState } from 'react';
import { movementDraftSchema, type MovementDraft, type MovementType } from '@/types/movement';
import { useCalculator } from './useCalculator';

export type PasoRegistro = 'tipo' | 'categoria' | 'monto' | 'listo';

// Los pasos que cuentan en "Paso 2 de 3" (el "¡Listo!" no se numera).
export const PASOS_NUMERADOS: PasoRegistro[] = ['tipo', 'categoria', 'monto'];

const MS_POR_SEGUNDO = 1000;

export type BorradorResultado =
  | { ok: true; draft: MovementDraft; segundos: number }
  | { ok: false; error: string };

interface DatosDelBorrador {
  tipo: MovementType;
  monto: number | null;
  categoriaId: string | null;
  eventoId: string | null;
  nota: string;
  inicio: number;
}

// Valida con el mismo esquema Zod que usa todo el producto (§1.3).
function validarBorrador(d: DatosDelBorrador): BorradorResultado {
  const parsed = movementDraftSchema.safeParse({
    type: d.tipo,
    amount: d.monto ?? 0,
    categoryId: d.categoriaId,
    eventId: d.eventoId,
    note: d.nota.trim() || null,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Revisá los datos' };
  }
  const segundos = Math.round((Date.now() - d.inicio) / MS_POR_SEGUNDO);
  return { ok: true, draft: parsed.data, segundos };
}

export function useRegistroWizard() {
  const calc = useCalculator();
  const [paso, setPaso] = useState<PasoRegistro>('tipo');
  const [tipo, setTipo] = useState<MovementType>('egreso');
  const [categoriaId, setCategoriaId] = useState<string | null>(null);
  const [nota, setNota] = useState('');
  const [eventoId, setEventoId] = useState<string | null>(null);
  // useRef: el momento de inicio no debe provocar renders.
  const inicio = useRef(Date.now());

  // Cambiar de tipo invalida la categoría (las de gasto no sirven para
  // un ingreso) y el evento (solo los gastos se asignan a eventos, §4d).
  const elegirTipo = (nuevo: MovementType) => {
    setTipo(nuevo);
    setCategoriaId(null);
    if (nuevo === 'ingreso') setEventoId(null);
    setPaso('categoria');
  };

  const elegirCategoria = (id: string) => {
    setCategoriaId(id);
    setPaso('monto');
  };

  // El monto escrito se conserva al volver: nadie quiere teclearlo dos veces.
  const volver = () => setPaso((actual) => (actual === 'monto' ? 'categoria' : 'tipo'));

  const construirBorrador = () =>
    validarBorrador({ tipo, monto: calc.valor, categoriaId, eventoId, nota, inicio: inicio.current });

  return {
    paso,
    numeroDePaso: PASOS_NUMERADOS.indexOf(paso),
    tipo,
    categoriaId,
    nota,
    setNota,
    eventoId,
    setEventoId,
    calc,
    elegirTipo,
    elegirCategoria,
    volver,
    terminar: () => setPaso('listo'),
    construirBorrador,
  };
}
