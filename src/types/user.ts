/**
 * user.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Tipos de dominio del usuario autenticado y de su perfil.
 *
 * POR QUÉ EXISTE: Los hooks y componentes no deben conocer el objeto
 *            User de Supabase (decenas de campos) ni la fila ProfileRow
 *            en snake_case. authService los traduce a estos dos tipos
 *            mínimos, que son lo único que la interfaz necesita.
 *
 * DEPENDE DE: types/database.ts
 * USADO EN:   services/authService.ts, hooks/useAuth.ts
 * ---------------------------------------------------------------
 */
import type { PlanName } from './database';

export interface AuthUser {
  id: string;
  email: string;
}

export interface Profile {
  id: string;
  fullName: string;
  plan: PlanName;
}
