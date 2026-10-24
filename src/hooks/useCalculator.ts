/**
 * useCalculator.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Estado de la calculadora del paso "¿Cuánto?".
 *
 * POR QUÉ EXISTE: PasoMonto solo pinta el texto y emite teclas; las
 *            reglas (precedencia, decimales, división entre cero) viven
 *            en lib/calculator.ts.
 *
 * DEPENDE DE: lib/calculator.ts, lib/formatCurrency.ts
 * USADO EN:   hooks/useRegistroWizard.ts
 * ---------------------------------------------------------------
 */
'use client';

import { useCallback, useState } from 'react';
import {
  aplicarTecla, evaluar, formatearExpresion, tieneOperacion, type Expresion, type TeclaCalc,
} from '@/lib/calculator';
import { formatCurrency } from '@/lib/formatCurrency';

export function useCalculator() {
  const [expresion, setExpresion] = useState<Expresion>([]);
  const valor = evaluar(expresion);

  const presionar = useCallback((tecla: TeclaCalc) => {
    setExpresion((actual) => aplicarTecla(actual, tecla));
  }, []);

  return {
    // Grande: el resultado ya calculado ("Q286.00").
    total: formatCurrency(valor ?? 0),
    // Pequeño, solo si hay una cuenta: "Q143 × 2".
    operacion: tieneOperacion(expresion) ? formatearExpresion(expresion) : null,
    valor,
    // Monto válido para guardar: mayor que cero.
    esValido: valor !== null && valor > 0,
    estaVacio: expresion.length === 0,
    presionar,
  };
}
