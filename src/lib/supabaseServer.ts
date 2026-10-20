/**
 * supabaseServer.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Cliente de Supabase para el SERVIDOR: Server Components,
 *            Route Handlers (/api/*) y Server Actions.
 *
 * POR QUÉ EXISTE: En el servidor no hay un navegador que guarde la
 *            sesión. Este cliente la lee de las cookies de la petición,
 *            así las consultas corren como el usuario que pidió la
 *            página y el RLS filtra sus filas igual que en el navegador.
 *
 * REGLA:     Se crea un cliente NUEVO por petición (por eso es una
 *            función y no una constante): compartirlo mezclaría las
 *            sesiones de dos usuarios distintos.
 *
 * DEPENDE DE: lib/supabaseEnv.ts, types/supabase.ts, next/headers
 * USADO EN:   (todavía ninguno — lo usarán auth y las rutas protegidas)
 * ---------------------------------------------------------------
 */
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';
import { supabaseAnonKey, supabaseUrl } from './supabaseEnv';

export function createSupabaseServerClient() {
  const cookieStore = cookies();

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        // Un Server Component no puede escribir cookies: Next.js lanza
        // error. Se ignora a propósito porque el middleware de auth
        // (pendiente) será quien refresque la sesión en cada petición.
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Llamado desde un Server Component: no hay nada que hacer.
        }
      },
    },
  });
}

export type ServerSupabaseClient = ReturnType<typeof createSupabaseServerClient>;
