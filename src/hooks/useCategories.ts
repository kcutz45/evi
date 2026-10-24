/**
 * useCategories.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Categorías del usuario (las 18 del sistema + las propias)
 *            y la acción para crear una nueva.
 *
 * POR QUÉ EXISTE: Los componentes visuales no deben saber que existe
 *            Supabase (§2.1). Al crear, valida con Zod, evita nombres
 *            repetidos y agrega la nueva a la lista al instante, para que
 *            el registro la pueda usar sin esperar otra carga.
 *
 * DEPENDE DE: services/categoryService.ts, services/telemetryService.ts
 * USADO EN:   app/(dashboard)/inicio, app/(dashboard)/dinero, app/prueba (temporal)
 * ---------------------------------------------------------------
 */
'use client';

import { useCallback, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { crearCategoria, listCategories } from '@/services/categoryService';
import { track } from '@/services/telemetryService';
import { nuevaCategoriaSchema, type Category, type NuevaCategoria } from '@/types/category';
import { useAsyncData } from './useAsyncData';

const SIN_CATEGORIAS: Category[] = [];

// "comida " y "Comida" son la misma: se compara sin mayúsculas ni espacios.
const mismoNombre = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

export function useCategories() {
  const estado = useAsyncData(() => listCategories(supabase), SIN_CATEGORIAS);
  const [creando, setCreando] = useState(false);
  const [errorCrear, setErrorCrear] = useState<string | null>(null);
  const { data, establecer } = estado;

  // Devuelve la categoría creada, o null si hubo un error (queda en errorCrear).
  const crear = useCallback(
    async (datos: NuevaCategoria): Promise<Category | null> => {
      const parsed = nuevaCategoriaSchema.safeParse(datos);
      if (!parsed.success) {
        setErrorCrear(parsed.error.issues[0]?.message ?? 'Revisá los datos');
        return null;
      }
      if (data.some((c) => c.kind === parsed.data.kind && mismoNombre(c.name, parsed.data.name))) {
        setErrorCrear(`Ya tenés una categoría llamada «${parsed.data.name}».`);
        return null;
      }
      setCreando(true);
      setErrorCrear(null);
      try {
        const nueva = await crearCategoria(supabase, parsed.data);
        establecer((actuales) => [...actuales, nueva].sort((a, b) => a.name.localeCompare(b.name, 'es')));
        void track('category_created', { kind: nueva.kind });
        return nueva;
      } catch (err) {
        setErrorCrear(err instanceof Error ? err.message : 'No pudimos crear la categoría.');
        return null;
      } finally {
        setCreando(false);
      }
    },
    [data, establecer],
  );

  const limpiarErrorCrear = useCallback(() => setErrorCrear(null), []);

  return { ...estado, crear, creando, errorCrear, limpiarErrorCrear };
}
