/**
 * MontoGrande.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Monto protagonista con los centavos más chicos y tenues:
 *            Q3,784.50 → "Q3,784" grande y ".50" pequeño.
 *
 * POR QUÉ EXISTE: Idea tomada de la referencia "Total balance": el ojo
 *            lee primero los quetzales, que es lo que importa; los
 *            centavos siguen ahí pero no compiten. El lector de pantalla
 *            recibe el monto completo de una sola vez.
 * ---------------------------------------------------------------
 */
import { cn } from '@/lib/cn';
import { formatCurrency } from '@/lib/formatCurrency';

interface MontoGrandeProps {
  monto: number;
  oculto?: boolean;
  className?: string;
}

const OCULTO = 'Q ••••••';

export function MontoGrande({ monto, oculto = false, className }: MontoGrandeProps) {
  const texto = formatCurrency(monto);
  const punto = texto.lastIndexOf('.');
  return (
    <p className={cn('tabular font-black leading-none tracking-tighter', className)} aria-label={oculto ? 'Monto oculto' : texto}>
      {oculto ? OCULTO : (
        <span aria-hidden>
          {texto.slice(0, punto)}
          <span className="ml-1 text-[0.5em] opacity-60">{texto.slice(punto)}</span>
        </span>
      )}
    </p>
  );
}
