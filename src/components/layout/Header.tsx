/**
 * Header.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Encabezado de pantalla: saludo o título, subtítulo y una
 *            acción opcional a la derecha (avatar, botón "Crear"...).
 *
 * USADO EN:   app/(dashboard)/*
 * ---------------------------------------------------------------
 */
import type { ReactNode } from 'react';
import { getInitials } from '@/lib/text';

interface HeaderProps {
  title: string;
  eyebrow?: string;
  subtitle?: string;
  action?: ReactNode;
}

export function Header({ title, eyebrow, subtitle, action }: HeaderProps) {
  return (
    <header className="flex items-start justify-between gap-3 pb-5 pt-5">
      <div className="flex flex-col gap-0.5">
        {eyebrow && <span className="text-sm font-semibold text-muted">{eyebrow}</span>}
        <h1 className="text-2xl font-black leading-tight tracking-tight">{title}</h1>
        {subtitle && <span className="text-[13.5px] font-bold text-muted-soft">{subtitle}</span>}
      </div>
      {action}
    </header>
  );
}

// Avatar con iniciales para el Dashboard ("Buen día, Andrea").
export function UserAvatar({ fullName }: { fullName: string }) {
  return (
    <div
      aria-hidden
      className="grid h-11 w-11 flex-none place-items-center rounded-tile bg-primary text-[15px] font-extrabold text-white"
    >
      {getInitials(fullName)}
    </div>
  );
}
