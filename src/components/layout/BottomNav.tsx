/**
 * BottomNav.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Barra de navegación flotante con las 4 secciones: Inicio,
 *            Dinero, Eventos y Reportes (§3).
 *
 * POR QUÉ EXISTE: Estilo tomado de la referencia "Total balance": una
 *            cápsula oscura que flota sobre el contenido, y la sección
 *            activa como una píldora clara con su nombre. Ocupa menos
 *            alto que una barra fija y se ve igual en claro y oscuro.
 *
 * USADO EN:   components/layout/PageContainer.tsx
 * ---------------------------------------------------------------
 */
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarDays, ChartPie, House, Wallet, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

interface NavItem {
  href: string;
  label: string;
  Icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/inicio', label: 'Inicio', Icon: House },
  { href: '/dinero', label: 'Dinero', Icon: Wallet },
  { href: '/eventos', label: 'Eventos', Icon: CalendarDays },
  { href: '/reportes', label: 'Reportes', Icon: ChartPie },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegación principal"
      className="absolute inset-x-4 bottom-4 z-20 flex items-center justify-between gap-1 rounded-full bg-noche/95 p-1.5 shadow-float ring-1 ring-white/10 backdrop-blur-md">
      {NAV_ITEMS.map(({ href, label, Icon }) => {
        // startsWith para que /eventos/123 también marque "Eventos".
        const isActive = pathname.startsWith(href);
        return (
          <Link key={href} href={href} aria-current={isActive ? 'page' : undefined} aria-label={label}
            className={cn('flex h-12 items-center justify-center gap-1.5 rounded-full transition-all duration-300',
              isActive ? 'flex-[1.6] bg-white px-4 text-noche' : 'flex-1 text-white/60 hover:text-white')}>
            <Icon size={21} strokeWidth={isActive ? 2.3 : 1.9} aria-hidden />
            {isActive && <span className="text-[13px] font-black tracking-tight">{label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
