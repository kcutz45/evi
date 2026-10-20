/**
 * Badge.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Etiqueta corta de estado ("Activo", "Cerrado", "Pendiente").
 * ---------------------------------------------------------------
 */
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type BadgeTone = 'mint' | 'primary' | 'gold' | 'neutral';

const TONES: Record<BadgeTone, string> = {
  mint: 'bg-mint/20 text-mint-dark',
  primary: 'bg-primary/10 text-primary-dark',
  gold: 'bg-gold/25 text-gold-ink',
  neutral: 'bg-closed-badge text-muted',
};

interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}

export function Badge({ tone = 'primary', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex flex-none items-center gap-1 rounded-xl px-2.5 py-1.5 text-[11.5px] font-black tracking-wide',
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
