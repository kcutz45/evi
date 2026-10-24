/**
 * useMovements.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Últimos movimientos del usuario y la acción para
 *            registrar uno nuevo.
 *
 * POR QUÉ EXISTE: Frontera entre la interfaz y movementService (§2.1).
 *            Además registra movement_created con seconds_to_complete,
 *            la métrica más importante del producto (§4.3): mide la
 *            promesa de "3 toques".
 *
 * NOTA:      crear() no recarga el balance: la página decide qué
 *            refrescar después de guardar.
 *
 * DEPENDE DE: services/movementService.ts, services/telemetryService.ts
 * USADO EN:   app/(dashboard)/inicio/page.tsx
 * ---------------------------------------------------------------
 */
'use client';

import { useCallback, useState } from 'react';
import { LIMITE_MOVIMIENTOS_RECIENTES } from '@/lib/constants';
import { supabase } from '@/lib/supabase';
import { crearMovimiento, listarRecientes } from '@/services/movementService';
import { track } from '@/services/telemetryService';
import type { MovementDraft, MovementView } from '@/types/movement';
import { useAsyncData } from './useAsyncData';

const SIN_MOVIMIENTOS: MovementView[] = [];

export function useMovements(limite: number = LIMITE_MOVIMIENTOS_RECIENTES) {
  const estado = useAsyncData(() => listarRecientes(supabase, limite), SIN_MOVIMIENTOS);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // nombreCategoria viaja aparte porque el borrador solo trae el id, y en
  // Looker se lee mejor "Comida" que un UUID.
  const crear = useCallback(
    async (draft: MovementDraft, segundos: number, nombreCategoria: string | null) => {
      setIsSaving(true);
      setSaveError(null);
      try {
        await crearMovimiento(supabase, draft);
        void track('movement_created', {
          type: draft.type,
          category: nombreCategoria,
          amount: draft.amount,
          has_note: draft.note !== null,
          linked_to_event: draft.eventId !== null,
          seconds_to_complete: segundos,
        });
        return true;
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : 'No pudimos guardar el movimiento.');
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [],
  );

  // Al cerrar el formulario, el error viejo no debe reaparecer la próxima vez.
  const limpiarError = useCallback(() => setSaveError(null), []);

  return { ...estado, crear, isSaving, saveError, limpiarError };
}
