/**
 * useAccounts.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Tus cuentas con su saldo, el total, la cuenta por defecto
 *            del registro y las acciones: crear, ajustar saldo, quitar
 *            y transferir.
 *
 * POR QUÉ EXISTE: Frontera entre las pantallas y accountService (§2.1).
 *            Valida con Zod antes de escribir y registra account_created
 *            y transfer_created (§4.3).
 *
 * DEPENDE DE: services/accountService.ts, services/telemetryService.ts,
 *            lib/ultimaCuenta.ts
 * USADO EN:   app/(dashboard)/cuentas, inicio, dinero, eventos/[id], por-cobrar
 * ---------------------------------------------------------------
 */
'use client';

import { useCallback, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { leerUltimaCuenta } from '@/lib/ultimaCuenta';
import { ajustarSaldo, archivarCuenta, crearCuenta, listarCuentas, transferir } from '@/services/accountService';
import { track } from '@/services/telemetryService';
import { nuevaCuentaSchema, transferenciaSchema, type Cuenta, type NuevaCuenta, type Transferencia } from '@/types/account';
import { useAsyncData } from './useAsyncData';

const SIN_CUENTAS: Cuenta[] = [];

export function useAccounts() {
  const estado = useAsyncData(() => listarCuentas(supabase), SIN_CUENTAS);
  const acciones = useAccionesDeCuentas(estado.recargar);
  const cuentas = estado.data;
  const ultima = leerUltimaCuenta();

  return {
    ...estado,
    ...acciones,
    total: cuentas.reduce((suma, c) => suma + c.saldo, 0),
    // La última usada si sigue existiendo; si no, la primera (Efectivo).
    cuentaPorDefecto: cuentas.find((c) => c.id === ultima)?.id ?? cuentas[0]?.id ?? null,
  };
}

type Validacion<T> = { success: true; data: T } | { success: false; error: { issues: Array<{ message: string }> } };

// Espera, error y recarga de saldos, comunes a todas las acciones.
function useEjecutor(recargar: () => void) {
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Envuelve cada acción: espera, error y recarga de saldos al terminar.
  const ejecutar = useCallback(async (accion: () => Promise<void>) => {
    setGuardando(true);
    setError(null);
    try {
      await accion();
      recargar();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado.');
      return false;
    } finally {
      setGuardando(false);
    }
  }, [recargar]);

  // Devuelve los datos válidos, o null y deja el mensaje de Zod en error.
  const validar = useCallback(<T,>(resultado: Validacion<T>) => {
    if (resultado.success) return resultado.data;
    setError(resultado.error.issues[0]?.message ?? 'Revisá los datos');
    return null;
  }, []);

  return { guardando, error, setError, ejecutar, validar };
}

function useAccionesDeCuentas(recargar: () => void) {
  const { guardando, error, setError, ejecutar, validar } = useEjecutor(recargar);
  return {
    guardando,
    error,
    limpiarError: useCallback(() => setError(null), [setError]),
    crear: (datos: NuevaCuenta) => {
      const ok = validar(nuevaCuentaSchema.safeParse(datos));
      return ok ? ejecutar(async () => {
        await crearCuenta(supabase, ok);
        void track('account_created', { kind: ok.tipo, has_opening_balance: ok.saldoActual > 0 });
      }) : Promise.resolve(false);
    },
    transferir: (datos: Transferencia) => {
      const ok = validar(transferenciaSchema.safeParse(datos));
      return ok ? ejecutar(async () => {
        await transferir(supabase, ok);
        void track('transfer_created', { amount: ok.monto });
      }) : Promise.resolve(false);
    },
    ajustar: (cuenta: Cuenta, saldoReal: number) => ejecutar(() => ajustarSaldo(supabase, cuenta, saldoReal)),
    quitar: (id: string) => ejecutar(() => archivarCuenta(supabase, id)),
  };
}

export type EstadoCuentas = ReturnType<typeof useAccounts>;
