/**
 * Button.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Botón base de EVI con sus variantes de marca.
 *
 * POR QUÉ EXISTE: Las variantes se deciden por intención ("mint" =
 *            confirmar dinero, "primary" = acción principal), no por
 *            color suelto. Así nadie inventa un botón rojo.
 *
 * USADO EN:   prácticamente todas las pantallas.
 * ---------------------------------------------------------------
 */
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type ButtonVariant = 'primary' | 'mint' | 'soft' | 'ghost';
type ButtonSize = 'md' | 'lg';

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white shadow-glow-primary hover:bg-primary-dark',
  mint: 'bg-mint text-mint-ink shadow-glow-mint hover:brightness-95',
  soft: 'bg-primary-soft text-primary hover:bg-line',
  ghost: 'bg-transparent text-muted hover:bg-line hover:text-closed-ink',
};

const SIZES: Record<ButtonSize, string> = {
  md: 'h-12 rounded-tile px-4 text-sm',
  lg: 'min-h-[58px] rounded-card px-6 text-base',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  icon?: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-black tracking-tight transition',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none',
        VARIANTS[variant],
        SIZES[size],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
