/**
 * supabaseEnv.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Lee y valida la URL y la clave pública de Supabase.
 *
 * POR QUÉ EXISTE: El cliente del navegador y el del servidor necesitan
 *            los mismos dos valores. Si cada uno los leyera por su
 *            cuenta, la validación se duplicaría (regla 1: las
 *            credenciales solo vienen de process.env).
 *
 * DEPENDE DE: .env.local (ver .env.example)
 * USADO EN:   lib/supabase.ts, lib/supabaseServer.ts
 * ---------------------------------------------------------------
 */

// Las claves secretas de Supabase empiezan así. Saltan el RLS por
// completo, así que JAMÁS pueden ir en una variable NEXT_PUBLIC_*, que
// Next.js copia dentro del JavaScript que descarga el navegador.
const SECRET_KEY_PREFIX = 'sb_secret_';

function readEnv(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Falta la variable de entorno ${name} (ver .env.example)`);
  return value;
}

function assertUrl(value: string): string {
  if (!value.startsWith('https://')) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL debe ser la URL del proyecto (https://<id>.supabase.co)',
    );
  }
  return value;
}

function assertPublicKey(value: string): string {
  if (value.startsWith(SECRET_KEY_PREFIX)) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_ANON_KEY tiene una clave SECRETA. Usá la clave publishable/anon.',
    );
  }
  return value;
}

// Next.js solo reemplaza process.env.NEXT_PUBLIC_* cuando se escriben
// literalmente; por eso se leen aquí y no con process.env[name].
export const supabaseUrl = assertUrl(
  readEnv('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL),
);

export const supabaseAnonKey = assertPublicKey(
  readEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
);
