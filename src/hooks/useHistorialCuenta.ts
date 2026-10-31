/**
 * useHistorialCuenta.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Historial de una cuenta, agrupado por día, con el saldo
 *            después de cada movimiento y lo que entró y salió en total.
 *
 * POR QUÉ EXISTE: Frontera entre la pantalla /cuentas/[id] y
 *            historialService (§2.1). Recarga solo cuando cambia la cuenta
 *            o su saldo (por ejemplo, después de corregirlo).
 *
 * DEPENDE DE: services/historialService.ts, lib/historialCuenta.ts
 * USADO EN:   app/(dashboard)/cuentas/[id]/page.tsx
 * ---------------------------------------------------------------
 */
'use client';

import { agruparHistorial, conSaldo, totalesDelHistorial, type MovimientoDeCuenta } from '@/lib/historialCuenta';
import { supabase } from '@/lib/supabase';
import { listarHistorialDeCuenta } from '@/services/historialService';
import type { Cuenta } from '@/types/account';
import { useAsyncData } from './useAsyncData';

const SIN_HISTORIAL: MovimientoDeCuenta[] = [];

export function useHistorialCuenta(cuenta: Cuenta | null, cuentas: Cuenta[]) {
  const nombres = new Map(cuentas.map((c) => [c.id, c.nombre]));
  const clave = cuenta ? `${cuenta.id}:${cuenta.saldo}` : '';
  const estado = useAsyncData(
    () => (cuenta ? listarHistorialDeCuenta(supabase, cuenta.id, nombres) : Promise.resolve(SIN_HISTORIAL)),
    SIN_HISTORIAL,
    clave,
  );
  const filas = conSaldo(estado.data, cuenta?.saldo ?? 0);
  return { ...estado, grupos: agruparHistorial(filas), totales: totalesDelHistorial(estado.data) };
}
