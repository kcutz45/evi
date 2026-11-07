/**
 * PageContainer.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Marco de toda pantalla protegida: zona con scroll y la
 *            navegación que corresponde al tamaño de la pantalla.
 *
 * POR QUÉ EXISTE: EVI se usa en celular, tablet y PC:
 *            - Celular y tablet: cápsula flotante abajo.
 *            - PC (desde 1024 px): barra lateral a la izquierda.
 *            El contenido crece hasta max-w-2xl en tablet y max-w-5xl en
 *            PC; cada página decide cómo reparte sus columnas.
 * ---------------------------------------------------------------
 */
import type { ReactNode } from 'react';
import { BarraLateral } from './BarraLateral';
import { BottomNav } from './BottomNav';

interface PageContainerProps {
  children: ReactNode;
  floatingAction?: ReactNode;
  showNav?: boolean;
}

export function PageContainer({ children, floatingAction, showNav = true }: PageContainerProps) {
  return (
    <div className="flex h-dvh overflow-hidden bg-light">
      {showNav && <BarraLateral />}
      <div className="relative flex min-w-0 flex-1 flex-col">
        <main className="flex-1 overflow-y-auto px-5 pb-28 md:px-8 lg:pb-10">
          <div className="mx-auto w-full max-w-2xl lg:max-w-5xl">{children}</div>
        </main>
        {floatingAction && <div className="absolute bottom-[92px] right-5 z-10 md:right-8 lg:bottom-8">{floatingAction}</div>}
        {showNav && <BottomNav />}
      </div>
    </div>
  );
}
