/**
 * usePreferencia.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Un sí/no que se recuerda en ESTE teléfono (ej. "mostrar la
 *            calculadora").
 *
 * POR QUÉ EXISTE: Son comodidades de cada persona, no datos: no van a
 *            Supabase. Se guardan en localStorage, que puede fallar (modo
 *            privado, almacenamiento bloqueado): por eso todo va en
 *            try/catch y, si falla, simplemente no se recuerda.
 *
 * USADO EN:   components/finance/registro/CalculatorKeypad.tsx
 * ---------------------------------------------------------------
 */
'use client';

import { useState } from 'react';

const PREFIJO = 'evi_pref_';

function leer(clave: string, inicial: boolean): boolean {
  try {
    const guardado = window.localStorage.getItem(PREFIJO + clave);
    return guardado === null ? inicial : guardado === '1';
  } catch {
    return inicial;
  }
}

export function usePreferencia(clave: string, inicial: boolean) {
  const [valor, setValor] = useState(() => (typeof window === 'undefined' ? inicial : leer(clave, inicial)));

  const cambiar = (nuevo: boolean) => {
    setValor(nuevo);
    try {
      window.localStorage.setItem(PREFIJO + clave, nuevo ? '1' : '0');
    } catch {
      // Sin almacenamiento disponible: la preferencia dura solo esta sesión.
    }
  };

  return [valor, cambiar] as const;
}
