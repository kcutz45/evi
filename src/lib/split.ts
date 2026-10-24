/**
 * split.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Cuentas de "Dividir cuenta": repartir en partes iguales,
 *            calcular tu parte y validar antes de guardar.
 *
 * POR QUÉ EXISTE: Es dinero: los centavos tienen que cuadrar. Q100 entre
 *            3 da Q33.33 a cada amigo y Q33.34 a vos (el centavo que
 *            sobra queda en tu parte, que es la que pagaste). Funciones
 *            puras: se prueban sin React ni Supabase.
 *
 * DEPENDE DE: lib/constants.ts
 * USADO EN:   hooks/useDivision.ts, components/finance/registro/PasoDividir.tsx
 * ---------------------------------------------------------------
 */
import type { Deudor } from '@/types/receivable';
import { AMOUNT_DECIMALS } from './constants';

const FACTOR = 10 ** AMOUNT_DECIMALS;
export const MAX_PERSONAS_DIVISION = 20;
const NOMBRE_MAX = 60;

const redondear = (n: number) => Math.round(n * FACTOR) / FACTOR;

// Parte de cada OTRA persona si se divide entre `personas` (contándote).
// Se redondea hacia abajo: el centavo sobrante queda en tu parte.
export function parteIgual(total: number, personas: number): number {
  if (personas < 1 || total <= 0) return 0;
  return Math.floor((total * FACTOR) / personas) / FACTOR;
}

export function calcularMiParte(total: number, deudores: Deudor[]): number {
  return redondear(total - deudores.reduce((suma, d) => suma + d.monto, 0));
}

// "1,250.50" o "1250.5" → 1250.5. Texto vacío o inválido → null.
export function leerMonto(texto: string): number | null {
  const limpio = texto.replace(/,/g, '').trim();
  if (!/^\d+(\.\d{0,2})?$/.test(limpio)) return null;
  const valor = Number.parseFloat(limpio);
  return Number.isFinite(valor) ? valor : null;
}

// null = todo bien. Si no, el mensaje que se muestra al usuario.
export function validarDivision(total: number, deudores: Deudor[]): string | null {
  if (deudores.length === 0) return 'Agregá al menos una persona.';
  if (deudores.length > MAX_PERSONAS_DIVISION) return `Máximo ${MAX_PERSONAS_DIVISION} personas.`;
  if (deudores.some((d) => d.nombre.trim() === '')) return 'Escribí el nombre de cada persona.';
  if (deudores.some((d) => d.nombre.trim().length > NOMBRE_MAX)) return `Cada nombre, máximo ${NOMBRE_MAX} letras.`;
  if (deudores.some((d) => !(d.monto > 0))) return 'Cada persona debe tener un monto mayor que Q0.';
  if (calcularMiParte(total, deudores) <= 0) {
    return 'Tu parte debe ser mayor que Q0. Revisá los montos de cada persona.';
  }
  return null;
}
