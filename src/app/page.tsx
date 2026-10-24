/**
 * page.tsx (raíz)
 * ---------------------------------------------------------------
 * TEMPORAL: mientras no exista la landing (app/(marketing)/page.tsx),
 *           la raíz manda a /inicio. Si no hay sesión, el middleware
 *           redirige a /login. Es también a donde llega el usuario
 *           después de confirmar su correo desde el enlace de Supabase.
 *           Borrar este archivo cuando se cree la landing: ambos usan "/".
 *
 * NOTA:     /demo sigue disponible escribiendo la ruta a mano.
 * ---------------------------------------------------------------
 */
import { redirect } from 'next/navigation';
import { RUTA_INICIO } from '@/lib/routes';

export default function RootPage() {
  redirect(RUTA_INICIO);
}
