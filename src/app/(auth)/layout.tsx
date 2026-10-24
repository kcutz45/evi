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
import type { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 bg-light px-6 py-6">
      <span className="text-center text-3xl font-black tracking-tighter text-primary">EVI</span>
      {children}
    </main>
  );
}
