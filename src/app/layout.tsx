/**
 * layout.tsx (raíz)
 * ---------------------------------------------------------------
 * PROPÓSITO: Marco HTML de toda la app: idioma, tipografía y estilos.
 *
 * POR QUÉ EXISTE: next/font descarga Nunito en el build y la sirve
 *            desde nuestro dominio: sin parpadeo de fuente y sin
 *            pedirle nada a Google en cada visita.
 * ---------------------------------------------------------------
 */
import type { Metadata, Viewport } from 'next';
import { Nunito } from 'next/font/google';
import type { ReactNode } from 'react';
import { colors } from '@/styles/tokens';
import '@/styles/globals.css';

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800', '900'],
  variable: '--font-nunito',
});

export const metadata: Metadata = {
  title: 'EVI — Tus eventos y tu dinero, en un solo lugar',
  description: 'Organizá tus eventos y controlá tus finanzas en quetzales.',
};

export const viewport: Viewport = {
  themeColor: colors.primary.DEFAULT,
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es-GT" className={nunito.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
