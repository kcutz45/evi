/**
 * BarraLateral.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Navegación de PC: panel oscuro a la izquierda con el logo
 *            y las 6 secciones. Solo aparece desde 1024 px de ancho.
 *
 * POR QUÉ EXISTE: En una pantalla grande la cápsula de abajo queda lejos
 *            y desperdicia espacio; lo natural es un menú lateral. Usa el
 *            mismo lenguaje que la cápsula: fondo noche y la sección activa
 *            como píldora blanca.
 *
 * USADO EN:   components/layout/PageContainer.tsx
 * ---------------------------------------------------------------
 */
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogoEvi } from '@/components/ui/Logo';
import { cn } from '@/lib/cn';
import { RUTA_INICIO } from '@/lib/routes';
import { NAV_COMPLETA } from './navegacion';

export function BarraLateral() {
  const pathname = usePathname();
  return (
    <aside className="hidden w-60 flex-none p-4 pr-0 lg:block">
      <nav aria-label="Navegación principal" className="flex h-full flex-col gap-1 rounded-sheet bg-noche p-4 shadow-float">
        <Link href={RUTA_INICIO} aria-label="EVI, ir a Inicio" className="mb-5 mt-1 px-3">
          <LogoEvi variante="oscuro" className="w-[76px]" />
        </Link>
        {NAV_COMPLETA.map(({ href, label, Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link key={href} href={href} aria-current={isActive ? 'page' : undefined}
              className={cn('flex h-11 items-center gap-3 rounded-full px-4 text-sm font-extrabold transition-colors',
                isActive ? 'bg-white text-noche' : 'text-white/65 hover:bg-white/10 hover:text-white')}>
              <Icon size={19} strokeWidth={isActive ? 2.3 : 1.9} aria-hidden /> {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
