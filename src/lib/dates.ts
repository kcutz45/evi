/**
 * dates.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Fechas de la app en hora de Guatemala: "hoy", el mes
 *            actual y las etiquetas de la lista ("Hoy", "Ayer", "26 sep").
 *
 * POR QUÉ EXISTE: Todo el producto gira alrededor de "el mes actual"
 *            (§1.3). Con la hora UTC del navegador, un gasto de las
 *            7 p.m. del día 30 caería en el mes siguiente. La base usa
 *            la misma zona (gt_today() en schema.sql).
 *
 * DEPENDE DE: date-fns, lib/constants.ts
 * USADO EN:   services/movementService.ts, app/(dashboard)/inicio
 * ---------------------------------------------------------------
 */
import { format, parseISO, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { APP_TIME_ZONE, HORA_INICIO_NOCHE, HORA_INICIO_TARDE } from './constants';

// 'en-CA' formatea como AAAA-MM-DD, el mismo formato que una columna date.
const isoEnGuatemala = new Intl.DateTimeFormat('en-CA', {
  timeZone: APP_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

// '2026-10-23'
export function hoyGT(ahora: Date = new Date()): string {
  return isoEnGuatemala.format(ahora);
}

// Primer día del mes actual, como lo guarda vw_monthly_summary: '2026-10-01'.
export function inicioDeMesGT(ahora: Date = new Date()): string {
  return `${hoyGT(ahora).slice(0, 7)}-01`;
}

// 'octubre'
export function nombreDelMes(inicioDeMes: string): string {
  return format(parseISO(inicioDeMes), 'MMMM', { locale: es });
}

// '2026-10-23' → 'Hoy' · '2026-10-22' → 'Ayer' · '2026-09-26' → '26 sep'
export function etiquetaDeDia(fechaIso: string, ahora: Date = new Date()): string {
  const hoy = hoyGT(ahora);
  if (fechaIso === hoy) return 'Hoy';
  if (fechaIso === format(subDays(parseISO(hoy), 1), 'yyyy-MM-dd')) return 'Ayer';
  return format(parseISO(fechaIso), 'd MMM', { locale: es });
}

// Saludo según la hora en Guatemala.
export function saludoGT(ahora: Date = new Date()): string {
  const hora = Number(
    new Intl.DateTimeFormat('en-US', { timeZone: APP_TIME_ZONE, hour: 'numeric', hourCycle: 'h23' })
      .format(ahora),
  );
  if (hora < HORA_INICIO_TARDE) return 'Buen día,';
  return hora < HORA_INICIO_NOCHE ? 'Buenas tardes,' : 'Buenas noches,';
}
