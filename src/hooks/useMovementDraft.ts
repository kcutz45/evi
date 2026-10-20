/**
 * useMovementDraft.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Estado completo del formulario de nuevo movimiento y su
 *            validación con Zod antes de enviarlo.
 *
 * POR QUÉ EXISTE: MovementForm solo pinta; aquí vive qué campos hay,
 *            cómo se reinicia la categoría al cambiar de tipo y cuánto
 *            tardó el usuario (seconds_to_complete, la métrica más
 *            importante del producto, §4.3).
 *
 * DEPENDE DE: hooks/useAmountInput.ts, types/movement.ts
 * USADO EN:   components/finance/MovementForm.tsx
 * ---------------------------------------------------------------
 */
'use client';

import { useRef, useState } from 'react';
import { useAmountInput } from './useAmountInput';
import { movementDraftSchema, type MovementDraft, type MovementType } from '@/types/movement';

const MS_PER_SECOND = 1000;

export type DraftResult =
  | { ok: true; draft: MovementDraft; secondsToComplete: number }
  | { ok: false; error: string };

export function useMovementDraft() {
  const amount = useAmountInput();
  const [type, setTypeState] = useState<MovementType>('egreso');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [eventId, setEventId] = useState<string | null>(null);
  const [note, setNote] = useState('');
  // useRef y no useState: el momento de inicio no debe provocar renders.
  const startedAt = useRef(Date.now());

  // Las categorías de gasto no sirven para un ingreso, así que la
  // selección se limpia al cambiar de tipo. El evento también: solo los
  // gastos se asignan a eventos (el presupuesto mide egresos).
  const setType = (next: MovementType) => {
    setTypeState(next);
    setCategoryId(null);
    if (next === 'ingreso') setEventId(null);
  };

  const buildDraft = (): DraftResult => {
    const parsed = movementDraftSchema.safeParse({
      type,
      amount: amount.value,
      categoryId,
      eventId,
      note: note.trim() || null,
    });
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? 'Revisá los datos' };
    }
    const seconds = Math.round((Date.now() - startedAt.current) / MS_PER_SECOND);
    return { ok: true, draft: parsed.data, secondsToComplete: seconds };
  };

  return { amount, type, setType, categoryId, setCategoryId, eventId, setEventId, note, setNote, buildDraft };
}
