/**
 * useAccionesDinero.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Lo que pasa al tocar en la pantalla Dinero: ver el detalle,
 *            crear, editar y eliminar un movimiento, y qué recargar
 *            después.
 *
 * POR QUÉ EXISTE: Junta useMovements (crear) y useMovementActions
 *            (editar/eliminar) en un solo lugar, para que la página solo
 *            pinte. Vive junto a la página porque solo ella lo usa.
 *
 * DEPENDE DE: hooks/useMovements.ts, hooks/useMovementActions.ts
 * USADO EN:   app/(dashboard)/dinero/page.tsx
 * ---------------------------------------------------------------
 */
'use client';

import { useCallback, useState } from 'react';
import { useMovementActions } from '@/hooks/useMovementActions';
import { useMovements } from '@/hooks/useMovements';
import type { ValoresIniciales } from '@/hooks/useRegistroWizard';
import type { Category } from '@/types/category';
import type { MovementDetalle, MovementDraft } from '@/types/movement';
import type { Deudor } from '@/types/receivable';

// inicial undefined = crear; con valores = editar ese movimiento.
interface EstadoWizard {
  inicial?: ValoresIniciales;
}

function valoresDe(m: MovementDetalle): ValoresIniciales {
  return { tipo: m.type, monto: m.amount, categoriaId: m.categoryId, nota: m.note, eventoId: m.eventId };
}

export function useAccionesDinero(categorias: Category[], recargar: Array<() => void>) {
  const creacion = useMovements();
  const acciones = useMovementActions();
  const [seleccionado, setSeleccionado] = useState<MovementDetalle | null>(null);
  const [wizard, setWizard] = useState<EstadoWizard | null>(null);
  const { limpiarError } = acciones;
  const { limpiarError: limpiarErrorCreacion } = creacion;

  // useCallback: "¡Listo!" programa su cierre con esta función.
  const cerrarWizard = useCallback(() => {
    setWizard(null);
    setSeleccionado(null);
    limpiarError();
    limpiarErrorCreacion();
  }, [limpiarError, limpiarErrorCreacion]);

  const guardar = async (draft: MovementDraft, segundos: number, deudores: Deudor[]) => {
    const ok = seleccionado && wizard?.inicial
      ? await acciones.editar(seleccionado.id, draft)
      : await creacion.crear(draft, segundos, categorias.find((c) => c.id === draft.categoryId)?.name ?? null, deudores);
    if (ok) recargar.forEach((fn) => fn());
    return ok;
  };

  const eliminar = async () => {
    if (seleccionado && (await acciones.eliminar(seleccionado))) {
      setSeleccionado(null);
      recargar.forEach((fn) => fn());
    }
  };

  return {
    seleccionado,
    setSeleccionado,
    wizard,
    abrirCrear: () => setWizard({}),
    abrirEditar: () => seleccionado && setWizard({ inicial: valoresDe(seleccionado) }),
    cerrarWizard,
    cerrarDetalle: () => { setSeleccionado(null); limpiarError(); },
    guardar,
    eliminar,
    ocupado: acciones.isSaving || creacion.isSaving,
    error: acciones.error ?? creacion.saveError,
  };
}
