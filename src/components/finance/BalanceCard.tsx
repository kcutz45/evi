/**
 * BalanceCard.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Tarjeta principal del Inicio. El número grande es TU
 *            DINERO (lo que hay en tus cuentas, como en un banco); debajo,
 *            lo que entró y salió en el mes y cuánto te queda del mes.
 *
 * POR QUÉ EXISTE: Antes el número grande era el balance del mes y "Tu
 *            dinero hoy" iba en otra tarjeta: dos montos parecidos que
 *            confundían (31/10/2026). Ahora hay un solo número principal
 *            y el mes se lee como "entró / salió / te quedan".
 *
 * REGLAS:    Cobrar, transferir y abonar a metas mueven TU DINERO pero no
 *            "Entró/Salió" (no son ingresos ni gastos, §4d). Los gastos de
 *            un evento activo bajan tu dinero ya, y cuentan en "Salió" al
 *            cerrar el evento. Los totales vienen calculados por las
 *            vistas vw_account_balances y vw_monthly_summary.
 *
 * USADO EN:   app/(dashboard)/inicio/page.tsx
 * ---------------------------------------------------------------
 */
import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowDown, ArrowUp, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { Brillo } from '@/components/ui/Brillo';
import { Card } from '@/components/ui/Card';
import { MontoGrande } from '@/components/ui/MontoGrande';
import { cn } from '@/lib/cn';
import { formatCurrency } from '@/lib/formatCurrency';
import { RUTA_CUENTAS } from '@/lib/routes';

const HIDDEN_AMOUNT = 'Q ••••••';

interface BalanceCardProps {
  monthLabel: string;
  // Suma de tus cuentas. null = todavía no hay cuentas (sin migración):
  // se muestra el balance del mes como número principal.
  dinero: number | null;
  balance: number;
  income: number;
  expense: number;
  isHidden: boolean;
  onToggleHidden: () => void;
}

export function BalanceCard(props: BalanceCardProps) {
  const { monthLabel, dinero, balance, income, expense, isHidden, onToggleHidden } = props;
  const show = (amount: number) => (isHidden ? HIDDEN_AMOUNT : formatCurrency(amount));

  return (
    <Card variant="hero" className="p-5">
      <Brillo />
      <div className="relative flex items-center justify-between">
        <Titulo conCuentas={dinero !== null} monthLabel={monthLabel} />
        <button type="button" onClick={onToggleHidden} aria-label={isHidden ? 'Mostrar montos' : 'Ocultar montos'}
          className="vidrio grid h-9 w-9 place-items-center rounded-full hover:bg-white/20">
          {isHidden ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
      <MontoGrande monto={dinero ?? balance} oculto={isHidden} className="relative mt-3 text-[44px] text-mint" />
      <div className="relative mt-5 grid grid-cols-2 gap-2.5">
        <Cifra label={`Entró en ${monthLabel}`} value={show(income)} icon={<ArrowUp size={15} />} />
        <Cifra label={`Salió en ${monthLabel}`} value={show(expense)} icon={<ArrowDown size={15} />} />
      </div>
      {dinero !== null && <LoQueQueda balance={balance} texto={show(Math.abs(balance))} />}
    </Card>
  );
}

function Titulo({ conCuentas, monthLabel }: { conCuentas: boolean; monthLabel: string }) {
  const clase = 'text-[13px] font-bold uppercase tracking-wider text-white/70';
  if (!conCuentas) return <span className={clase}>Balance de {monthLabel}</span>;
  return (
    <Link href={RUTA_CUENTAS} className={cn(clase, 'inline-flex items-center gap-1 hover:text-white')}>
      Tu dinero <ChevronRight size={15} aria-hidden />
    </Link>
  );
}

// "Este mes te quedan +Q…": ingresos − gastos del mes. Dorado si se gastó
// más de lo que entró (avisar sin regañar: nunca rojo).
function LoQueQueda({ balance, texto }: { balance: number; texto: string }) {
  const negativo = balance < 0;
  return (
    <p className="vidrio relative mt-3 flex items-center justify-between gap-2 rounded-2xl px-3 py-2.5 text-[12.5px] font-bold text-white/85">
      {negativo ? 'Este mes salió más de lo que entró' : 'Este mes te quedan'}
      <strong className={cn('tabular font-black', negativo ? 'text-gold' : 'text-mint')}>
        {negativo ? '−' : '+'}{texto}
      </strong>
    </p>
  );
}

function Cifra({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="vidrio flex flex-col gap-0.5 rounded-2xl px-3 py-2.5">
      <span className="inline-flex items-center gap-1 text-xs font-bold text-white/70">
        {icon}
        {label}
      </span>
      <span className="tabular text-lg font-black tracking-tight">{value}</span>
    </div>
  );
}
