/**
 * porCobrar.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Agrupa las deudas por persona para la pantalla "Te deben":
 *            "Ana te debe Q150.00" con el detalle de cada cuenta.
 *
 * POR QUÉ EXISTE: Al cobrar se piensa en personas ("¿cuánto me debe
 *            Ana?"), no en cuentas sueltas. "ana" y "Ana " son la misma
 *            persona: se agrupa sin mayúsculas ni espacios.
 *
 * NOTA:      La suma por persona es solo para mostrar. El total oficial
 *            (tarjeta del Inicio) lo calcula la vista vw_receivables_summary.
 *
 * USADO EN:   app/(dashboard)/por-cobrar/page.tsx
 * ---------------------------------------------------------------
 */
import type { PorCobrar } from '@/types/receivable';

export interface DeudaDePersona {
  clave: string;
  nombre: string;
  pendiente: number;
  deudas: PorCobrar[];
}

const claveDe = (nombre: string) => nombre.trim().toLowerCase();

// "ana " y "Ana" se muestran igual: con mayúscula inicial.
const nombreVisible = (nombre: string) => {
  const limpio = nombre.trim();
  return limpio.charAt(0).toUpperCase() + limpio.slice(1);
};

// Solo personas con algo pendiente, de la que más debe a la que menos.
export function agruparPendientesPorPersona(lista: PorCobrar[]): DeudaDePersona[] {
  const grupos = new Map<string, DeudaDePersona>();
  lista.filter((d) => !d.cobrado).forEach((d) => {
    const clave = claveDe(d.nombre);
    const grupo = grupos.get(clave) ?? { clave, nombre: nombreVisible(d.nombre), pendiente: 0, deudas: [] };
    grupo.pendiente = Math.round((grupo.pendiente + d.monto) * 100) / 100;
    grupo.deudas.push(d);
    grupos.set(clave, grupo);
  });
  return [...grupos.values()].sort((a, b) => b.pendiente - a.pendiente);
}

export function cobradas(lista: PorCobrar[]): PorCobrar[] {
  return lista.filter((d) => d.cobrado);
}
