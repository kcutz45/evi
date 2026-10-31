/**
 * nueva-contrasena/page.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: A donde lleva el enlace del correo de recuperación (pasando
 *            por /auth/confirm, que abre la sesión).
 * ---------------------------------------------------------------
 */
import type { Metadata } from 'next';
import { NuevaContrasenaForm } from '@/components/auth/NuevaContrasenaForm';

export const metadata: Metadata = { title: 'Nueva contraseña — EVI' };

export default function NuevaContrasenaPage() {
  return <NuevaContrasenaForm />;
}
