/**
 * navegacion.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Las secciones de la app, compartidas por la cápsula de
 *            abajo (celular y tablet) y la barra lateral (PC).
 *
 * POR QUÉ EXISTE: En el celular solo caben 4 secciones (§3); Cuentas y
 *            Metas se abren desde Inicio. En PC sobra espacio y van todas.
 *            Una sola lista evita que las dos navegaciones se desalineen.
 *
 * USADO EN:   components/layout/BottomNav.tsx, BarraLateral.tsx
 * ---------------------------------------------------------------
 */
import { CalendarDays, ChartPie, House, Landmark, PiggyBank, Wallet, type LucideIcon } from 'lucide-react';
import { RUTA_CUENTAS, RUTA_INICIO, RUTA_METAS } from '@/lib/routes';

export interface NavItem {
  href: string;
  label: string;
  Icon: LucideIcon;
}

export const NAV_PRINCIPAL: NavItem[] = [
  { href: RUTA_INICIO, label: 'Inicio', Icon: House },
  { href: '/dinero', label: 'Dinero', Icon: Wallet },
  { href: '/eventos', label: 'Eventos', Icon: CalendarDays },
  { href: '/reportes', label: 'Reportes', Icon: ChartPie },
];

export const NAV_COMPLETA: NavItem[] = [
  ...NAV_PRINCIPAL,
  { href: RUTA_CUENTAS, label: 'Cuentas', Icon: Landmark },
  { href: RUTA_METAS, label: 'Metas', Icon: PiggyBank },
];
