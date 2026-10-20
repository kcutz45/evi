/**
 * PageContainer.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Marco de toda pantalla protegida: zona con scroll arriba
 *            y la navegación fija abajo.
 *
 * POR QUÉ EXISTE: En escritorio la app se ve como una columna de
 *            celular centrada (max-w-md) en vez de estirarse a todo el
 *            ancho: es una PWA pensada para el teléfono.
 * ---------------------------------------------------------------
 */
import type { ReactNode } from 'react';
import { BottomNav } from './BottomNav';

interface PageContainerProps {
  children: ReactNode;
  floatingAction?: ReactNode;
  showNav?: boolean;
}

export function PageContainer({ children, floatingAction, showNav = true }: PageContainerProps) {
  return (
    <div className="relative mx-auto flex h-dvh max-w-md flex-col overflow-hidden bg-light">
      <main className="flex-1 overflow-y-auto px-5 pb-24">{children}</main>
      {floatingAction && <div className="absolute bottom-28 right-5 z-10">{floatingAction}</div>}
      {showNav && <BottomNav />}
    </div>
  );
}
