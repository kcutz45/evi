/**
 * useCategories.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Hook que expone las categorías del sistema como
 *            { data, isLoading, error }.
 *
 * POR QUÉ EXISTE: Los componentes visuales no deben saber que existe
 *            Supabase. Este hook es la frontera entre la interfaz y
 *            la capa de datos (Responsabilidad Única, §2.1).
 *
 * DEPENDE DE: services/categoryService.ts, lib/supabase.ts
 * USADO EN:   app/(dashboard)/inicio/page.tsx · app/prueba/page.tsx (temporal)
 * ---------------------------------------------------------------
 */
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { listSystemCategories } from '@/services/categoryService';
import type { Category } from '@/types/category';

interface UseCategoriesResult {
  data: Category[];
  isLoading: boolean;
  error: string | null;
}

export function useCategories(): UseCategoriesResult {
  const [data, setData] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Si el componente se desmonta antes de que llegue la respuesta,
    // no se actualiza el estado (evita el aviso de React y datos viejos).
    let isActive = true;

    listSystemCategories(supabase)
      .then((categories) => {
        if (isActive) setData(categories);
      })
      .catch((err: unknown) => {
        if (isActive) setError(err instanceof Error ? err.message : 'Error desconocido');
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  return { data, isLoading, error };
}
