/**
 * useAmountInput.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Estado del monto que se escribe con el teclado numérico.
 *
 * POR QUÉ EXISTE: MovementForm no debe saber cómo se valida un punto
 *            decimal; solo recibe el texto formateado y una función
 *            para cada tecla.
 *
 * DEPENDE DE: lib/amountInput.ts
 * USADO EN:   components/finance/MovementForm.tsx
 * ---------------------------------------------------------------
 */
'use client';

import { useCallback, useState } from 'react';
import { applyKey, formatRawAmount, rawToNumber, type KeypadKey } from '@/lib/amountInput';

export function useAmountInput() {
  const [raw, setRaw] = useState('');

  const pressKey = useCallback((key: KeypadKey) => {
    setRaw((current) => applyKey(current, key));
  }, []);

  const reset = useCallback(() => setRaw(''), []);

  return {
    display: formatRawAmount(raw),
    value: rawToNumber(raw),
    isEmpty: raw === '' || rawToNumber(raw) === 0,
    pressKey,
    reset,
  };
}
