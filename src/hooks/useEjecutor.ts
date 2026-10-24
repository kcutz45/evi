/**
 * useEjecutor.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Envoltura común de las acciones que escriben en la base:
 *            "guardando…", el mensaje de error, validar con Zod y
 *            recargar los datos al terminar.
 *
 * POR QUÉ EXISTE: Cuentas y metas repetían el mismo try/catch/finally
 *            en cada acción. Un solo lugar evita que se desalineen.
 *
 * USADO EN:   hooks/useAccounts.ts, hooks/useGoals.ts
 * ---------------------------------------------------------------
 */
'use client';

import { useCallback, useState } from 'react';

type Validacion<T> = { success: true; data: T } | { success: false; error: { issues: Array<{ message: string }> } };

export function useEjecutor(recargar: () => void) {
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Devuelve true si salió bien; si falla, deja el mensaje en error.
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

  const limpiarError = useCallback(() => setError(null), []);

  return { guardando, error, ejecutar, validar, limpiarError };
}
