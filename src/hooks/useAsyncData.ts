/**
 * useAsyncData.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Carga un dato asíncrono y expone { data, isLoading,
 *            error, recargar }.
 *
 * POR QUÉ EXISTE: Cada hook de datos (balance, movimientos, eventos)
 *            repetía los mismos tres useState y el cuidado de no
 *            actualizar un componente desmontado. Cuando entre TanStack
 *            Query (§1.3, prioridad media) se reemplaza solo este archivo.
 *
 * USADO EN:   hooks/useMonthlySummary.ts, useMovements.ts, useActiveEvents.ts
 * ---------------------------------------------------------------
 */
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

// clave: si cambia (ej. el mes elegido), se vuelve a cargar solo.
export function useAsyncData<T>(cargar: () => Promise<T>, inicial: T, clave = '') {
  const [data, setData] = useState<T>(inicial);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Cambiar este número vuelve a ejecutar la carga (recargar()).
  const [version, setVersion] = useState(0);
  // La función llega nueva en cada render; guardarla en un ref evita
  // recargar sin fin y deja el efecto atado solo a `version`.
  const cargarRef = useRef(cargar);
  cargarRef.current = cargar;

  useEffect(() => {
    let isActive = true;
    setIsLoading(true);
    cargarRef
      .current()
      .then((resultado) => {
        if (!isActive) return;
        setData(resultado);
        setError(null);
      })
      .catch((err: unknown) => {
        if (isActive) setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado.');
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });
    return () => {
      isActive = false;
    };
  }, [version, clave]);

  const recargar = useCallback(() => setVersion((v) => v + 1), []);

  // establecer: cambiar el dato sin volver a consultar (ej. agregar a la
  // lista la categoría recién creada, sin esperar otra carga).
  return { data, isLoading, error, recargar, establecer: setData };
}
