/**
 * login/page.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Ruta pública /login. Solo monta el formulario.
 *
 * NOTA:      Si ya hay sesión, el middleware redirige a /inicio antes
 *            de que esta página se pinte.
 * ---------------------------------------------------------------
 */
import type { Metadata } from 'next';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata: Metadata = { title: 'Iniciar sesión — EVI' };

export default function LoginPage() {
  return <LoginForm />;
}
