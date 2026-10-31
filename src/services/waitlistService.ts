/**
 * waitlistService.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Guardar un correo en la lista de espera de la landing.
 *
 * POR QUÉ EXISTE: Es el corazón del smoke test (§3, pantalla 1):
 *            correos capturados ÷ visitantes. La tabla waitlist solo
 *            permite INSERT público, sin SELECT (nadie puede leer la lista
 *            desde la app). Por eso no se pide la fila de vuelta.
 *
 * DEPENDE DE: lib/supabase.ts, types/supabase.ts
 * USADO EN:   hooks/useListaEspera.ts
 * ---------------------------------------------------------------
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { PlanName } from '@/types/database';
import type { Database } from '@/types/supabase';

const DUPLICADO = '23505';
const FUENTE_MAX = 100;

// Un correo que ya estaba también es éxito: la persona ya está anotada.
export async function unirseALista(
  client: SupabaseClient<Database>,
  correo: string,
  plan: PlanName | null,
  fuente: string | null,
): Promise<void> {
  const { error } = await client
    .from('waitlist')
    .insert({ email: correo, plan_interest: plan, source: fuente?.slice(0, FUENTE_MAX) ?? null });
  if (error && error.code !== DUPLICADO) {
    throw new Error('No pudimos anotarte. Intentá de nuevo.', { cause: error });
  }
}
