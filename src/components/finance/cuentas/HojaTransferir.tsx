/**
 * HojaTransferir.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: "Transferir": mover dinero entre tus cuentas (ej. sacar
 *            del cajero: Banco → Efectivo).
 *
 * POR QUÉ EXISTE: Una transferencia no es gasto ni ingreso: tu dinero
 *            total no cambia, solo de dónde está. Sin esto, la gente
 *            registraría un "gasto" falso al sacar del cajero.
 * ---------------------------------------------------------------
 */
'use client';

import { useState } from 'react';
import { ArrowDown } from 'lucide-react';
import { FormAlert } from '@/components/auth/AuthHeading';
import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { CampoMonto } from '@/components/ui/CampoMonto';
import { Hoja } from '@/components/ui/Hoja';
import { cn } from '@/lib/cn';
import { leerMonto } from '@/lib/formatCurrency';
import type { Cuenta, Transferencia } from '@/types/account';

interface HojaTransferirProps {
  cuentas: Cuenta[];
  guardando: boolean;
  error: string | null;
  onTransferir: (datos: Transferencia) => Promise<boolean>;
  onCerrar: () => void;
}

export function HojaTransferir({ cuentas, guardando, error, onTransferir, onCerrar }: HojaTransferirProps) {
  const [desde, setDesde] = useState(cuentas.find((c) => c.tipo === 'banco')?.id ?? cuentas[0]?.id ?? '');
  const [hacia, setHacia] = useState(cuentas.find((c) => c.id !== desde)?.id ?? '');
  const [texto, setTexto] = useState('');
  const monto = leerMonto(texto);

  const enviar = async () => {
    if (monto !== null && (await onTransferir({ desde, hacia, monto }))) onCerrar();
  };

  return (
    <Hoja titulo="Transferir" subtitulo="Mové dinero entre tus cuentas. No es gasto ni ingreso." onCerrar={onCerrar}>
      <Selector titulo="Sale de" cuentas={cuentas} elegida={desde} onElegir={setDesde} />
      <ArrowDown size={20} className="self-center text-primary" aria-hidden />
      <Selector titulo="Llega a" cuentas={cuentas} elegida={hacia} onElegir={setHacia} />
      <CampoMonto etiqueta="¿Cuánto?" valor={texto} onCambiar={setTexto} />
      <FormAlert message={desde === hacia ? 'Elegí dos cuentas distintas' : error} />
      <Button variant="mint" size="lg" fullWidth disabled={guardando || monto === null || monto <= 0 || desde === hacia}
        onClick={enviar}>
        {guardando ? 'Transfiriendo…' : 'Transferir'}
      </Button>
    </Hoja>
  );
}

interface SelectorProps {
  titulo: string;
  cuentas: Cuenta[];
  elegida: string;
  onElegir: (id: string) => void;
}

function Selector({ titulo, cuentas, elegida, onElegir }: SelectorProps) {
  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="mb-1.5 text-sm font-bold text-muted">{titulo}</legend>
      <div className="flex flex-wrap gap-2">
        {cuentas.map((c) => (
          <button key={c.id} type="button" aria-pressed={elegida === c.id} onClick={() => onElegir(c.id)}
            className={cn('flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-extrabold transition',
              elegida === c.id ? 'bg-primary text-white shadow-glow-primary' : 'bg-white text-dark shadow-card')}>
            <AppIcon name={c.icono} size={15} /> {c.nombre}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
