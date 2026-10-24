/**
 * supabaseMiddleware.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Cliente de Supabase para el middleware: lee la sesión de
 *            las cookies de la petición y la RENUEVA si el token venció.
 *
 * POR QUÉ EXISTE: El token de acceso dura una hora. Un Server Component
 *            no puede escribir cookies (ver supabaseServer.ts), así que
 *            alguien tiene que refrescarlas antes de que la página se
 *            pinte: ese es el middleware, en cada petición.
 *
 * REGLA:     Si el middleware responde con una redirección, debe copiar
 *            las cookies de `response` a la redirección (copiarCookies).
 *            Si no, el token renovado se pierde y la sesión "se cae".
 *
 * DEPENDE DE: lib/supabaseEnv.ts, types/supabase.ts
 * USADO EN:   middleware.ts
 * ---------------------------------------------------------------
 */
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from '@/types/supabase';
import { supabaseAnonKey, supabaseUrl } from './supabaseEnv';

export async function actualizarSesion(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        // Se escriben en la petición (para que las vean las páginas en
        // ESTE mismo request) y en la respuesta (para el navegador).
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
        // Encabezados anti-caché: una página con sesión no debe quedar
        // guardada en un CDN y servirse a otro usuario.
        Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });

  // getUser() valida el token con Supabase (y lo renueva si hace falta).
  // No meter código entre createServerClient y esta línea: es lo que
  // recomienda Supabase para no cerrar sesiones al azar.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user };
}

export function copiarCookies(desde: NextResponse, hacia: NextResponse): NextResponse {
  desde.cookies.getAll().forEach((cookie) => hacia.cookies.set(cookie));
  return hacia;
}
