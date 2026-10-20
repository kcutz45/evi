/**
 * constants.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Números y textos de negocio con nombre propio.
 *
 * POR QUÉ EXISTE: Regla anti-spaghetti #5 (cero números mágicos). Si
 *            el negocio decide alertar al 75%, se cambia aquí y en
 *            ningún otro lugar.
 * ---------------------------------------------------------------
 */

// Fracción del presupuesto a partir de la cual se avisa al usuario.
export const BUDGET_ALERT_THRESHOLD = 0.8;

// Fracción a partir de la cual el presupuesto está superado.
export const BUDGET_EXCEEDED_THRESHOLD = 1;

// Dígitos máximos del monto (sin el punto): Q9,999,999.99.
export const MAX_AMOUNT_DIGITS = 9;

// Decimales que acepta un monto en quetzales.
export const AMOUNT_DECIMALS = 2;

// Zona horaria de referencia para "hoy" y "este mes".
export const APP_TIME_ZONE = 'America/Guatemala';
