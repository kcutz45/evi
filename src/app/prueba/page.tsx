/**
 * prueba/page.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Verificar que la app habla con Supabase: lista las 8
 *            categorías del sistema leídas de la base real.
 *
 * POR QUÉ EXISTE: Antes de construir auth, dashboard y eventos, hay que
 *            confirmar que las variables de entorno, el cliente y los
 *            tipos funcionan. Si esta página falla, falla todo lo demás.
 *
 * TEMPORAL:  Borrar la carpeta app/prueba completa una vez verificada
 *            la conexión. El servicio y el hook se quedan: los usará
 *            PasoCategoria del registro.
 *
 * FLUJO:     services/categoryService → hooks/useCategories → este archivo
 *            → CategoryCheckList (solo pinta).
 * ---------------------------------------------------------------
 */
'use client';

import { useCategories } from '@/hooks/useCategories';
import { CategoryCheckList } from './CategoryCheckList';

export default function PruebaPage() {
  const { data, isLoading, error } = useCategories();

  return (
    <main className="mx-auto min-h-dvh max-w-md bg-light px-5 py-8">
      <h1 className="text-2xl font-black tracking-tight">Prueba de conexión</h1>
      <p className="mb-6 mt-1 text-sm font-semibold text-muted-soft">
        Categorías del sistema leídas desde Supabase. Página temporal.
      </p>
      <CategoryCheckList categories={data} isLoading={isLoading} error={error} />
    </main>
  );
}
