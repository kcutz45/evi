/**
 * auth/confirm/route.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: A donde llegan los enlaces de los correos de Supabase
 *            (recuperar contraseña, confirmar cuenta). Abre la sesión
 *            con el código del enlace y manda a la pantalla que sigue.
 *
 * POR QUÉ EXISTE: El enlace trae un código de un solo uso; hay que
 *            cambiarlo por una sesión EN EL SERVIDOR para que quede en
 *            las cookies y el middleware la vea. Acepta los dos formatos
 *            de Supabase: ?code=… (plantilla por defecto) y
 *            ?token_hash=…&type=… (plantilla personalizada).
 *
 * SEGURIDAD: "next" solo puede ser una ruta interna ("/algo"): así el
 *            enlace no puede usarse para mandar a alguien a otro sitio.
 *
 * DEPENDE DE: lib/supabaseServer.ts, lib/routes.ts
 * ---------------------------------------------------------------
 */
import { NextResponse, type NextRequest } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { RUTA_INICIO, RUTA_RECUPERAR } from '@/lib/routes';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

function destinoSeguro(next: string | null): string {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : RUTA_INICIO;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const supabase = createSupabaseServerClient();

  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : tokenHash && type
      ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
      : { error: new Error('Enlace incompleto') };

  if (error) return NextResponse.redirect(`${origin}${RUTA_RECUPERAR}?enlace=vencido`);
  return NextResponse.redirect(`${origin}${destinoSeguro(searchParams.get('next'))}`);
}
