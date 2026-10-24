/**
 * useMovementActions.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Editar y eliminar un movimiento, con su estado de espera
 *            y error.
 *
 * POR QUÉ EXISTE: Frontera entre la pantalla Dinero y movementService
 *            (§2.1). Registra movement_deleted (§4.3) para saber cuánto
 *            se corrige lo registrado.
 *
 * NOTA:      No recarga listas: la página decide qué refrescar.
 *
 * DEPENDE DE: services/movementService.ts, services/telemetryService.ts
 * USADO EN:   app/(dashboard)/dinero/page.tsx
 * ---------------------------------------------------------------
 */
'use client';

import { useCallback, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { actualizarMovimiento, eliminarMovimiento } from '@/services/movementService';
import { track } from '@/services/telemetryService';
import type { MovementDetalle, MovementDraft } from '@/types/movement';

export function useMovementActions() {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Envuelve una acción: marca "guardando", captura el error y devuelve
  // true si salió bien. Así editar y eliminar no repiten este bloque.
  const ejecutar = useCallback(async (accion: () => Promise<void>) => {
    setIsSaving(true);
    setError(null);
    try {
      await accion();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado.');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const editar = useCallback(
    (id: string, draft: MovementDraft) => ejecutar(() => actualizarMovimiento(supabase, id, draft)),
    [ejecutar],
  );

  const eliminar = useCallback(
    (mov: MovementDetalle) =>
      ejecutar(async () => {
        await eliminarMovimiento(supabase, mov.id);
        void track('movement_deleted', { type: mov.type, category: mov.categoryName });
      }),
    [ejecutar],
  );

  const limpiarError = useCallback(() => setError(null), []);

  return { editar, eliminar, isSaving, error, limpiarError };
}
