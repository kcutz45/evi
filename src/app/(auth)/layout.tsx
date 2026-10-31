/**
 * (auth)/layout.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Marco compartido de /registro y /login: logo arriba y el
 *            formulario centrado en una columna de celular.
 *
 * POR QUÉ EXISTE: §3 pantalla 2 pide un solo paso y sin scroll. La
 *            columna usa toda la altura (min-h-dvh) y centra el
 *            contenido, así el formulario entra completo en pantalla.
 * ---------------------------------------------------------------
 */
import Link from 'next/link';
import type { ReactNode } from 'react';
import { RUTA_LANDING } from '@/lib/routes';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 bg-light px-6 py-6">
      {/* El logo vuelve a la página de inicio (landing). */}
      <Link href={RUTA_LANDING} aria-label="EVI, volver a la página de inicio"
        className="self-center text-3xl font-black tracking-tighter text-primary">EVI</Link>
      {children}
    </main>
  );
}
