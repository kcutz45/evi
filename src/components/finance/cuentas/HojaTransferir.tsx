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
import { Button } from '@/components/ui/Button';
import { CampoMonto } from '@/components/ui/CampoMonto';
import { Hoja } from '@/components/ui/Hoja';
import { leerMonto } from '@/lib/formatCurrency';
import type { Cuenta, Transferencia } from '@/types/account';
import { SelectorDeCuenta } from './SelectorDeCuenta';

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
    <Hoja titulo="Transferir" subtitulo="Mové dinero entre tus cuentas. No es gasto ni ingreso." onCerrar={onCerrar} onEnviar={enviar}>
      <SelectorDeCuenta titulo="Sale de" cuentas={cuentas} elegida={desde} onElegir={setDesde} />
      <ArrowDown size={20} className="self-center text-primary" aria-hidden />
      <SelectorDeCuenta titulo="Llega a" cuentas={cuentas} elegida={hacia} onElegir={setHacia} />
      <CampoMonto etiqueta="¿Cuánto?" valor={texto} onCambiar={setTexto} />
      <FormAlert message={desde === hacia ? 'Elegí dos cuentas distintas' : error} />
      <Button type="submit" variant="mint" size="lg" fullWidth disabled={guardando || monto === null || monto <= 0 || desde === hacia}>
        {guardando ? 'Transfiriendo…' : 'Transferir'}
      </Button>
    </Hoja>
  );
}
