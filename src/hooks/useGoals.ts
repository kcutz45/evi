/**
 * useGoals.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Tus metas de ahorro, el total ahorrado y las acciones:
 *            crear, abonar/retirar desde una cuenta y quitar.
 *
 * POR QUÉ EXISTE: Frontera entre la pantalla Metas y goalService (§2.1).
 *            Valida con Zod y registra savings_goal_created y
 *            savings_contribution_added (§4.3).
 *
 * DEPENDE DE: services/goalService.ts, services/telemetryService.ts,
 *            hooks/useEjecutor.ts
 * USADO EN:   app/(dashboard)/metas/page.tsx, app/(dashboard)/inicio
 * ---------------------------------------------------------------
 */
'use client';

import { supabase } from '@/lib/supabase';
import { abonar, archivarMeta, crearMeta, listarMetas } from '@/services/goalService';
import { track } from '@/services/telemetryService';
import { abonoSchema, nuevaMetaSchema, type Abono, type Meta, type NuevaMeta } from '@/types/goal';
import { useAsyncData } from './useAsyncData';
import { useEjecutor } from './useEjecutor';

const SIN_METAS: Meta[] = [];

export function useGoals() {
  const estado = useAsyncData(() => listarMetas(supabase), SIN_METAS);
  const acciones = useAccionesDeMetas(estado.recargar, estado.data);
  return { ...estado, ...acciones, totalAhorrado: estado.data.reduce((suma, m) => suma + m.ahorrado, 0) };
}

function useAccionesDeMetas(recargar: () => void, metas: Meta[]) {
  const { guardando, error, ejecutar, validar, limpiarError } = useEjecutor(recargar);

  const crear = (datos: NuevaMeta) => {
    const ok = validar(nuevaMetaSchema.safeParse(datos));
    return ok ? ejecutar(async () => {
      await crearMeta(supabase, ok);
      void track('savings_goal_created', { target_amount: ok.objetivo });
    }) : Promise.resolve(false);
  };

  const abonarAMeta = (datos: Abono) => {
    const ok = validar(abonoSchema.safeParse(datos));
    const meta = metas.find((m) => m.id === datos.metaId);
    return ok ? ejecutar(async () => {
      await abonar(supabase, ok);
      const progreso = meta ? Math.round(((meta.ahorrado + ok.monto) / meta.objetivo) * 100) : null;
      void track('savings_contribution_added', { amount: ok.monto, goal_progress: progreso });
    }) : Promise.resolve(false);
  };

  return {
    guardando, error, limpiarError, crear, abonar: abonarAMeta,
    quitar: (id: string) => ejecutar(() => archivarMeta(supabase, id)),
  };
}

export type EstadoMetas = ReturnType<typeof useGoals>;
