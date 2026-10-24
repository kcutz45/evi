/**
 * DashboardSections.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Las dos secciones del Dashboard (§3, pantalla 3) con sus
 *            estados de carga, error y vacío: el balance del mes y los
 *            últimos movimientos.
 *
 * POR QUÉ EXISTE: La Definición de Terminado (§7) exige los tres
 *            estados. Ponerlos aquí deja a la página solo la tarea de
 *            conectar hooks con componentes.
 *
 * DEPENDE DE: BalanceCard.tsx, MovementList.tsx, auth/AuthHeading.tsx
 * USADO EN:   app/(dashboard)/inicio/page.tsx
 * ---------------------------------------------------------------
 */
import { FormAlert } from '@/components/auth/AuthHeading';
import { Button } from '@/components/ui/Button';
import type { MovementView } from '@/types/movement';
import { BalanceCard } from './BalanceCard';
import { MovementList } from './MovementList';

interface BalanceSectionProps {
  monthLabel: string;
  income: number;
  expense: number;
  balance: number;
  isLoading: boolean;
  error: string | null;
  isHidden: boolean;
  onToggleHidden: () => void;
  onRetry: () => void;
}

export function BalanceSection(props: BalanceSectionProps) {
  if (props.isLoading) {
    return <div aria-busy className="h-[200px] animate-pulse rounded-card bg-primary/20" />;
  }
  if (props.error) return <RetryAlert message={props.error} onRetry={props.onRetry} />;
  return (
    <BalanceCard monthLabel={props.monthLabel} balance={props.balance} income={props.income}
      expense={props.expense} isHidden={props.isHidden} onToggleHidden={props.onToggleHidden} />
  );
}

interface RecentMovementsSectionProps {
  movements: MovementView[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

export function RecentMovementsSection({ movements, isLoading, error, onRetry }: RecentMovementsSectionProps) {
  return (
    <section className="mt-6 flex flex-col gap-3">
      <h2 className="text-lg font-black tracking-tight">Últimos movimientos</h2>
      {error ? <RetryAlert message={error} onRetry={onRetry} /> : (
        <MovementList movements={movements} isLoading={isLoading} />
      )}
    </section>
  );
}

// Error con salida: el usuario puede reintentar sin recargar la página.
function RetryAlert({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col gap-2">
      <FormAlert message={message} />
      <Button variant="soft" onClick={onRetry}>Reintentar</Button>
    </div>
  );
}
