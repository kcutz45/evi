/**
 * PanelGastos.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Pestaña "Gastos" del evento: lo que llevás gastado en él y
 *            el botón "Agregar gasto".
 *
 * POR QUÉ EXISTE: Mientras el evento está activo sus gastos quedan
 *            "pendientes" (no tocan tu balance, §4d); aquí se ven juntos.
 *            "Agregar gasto" solo avisa: la página abre el registro ya
 *            apuntado a este evento.
 *
 * DEPENDE DE: finance/MovementItem.tsx
 * ---------------------------------------------------------------
 */
import { Plus, Receipt } from 'lucide-react';
import { FormAlert } from '@/components/auth/AuthHeading';
import { MovementItem } from '@/components/finance/MovementItem';
import { Button } from '@/components/ui/Button';
import type { MovementDetalle } from '@/types/movement';

interface PanelGastosProps {
  gastos: MovementDetalle[];
  cargando: boolean;
  error: string | null;
  // null = evento cerrado: ya no se agregan gastos.
  onAgregar: (() => void) | null;
}

export function PanelGastos({ gastos, cargando, error, onAgregar }: PanelGastosProps) {
  return (
    <div className="flex flex-col gap-3">
      {onAgregar && (
        <Button variant="soft" fullWidth onClick={onAgregar} icon={<Plus size={19} strokeWidth={2.6} />}>
          Agregar gasto
        </Button>
      )}
      <FormAlert message={error} />
      {cargando && <div aria-busy className="h-32 animate-pulse rounded-card bg-white/70" />}
      {!cargando && gastos.length === 0 && (
        <p className="flex flex-col items-center gap-2 rounded-card bg-white px-5 py-6 text-center text-sm font-semibold text-muted">
          <Receipt size={30} strokeWidth={1.6} className="text-primary" aria-hidden />
          Todavía no hay gastos en este evento.
        </p>
      )}
      {onAgregar && gastos.length > 0 && (
        <p className="px-1 text-xs font-bold text-muted-soft">
          Están pendientes: pasan a tu balance cuando cerrés el evento.
        </p>
      )}
      {gastos.length > 0 && (
        <ul className="flex flex-col gap-2.5">
          {gastos.map((g) => <MovementItem key={g.id} movement={{ ...g, eventName: null }} />)}
        </ul>
      )}
    </div>
  );
}
