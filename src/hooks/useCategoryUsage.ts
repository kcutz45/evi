/**
 * useCategoryUsage.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Qué categorías usó el usuario en sus últimos movimientos.
 *
 * POR QUÉ EXISTE: Alimenta "Tus frecuentes" del registro. Si falla, el
 *            registro sigue funcionando: solo no muestra frecuentes.
 *
 * DEPENDE DE: services/movementService.ts
 * USADO EN:   app/(dashboard)/inicio/page.tsx
 * ---------------------------------------------------------------
 */
'use client';

import { MOVIMIENTOS_PARA_FRECUENCIA } from '@/lib/constants';
import { supabase } from '@/lib/supabase';
import { listarUsoDeCategorias } from '@/services/movementService';
import { useAsyncData } from './useAsyncData';

const SIN_USOS: string[] = [];

export function useCategoryUsage() {
  return useAsyncData(() => listarUsoDeCategorias(supabase, MOVIMIENTOS_PARA_FRECUENCIA), SIN_USOS);
}
