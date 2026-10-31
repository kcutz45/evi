/**
 * HistorialCuenta.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Lista de todo lo que entró y salió de una cuenta, agrupada
 *            por día, con el saldo que quedó después de cada movimiento.
 *
 * POR QUÉ EXISTE: Para entender un saldo hay que ver de dónde salió.
 *            Gastos, ingresos, cobros, transferencias y abonos a metas se
 *            ven juntos, cada uno con su ícono. Solo pinta.
 * ---------------------------------------------------------------
 */
import { History } from 'lucide-react';
import { AppIcon } from '@/components/ui/AppIcon';
import { cn } from '@/lib/cn';
import { formatCurrency } from '@/lib/formatCurrency';
import type { GrupoDeHistorial, MovimientoConSaldo } from '@/lib/historialCuenta';

const FILAS_DE_CARGA = 4;

interface HistorialCuentaProps {
  grupos: GrupoDeHistorial[];
  cargando: boolean;
  // Con lo que arrancó la cuenta en EVI (incluye correcciones de saldo).
  saldoInicial: number;
}

export function HistorialCuenta({ grupos, cargando, saldoInicial }: HistorialCuentaProps) {
  if (cargando) {
    return (
      <div aria-busy className="flex flex-col gap-2.5">
        {Array.from({ length: FILAS_DE_CARGA }, (_, i) => <div key={i} className="h-[66px] animate-pulse rounded-[18px] bg-surface/70" />)}
      </div>
    );
  }
  if (grupos.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-card bg-surface px-6 py-10 text-center shadow-card">
        <History size={36} strokeWidth={1.6} className="text-muted-faint" aria-hidden />
        <p className="text-sm font-bold text-muted">Todavía no hay movimientos en esta cuenta. Al registrar un gasto o ingreso, elegila en «¿De dónde salió?».</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-5">
      {grupos.map((g) => (
        <section key={g.fecha} className="flex flex-col gap-2">
          <h3 className="text-xs font-black uppercase tracking-widest text-muted-soft">{g.etiqueta}</h3>
          <ul className="flex flex-col gap-2">{g.movimientos.map((m) => <Fila key={`${m.tipo}-${m.id}`} m={m} />)}</ul>
        </section>
      ))}
      <p className="tabular rounded-tile bg-surface/60 px-4 py-3 text-center text-xs font-bold text-muted-soft">
        Saldo inicial de la cuenta: {formatCurrency(saldoInicial)}
      </p>
    </div>
  );
}

const TONO: Record<MovimientoConSaldo['tipo'], string> = {
  ingreso: 'bg-mint-soft text-mint-dark',
  cobro: 'bg-gold/25 text-gold-dark',
  gasto: 'bg-primary-soft text-primary',
  transferencia: 'bg-primary-soft text-primary',
  meta: 'bg-mint-soft text-mint-dark',
};

function Fila({ m }: { m: MovimientoConSaldo }) {
  const entra = m.monto > 0;
  return (
    <li className="flex items-center gap-3 rounded-[18px] bg-surface p-3 shadow-card">
      <span className={cn('grid h-10 w-10 flex-none place-items-center rounded-tile', TONO[m.tipo])}>
        <AppIcon name={m.icono} size={19} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-[14.5px] font-extrabold tracking-tight">{m.titulo}</span>
        <span className="truncate text-xs font-semibold text-muted-soft">{m.detalle}</span>
      </span>
      <span className="flex flex-none flex-col items-end">
        <span className={cn('tabular text-[14.5px] font-black', entra ? 'text-mint-dark' : 'text-dark')}>
          {entra ? '+' : '−'}{formatCurrency(Math.abs(m.monto))}
        </span>
        <span className="tabular text-[11px] font-bold text-muted-faint">Saldo {formatCurrency(m.saldoDespues)}</span>
      </span>
    </li>
  );
}
