/**
 * TransferAnimation.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Animación "evento → mis finanzas" del modal de cierre:
 *            tres monedas Q viajan de un ícono al otro.
 *
 * POR QUÉ EXISTE: Hace visible el diferenciador del producto. El
 *            usuario VE que sus gastos pasan solos a sus finanzas.
 *
 * NOTA:      Los keyframes viven en tailwind.config.ts. Con
 *            motion-reduce se respeta a quien desactivó animaciones
 *            en su teléfono.
 * ---------------------------------------------------------------
 */
import type { ReactNode } from 'react';
import { ArrowRight, CalendarDays, Wallet } from 'lucide-react';
import { cn } from '@/lib/cn';

// Cada moneda sale en un carril distinto y con un retraso escalonado.
const COINS = [
  { lane: 'top-1.5', delay: '[animation-delay:0ms]' },
  { lane: 'top-[31px]', delay: '[animation-delay:320ms]' },
  { lane: 'top-14', delay: '[animation-delay:640ms]' },
];

export function TransferAnimation() {
  return (
    <div aria-hidden className="flex h-[84px] items-center justify-between">
      <Endpoint label="Eventos" className="bg-primary/15 text-primary">
        <CalendarDays size={26} strokeWidth={1.9} />
      </Endpoint>

      <div className="relative h-full flex-1">
        <svg viewBox="0 0 148 84" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
          <path d="M2 42 H146" fill="none" strokeWidth="2" strokeLinecap="round" strokeDasharray="6 8"
            className="animate-dash stroke-line motion-reduce:animate-none" />
        </svg>
        {COINS.map((coin) => (
          <span key={coin.lane} className={cn(
            'absolute grid h-[22px] w-8 animate-travel place-items-center rounded-lg border-[1.5px] border-primary/40',
            'bg-primary-soft text-[10px] font-black text-primary-dark opacity-0 motion-reduce:hidden',
            coin.lane, coin.delay)}>
            Q
          </span>
        ))}
        <span className="absolute left-1/2 top-1/2 grid h-[26px] w-[26px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[10px] bg-white text-muted-faint">
          <ArrowRight size={16} strokeWidth={2.6} />
        </span>
      </div>

      <Endpoint label="Mis finanzas" className="animate-pulse-mint bg-mint/20 text-mint-dark motion-reduce:animate-none">
        <Wallet size={26} strokeWidth={1.9} />
      </Endpoint>
    </div>
  );
}

interface EndpointProps {
  label: string;
  className: string;
  children: ReactNode;
}

function Endpoint({ label, className, children }: EndpointProps) {
  return (
    <div className="flex w-[88px] flex-none flex-col items-center gap-2">
      <div className={cn('grid h-[54px] w-[54px] place-items-center rounded-card', className)}>{children}</div>
      <span className="text-[11.5px] font-black text-closed-ink">{label}</span>
    </div>
  );
}
