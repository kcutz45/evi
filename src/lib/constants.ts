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

// Horas (0–23) en que el saludo cambia: "Buen día" → "Buenas tardes" → "Buenas noches".
export const HORA_INICIO_TARDE = 12;
export const HORA_INICIO_NOCHE = 19;

// Movimientos que muestra "Últimos movimientos" en el Dashboard (§3).
export const LIMITE_MOVIMIENTOS_RECIENTES = 5;

// "Tus frecuentes" del registro: se miran los últimos N movimientos y
// aparecen hasta FRECUENTES_MAX categorías usadas al menos FRECUENTES_MIN_USOS veces.
export const MOVIMIENTOS_PARA_FRECUENCIA = 100;
export const FRECUENTES_MAX = 3;
export const FRECUENTES_MIN_USOS = 2;

// Milisegundos que se muestra la pantalla "¡Listo!" antes de volver al inicio.
export const REGISTRO_EXITO_MS = 2200;
