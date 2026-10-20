/**
 * Card.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Contenedor con el radio y la sombra del sistema visual.
 *
 * VARIANTES: "surface" (blanca, la normal), "muted" (eventos cerrados)
 *            y "hero" (degradado de marca, balance del mes).
 * ---------------------------------------------------------------
 */
import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type CardVariant = 'surface' | 'muted' | 'hero';

const VARIANTS: Record<CardVariant, string> = {
  surface: 'bg-white shadow-card',
  muted: 'bg-closed',
  hero: 'relative overflow-hidden bg-hero text-white',
};

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

export function Card({ variant = 'surface', className, ...rest }: CardProps) {
  return <div className={cn('rounded-card p-4', VARIANTS[variant], className)} {...rest} />;
}
