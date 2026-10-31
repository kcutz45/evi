/**
 * recuperar/page.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Pantalla "¿Olvidaste tu contraseña?".
 *
 * POR QUÉ EXISTE: Página delgada: el formulario hace todo. Recibe
 *            ?enlace=vencido cuando /auth/confirm no pudo usar el enlace.
 * ---------------------------------------------------------------
 */
import type { Metadata } from 'next';
import { RecuperarForm } from '@/components/auth/RecuperarForm';

export const metadata: Metadata = { title: 'Recuperar contraseña — EVI' };

export default function RecuperarPage({ searchParams }: { searchParams: { enlace?: string } }) {
  return <RecuperarForm enlaceVencido={searchParams.enlace === 'vencido'} />;
}
