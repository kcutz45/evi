/**
 * MovementList.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Lista de movimientos con sus estados de carga y vacío.
 *
 * POR QUÉ EXISTE: La Definición de Terminado (§7) exige estados de
 *            carga, vacío y error diseñados. Este componente cubre
 *            los dos primeros; el error lo muestra la pantalla.
 * ---------------------------------------------------------------
 */
import { MovementItem } from './MovementItem';
import type { MovementView } from '@/types/movement';

const SKELETON_ROWS = 3;

interface MovementListProps {
  movements: MovementView[];
  isLoading?: boolean;
}

export function MovementList({ movements, isLoading = false }: MovementListProps) {
  if (isLoading) {
    return (
      <ul aria-busy className="flex flex-col gap-2.5">
        {Array.from({ length: SKELETON_ROWS }, (_, i) => (
          <li key={i} className="h-[70px] animate-pulse rounded-[18px] bg-white/70" />
        ))}
      </ul>
    );
  }

  if (movements.length === 0) {
    return (
      <p className="rounded-[18px] bg-white p-5 text-center text-sm font-semibold text-muted">
        Todavía no registrás movimientos este mes. Tocá <strong className="text-primary">+</strong> para
        agregar el primero.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2.5">
      {movements.map((movement) => (
        <MovementItem key={movement.id} movement={movement} />
      ))}
    </ul>
  );
}
