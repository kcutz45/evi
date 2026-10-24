/**
 * CampoMonto.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Campo grande para escribir un monto en quetzales, con la
 *            "Q" fija y el teclado numérico del celular.
 *
 * POR QUÉ EXISTE: En las hojas (saldo de una cuenta, transferencia,
 *            abono) no cabe la calculadora completa; inputMode="decimal"
 *            abre el teclado de números del celular. El texto se
 *            convierte con leerMonto (lib/formatCurrency.ts).
 * ---------------------------------------------------------------
 */
import { useId } from 'react';

interface CampoMontoProps {
  etiqueta: string;
  valor: string;
  onCambiar: (texto: string) => void;
  autoFocus?: boolean;
}

export function CampoMonto({ etiqueta, valor, onCambiar, autoFocus = false }: CampoMontoProps) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-bold text-muted">{etiqueta}</label>
      <div className="flex items-center gap-1 rounded-tile bg-white px-4 py-3 ring-1 ring-transparent focus-within:ring-primary">
        <span className="text-2xl font-black text-muted-soft" aria-hidden>Q</span>
        <input id={id} type="text" inputMode="decimal" autoComplete="off" value={valor} autoFocus={autoFocus}
          onChange={(e) => onCambiar(e.target.value)} placeholder="0.00"
          className="tabular min-w-0 flex-1 bg-transparent text-2xl font-black text-dark outline-none placeholder:text-line" />
      </div>
    </div>
  );
}
