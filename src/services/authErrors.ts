/**
 * authErrors.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Traduce los errores de Supabase Auth a mensajes en
 *            español de Guatemala que se pueden mostrar al usuario.
 *
 * POR QUÉ EXISTE: Supabase responde "Invalid login credentials" en
 *            inglés. Se traduce por el CÓDIGO del error (estable entre
 *            versiones) y no por el texto (que puede cambiar).
 *
 * DEPENDE DE: @supabase/supabase-js
 * USADO EN:   services/authService.ts
 * ---------------------------------------------------------------
 */
import { isAuthError, isAuthRetryableFetchError } from '@supabase/supabase-js';

const MENSAJES: Record<string, string> = {
  invalid_credentials: 'Correo o contraseña incorrectos.',
  user_already_exists: 'Ya hay una cuenta con ese correo. Iniciá sesión.',
  email_exists: 'Ya hay una cuenta con ese correo. Iniciá sesión.',
  weak_password: 'La contraseña es muy débil. Probá con una más larga.',
  email_address_invalid: 'Ese correo no es válido.',
  email_not_confirmed: 'Todavía no confirmaste tu correo. Revisá tu bandeja de entrada.',
  over_email_send_rate_limit: 'Demasiados intentos. Esperá unos minutos y probá de nuevo.',
  over_request_rate_limit: 'Demasiados intentos. Esperá unos minutos y probá de nuevo.',
  signup_disabled: 'El registro de cuentas está desactivado por ahora.',
};

const MENSAJE_GENERICO = 'No pudimos completar la acción. Intentá de nuevo.';
const MENSAJE_SIN_CONEXION = 'Sin conexión con el servidor. Revisá tu internet.';

export function traducirErrorAuth(error: unknown): string {
  if (isAuthRetryableFetchError(error)) return MENSAJE_SIN_CONEXION;
  if (isAuthError(error) && error.code) return MENSAJES[error.code] ?? MENSAJE_GENERICO;
  return MENSAJE_GENERICO;
}

// Código corto para la telemetría (signup_failed.reason). Nunca incluye
// el correo ni otros datos personales: solo el código del error.
export function codigoErrorAuth(error: unknown): string {
  if (isAuthRetryableFetchError(error)) return 'sin_conexion';
  if (isAuthError(error) && error.code) return error.code;
  return 'desconocido';
}
