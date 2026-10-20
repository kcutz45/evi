/**
 * BottomNav.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Barra de navegación inferior de las rutas protegidas.
 *
 * POR QUÉ EXISTE: En el celular el pulgar llega abajo, no arriba. Las
 *            cuatro pestañas corresponden a las carpetas de
 *            app/(dashboard) definidas en §2.3.
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
    <nav
      aria-label="Navegación principal"
      className="grid flex-none grid-cols-4 gap-1 border-t border-line bg-white px-3.5 pb-6 pt-2.5"
    >
      {NAV_ITEMS.map(({ href, label, Icon }) => {
        // startsWith para que /eventos/123 también marque "Eventos".
        const isActive = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'flex flex-col items-center gap-1 py-2 text-[11.5px] transition-colors',
              isActive ? 'font-extrabold text-primary' : 'font-bold text-muted-faint hover:text-primary',
            )}
          >
            <Icon size={23} strokeWidth={isActive ? 2.1 : 1.9} aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
