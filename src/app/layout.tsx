/**
 * layout.tsx (raíz)
 * ---------------------------------------------------------------
 * PROPÓSITO: Marco HTML de toda la app: idioma, tipografía y estilos.
 *
 * POR QUÉ EXISTE: next/font descarga Outfit (tipografía de la guía de
 *            marca "Mayúsculas con estilo", 31/10/2026) en el build y la sirve
 *            desde nuestro dominio: sin parpadeo de fuente y sin
 *            pedirle nada a Google en cada visita.
 *
 * TEMA:      SCRIPT_TEMA pone la clase .dark antes de pintar (si el
 *            usuario eligió oscuro o es su horario) y VigilanteTema la
 *            mantiene al día. suppressHydrationWarning: esa clase la pone
 *            el script, no React, y no debe tomarse como error.
 * ---------------------------------------------------------------
 */
import type { Metadata, Viewport } from 'next';
import { Outfit } from 'next/font/google';
import type { ReactNode } from 'react';
import { VigilanteTema } from '@/components/layout/VigilanteTema';
import { SCRIPT_TEMA } from '@/lib/tema';
import { marca } from '@/styles/tokens';
import '@/styles/globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: 'EVI — Tus eventos y tu dinero, en un solo lugar',
  description: 'Organizá tus eventos y controlá tus finanzas en quetzales.',
};

export const viewport: Viewport = {
  themeColor: marca.primary,
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es-GT" className={outfit.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA }} />
      </head>
      <body className="font-sans">
        <VigilanteTema />
        {children}
      </body>
    </html>
  );
}
