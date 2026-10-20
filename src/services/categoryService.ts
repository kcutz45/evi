/**
 * categoryService.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Lectura de categorías desde Supabase.
 *
 * POR QUÉ EXISTE: Es la única capa que sabe que las categorías viven en
 *            la tabla `categories` con columnas snake_case. Devuelve el
 *            tipo de dominio Category, que es lo único que conocen los
 *            hooks y los componentes. No sabe que React existe (§2.1).
 *
 *            Recibe el cliente como parámetro para servir tanto en el
 *            navegador (lib/supabase.ts) como en el servidor
 *            (lib/supabaseServer.ts) sin duplicarse.
 *
 * DEPENDE DE: types/supabase.ts, types/database.ts, types/category.ts
 * USADO EN:   hooks/useCategories.ts
 * ---------------------------------------------------------------
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Category } from '@/types/category';
import type { CategoryRow } from '@/types/database';
import type { Database } from '@/types/supabase';

// Código de PostgreSQL para "no tenés privilegio sobre esta tabla".
// schema.sql solo le da SELECT de categories al rol `authenticated`.
const PG_INSUFFICIENT_PRIVILEGE = '42501';

type CategoryColumns = Pick<CategoryRow, 'id' | 'name' | 'icon' | 'kind'>;

function toCategory(row: CategoryColumns): Category {
  return { id: row.id, name: row.name, icon: row.icon, kind: row.kind };
}

// Las categorías del sistema son las que tienen user_id NULL (schema.sql,
// sección 2). Se ordenan por nombre para que la lista sea estable.
export async function listSystemCategories(
  client: SupabaseClient<Database>,
): Promise<Category[]> {
  const { data, error } = await client
    .from('categories')
    .select('id, name, icon, kind')
    .is('user_id', null)
    .order('name');

  // supabase-js no lanza excepciones: devuelve { error }. Sin este
  // chequeo, un rechazo por permisos se vería como "lista vacía".
  if (error) {
    if (error.code === PG_INSUFFICIENT_PRIVILEGE) {
      throw new Error('Sin permiso para leer categorías: hace falta iniciar sesión.');
    }
    throw new Error(`No se pudieron cargar las categorías: ${error.message}`);
  }
  return data.map(toCategory);
}
