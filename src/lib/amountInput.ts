/**
 * amountInput.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Reglas del teclado numérico del registro de movimiento.
 *
 * POR QUÉ EXISTE: El monto se guarda como texto ("125.5") mientras se
 *            escribe, para no perder el punto ni los ceros al final.
 *            Estas reglas son puras: el hook useAmountInput solo las
 *            orquesta y el componente solo las pinta.
 *
 * DEPENDE DE: lib/constants.ts
 * USADO EN:   hooks/useAmountInput.ts
 * ---------------------------------------------------------------
 */
import { AMOUNT_DECIMALS, MAX_AMOUNT_DIGITS } from './constants';

export type KeypadKey = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '.' | 'del';

function appendDigit(raw: string, digit: string): string {
  const decimals = raw.split('.')[1];
  if (decimals !== undefined && decimals.length >= AMOUNT_DECIMALS) return raw;
  if (raw === '' && digit === '0') return raw;
  if (raw.replace('.', '').length >= MAX_AMOUNT_DIGITS) return raw;
  return raw + digit;
}

export function applyKey(raw: string, key: KeypadKey): string {
  if (key === 'del') return raw.slice(0, -1);
  if (key === '.') return raw.includes('.') ? raw : `${raw || '0'}.`;
  return appendDigit(raw, key);
}

export function rawToNumber(raw: string): number {
  const value = Number.parseFloat(raw);
  return Number.isFinite(value) ? value : 0;
}

// Muestra siempre dos decimales mientras se escribe: "125." → Q125.00.
export function formatRawAmount(raw: string): string {
  const [whole = '', decimals] = raw.split('.');
  const wholeText = Number(whole || 0).toLocaleString('en-US');
  const decimalText = ((decimals ?? '') + '00').slice(0, AMOUNT_DECIMALS);
  return `Q${wholeText}.${decimalText}`;
}
