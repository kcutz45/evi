/**
 * registro/page.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Ruta pública /registro. Solo monta el formulario.
 *
 * POR QUÉ EXISTE: La página es un Server Component (puede exportar
 *            metadata); la interactividad vive en RegistroForm.
 * ---------------------------------------------------------------
 */
import type { Metadata } from 'next';
import { RegistroForm } from '@/components/auth/RegistroForm';

export const metadata: Metadata = { title: 'Creá tu cuenta — EVI' };

export default function RegistroPage() {
  return <RegistroForm />;
}
