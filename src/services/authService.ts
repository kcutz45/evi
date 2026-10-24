/**
 * authService.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Registro, inicio y cierre de sesión, y lectura del
 *            usuario actual y de su perfil.
 *
 * POR QUÉ EXISTE: Es la única capa que habla con Supabase Auth. No sabe
 *            que React existe (§2.1): useAuth la orquesta y los
 *            componentes nunca la importan.
 *
 * REGLA:     El perfil en `profiles` lo crea SOLO el trigger
 *            handle_new_user de la base (§5.2). Aquí no se inserta:
 *            el nombre viaja en options.data y el trigger lo lee de
 *            raw_user_meta_data ->> 'full_name'.
 *
 * ERRORES:   Las funciones lanzan Error con el mensaje ya traducido
 *            (authErrors.ts). `cause` conserva el error original para
 *            la telemetría.
 *
 * DEPENDE DE: lib/supabase.ts, services/authErrors.ts, types/user.ts
 * USADO EN:   hooks/useAuth.ts
 * ---------------------------------------------------------------
 */
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { AuthUser, Profile } from '@/types/user';
import { traducirErrorAuth } from './authErrors';

export interface RegistroRespuesta {
  usuario: AuthUser | null;
  // false cuando el proyecto exige confirmar el correo: hay cuenta,
  // pero todavía no hay sesión.
  tieneSesion: boolean;
}

function toAuthUser(user: User): AuthUser {
  return { id: user.id, email: user.email ?? '' };
}

function fallar(error: unknown): never {
  throw new Error(traducirErrorAuth(error), { cause: error });
}

export async function registrarse(
  nombre: string,
  correo: string,
  contrasena: string,
): Promise<RegistroRespuesta> {
  const { data, error } = await supabase.auth.signUp({
    email: correo,
    password: contrasena,
    // La clave se llama full_name porque así la lee el trigger.
    options: { data: { full_name: nombre } },
  });
  if (error) fallar(error);
  return {
    usuario: data.user ? toAuthUser(data.user) : null,
    tieneSesion: data.session !== null,
  };
}

export async function iniciarSesion(correo: string, contrasena: string): Promise<AuthUser> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: correo,
    password: contrasena,
  });
  if (error) fallar(error);
  return toAuthUser(data.user);
}

export async function cerrarSesion(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) fallar(error);
}

// getUser() y no getSession(): getUser valida el token contra el
// servidor de Supabase; getSession solo lee la cookie, que el navegador
// podría tener vencida o alterada.
export async function obtenerUsuarioActual(): Promise<AuthUser | null> {
  const { data, error } = await supabase.auth.getUser();
  // Sin sesión, Supabase devuelve un error "Auth session missing": no es
  // una falla, simplemente no hay nadie conectado.
  if (error || !data.user) return null;
  return toAuthUser(data.user);
}

// RLS (profiles_select_own) garantiza que solo se lee el perfil propio.
export async function obtenerPerfil(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, plan')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw new Error('No pudimos cargar tu perfil.', { cause: error });
  if (!data) return null;
  return { id: data.id, fullName: data.full_name, plan: data.plan };
}

// Avisa cuando la sesión cambia en OTRA pestaña o expira. Devuelve la
// función para dejar de escuchar (se llama al desmontar el hook).
export function escucharCierreDeSesion(alCerrar: () => void): () => void {
  const { data } = supabase.auth.onAuthStateChange((evento) => {
    if (evento === 'SIGNED_OUT') alCerrar();
  });
  return () => data.subscription.unsubscribe();
}
