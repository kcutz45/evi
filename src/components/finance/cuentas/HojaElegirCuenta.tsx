/**
 * HojaElegirCuenta.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Hoja para elegir una cuenta: "¿Dónde te pagaron?" al
 *            cobrar, "¿De dónde sale?" al abonar a una meta.
 *
 * POR QUÉ EXISTE: Elegir la cuenta es un toque extra que solo aparece
 *            cuando hace falta, sin sacar al usuario de su pantalla.
 *            Solo avisa con onElegir: guardar es trabajo del hook.
 * ---------------------------------------------------------------
 */
'use client';

import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { Hoja } from '@/components/ui/Hoja';
import { formatCurrency } from '@/lib/formatCurrency';
import type { Cuenta } from '@/types/account';

interface HojaElegirCuentaProps {
  titulo: string;
  subtitulo: string;
  cuentas: Cuenta[];
  ocupado?: boolean;
  onElegir: (cuentaId: string) => void;
  onCerrar: () => void;
}

export function HojaElegirCuenta(props: HojaElegirCuentaProps) {
  return (
    <Hoja titulo={props.titulo} subtitulo={props.subtitulo} onCerrar={props.onCerrar}>
      <ul className="flex flex-col gap-2">
        {props.cuentas.map((c) => (
          <li key={c.id}>
            <button type="button" disabled={props.ocupado} onClick={() => props.onElegir(c.id)}
              className="flex w-full items-center gap-3 rounded-card bg-surface p-3.5 text-left shadow-card transition hover:ring-2 hover:ring-primary/30 disabled:opacity-50">
              <span className="grid h-10 w-10 flex-none place-items-center rounded-tile bg-primary-soft text-primary">
                <AppIcon name={c.icono} size={20} />
              </span>
              <span className="flex-1 truncate text-[15px] font-extrabold">{c.nombre}</span>
              <span className="tabular text-[13px] font-bold text-muted-soft">{formatCurrency(c.saldo)}</span>
            </button>
          </li>
        ))}
      </ul>
      <Button variant="ghost" fullWidth onClick={props.onCerrar}>Cancelar</Button>
    </Hoja>
  );
}
