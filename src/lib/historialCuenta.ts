/**
 * historialCuenta.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Arma el historial de UNA cuenta: todo lo que entró y salió
 *            (gastos, ingresos, cobros, transferencias, abonos a metas),
 *            ordenado del más nuevo al más viejo, con el saldo que quedó
 *            después de cada uno.
 *
 * POR QUÉ EXISTE: Los datos vienen de 4 tablas distintas; juntarlos,
 *            ordenarlos y calcular el saldo es lógica pura (se prueba sin
 *            base). Sigue las MISMAS reglas que vw_account_balances (§12):
 *            al dividir una cuenta, sale el total pagado; un cobro entra;
 *            abonar a una meta sale, retirar entra.
 * ---------------------------------------------------------------
 */
import { etiquetaDeDia } from './dates';

export type TipoMovimientoCuenta = 'ingreso' | 'gasto' | 'cobro' | 'transferencia' | 'meta';

export interface MovimientoDeCuenta {
  id: string;
  tipo: TipoMovimientoCuenta;
  fecha: string;
  // Para desempatar dos movimientos del mismo día (el último arriba).
  creado: string;
  titulo: string;
  detalle: string;
  icono: string;
  // Efecto en ESTA cuenta: positivo entra, negativo sale.
  monto: number;
}

export interface MovimientoConSaldo extends MovimientoDeCuenta {
  saldoDespues: number;
}

export interface GrupoDeHistorial {
  fecha: string;
  etiqueta: string;
  movimientos: MovimientoConSaldo[];
}

const recientePrimero = (a: MovimientoDeCuenta, b: MovimientoDeCuenta) =>
  b.fecha.localeCompare(a.fecha) || b.creado.localeCompare(a.creado);

// Del saldo de hoy hacia atrás: el saldo después de cada movimiento es
// el de hoy menos todo lo que pasó DESPUÉS de él.
export function conSaldo(movimientos: MovimientoDeCuenta[], saldoActual: number): MovimientoConSaldo[] {
  let saldo = saldoActual;
  return [...movimientos].sort(recientePrimero).map((m) => {
    const fila = { ...m, saldoDespues: Math.round(saldo * 100) / 100 };
    saldo -= m.monto;
    return fila;
  });
}

export function agruparHistorial(movimientos: MovimientoConSaldo[], ahora: Date = new Date()): GrupoDeHistorial[] {
  const grupos: GrupoDeHistorial[] = [];
  for (const m of movimientos) {
    const ultimo = grupos[grupos.length - 1];
    if (ultimo?.fecha === m.fecha) ultimo.movimientos.push(m);
    else grupos.push({ fecha: m.fecha, etiqueta: etiquetaDeDia(m.fecha, ahora), movimientos: [m] });
  }
  return grupos;
}

export function totalesDelHistorial(movimientos: MovimientoDeCuenta[]) {
  return {
    entro: movimientos.filter((m) => m.monto > 0).reduce((s, m) => s + m.monto, 0),
    salio: movimientos.filter((m) => m.monto < 0).reduce((s, m) => s - m.monto, 0),
  };
}
