/**
 * formatCurrency.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Formato único de montos: Q1,250.00.
 *
 * POR QUÉ EXISTE: La Definición de Terminado (§7) exige este formato
 *            en toda la app. Si cada componente formateara a su
 *            manera, tendríamos "Q 1250", "Q1.250,00" y "GTQ 1,250".
 * ---------------------------------------------------------------
 */
import { AMOUNT_DECIMALS } from './constants';

// en-US da coma de miles y punto decimal, que es como se escriben los
// quetzales en Guatemala.
const formatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: AMOUNT_DECIMALS,
  maximumFractionDigits: AMOUNT_DECIMALS,
});

const shortFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

export function formatCurrency(amount: number): string {
  const sign = amount < 0 ? '−' : '';
  return `${sign}Q${formatter.format(Math.abs(amount))}`;
}

// Monto con signo explícito para listas de movimientos: +Q350.00 / −Q45.00.
export function formatSignedCurrency(amount: number, isIncome: boolean): string {
  return `${isIncome ? '+' : '−'}Q${formatter.format(Math.abs(amount))}`;
}

// Versión sin decimales para frases: "Te sobraron Q300".
export function formatCurrencyShort(amount: number): string {
  return `Q${shortFormatter.format(Math.round(Math.abs(amount)))}`;
}
