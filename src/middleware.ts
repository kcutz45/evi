/**
 * middleware.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Portero de la app. Corre ANTES de cada página:
 *            - Sin sesión en una ruta del grupo (dashboard) → /login.
 *            - Con sesión en /login o /registro → /inicio.
 *            - En todos los casos, renueva el token si venció.
 *
 * POR QUÉ EXISTE: Proteger en el servidor evita el "parpadeo" de una
 *            página privada que se alcanza a ver antes de que el
 *            navegador descubra que no hay sesión.
 *
 * SEGURIDAD: Esto protege PANTALLAS, no datos. Los datos los protege el
 *            RLS de la base (regla 7): aunque alguien se saltara el
 *            middleware, Supabase no le devolvería filas ajenas.
 *
 * DEPENDE DE: lib/supabaseMiddleware.ts, lib/routes.ts
 * ---------------------------------------------------------------
 */
import { NextResponse, type NextRequest } from 'next/server';
import { RUTA_INICIO, RUTA_LOGIN, RUTAS_DE_AUTH, RUTAS_PROTEGIDAS, coincideCon } from '@/lib/routes';
import { actualizarSesion, copiarCookies } from '@/lib/supabaseMiddleware';

function redirigir(request: NextRequest, destino: string, response: NextResponse) {
  const url = request.nextUrl.clone();
  url.pathname = destino;
  url.search = '';
  return copiarCookies(response, NextResponse.redirect(url));
}

export async function middleware(request: NextRequest) {
  const { response, user } = await actualizarSesion(request);
  const { pathname } = request.nextUrl;

  if (!user && coincideCon(pathname, RUTAS_PROTEGIDAS)) {
    return redirigir(request, RUTA_LOGIN, response);
  }
  if (user && coincideCon(pathname, RUTAS_DE_AUTH)) {
    return redirigir(request, RUTA_INICIO, response);
  }
  return response;
}

// No correr en archivos estáticos ni imágenes: no tienen sesión que
// proteger y cada llamada a Supabase agregaría latencia.
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
};
