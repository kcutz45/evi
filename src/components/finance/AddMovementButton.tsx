/**
 * AddMovementButton.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Botón flotante "+" que abre el registro de movimiento.
 *
 * POR QUÉ EXISTE: Es la acción diaria del producto (§0): primer toque
 *            de los 3 que promete EVI. Por eso es grande (56 px) y
 *            vive siempre en el mismo lugar.
 * ---------------------------------------------------------------
 */
import { Plus } from 'lucide-react';

// label: lo que dice el lector de pantalla (en Eventos es «Crear evento»).
export function AddMovementButton({ onClick, label = 'Registrar movimiento' }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid h-14 w-14 place-items-center rounded-card bg-primary text-white shadow-glow-primary transition hover:bg-primary-dark active:scale-95"
    >
      <Plus size={26} strokeWidth={2.6} />
    </button>
  );
}
