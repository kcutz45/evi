/**
 * HojaAbonar.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Abonar a una meta (o retirar de ella): cuánto y de qué
 *            cuenta sale (o a cuál vuelve).
 *
 * POR QUÉ EXISTE: Ahorrar es apartar dinero real: el abono baja el
 *            saldo de la cuenta y sube lo ahorrado (§12 de schema.sql).
 *            Los atajos Q50/Q100/Q200 hacen el abono de un toque.
 * ---------------------------------------------------------------
 */
'use client';

import { useState } from 'react';
import { FormAlert } from '@/components/auth/AuthHeading';
import { SelectorDeCuenta } from '@/components/finance/cuentas/SelectorDeCuenta';
import { Button } from '@/components/ui/Button';
import { CampoMonto } from '@/components/ui/CampoMonto';
import { Hoja } from '@/components/ui/Hoja';
import { formatCurrency, leerMonto } from '@/lib/formatCurrency';
import { faltante } from '@/lib/metas';
import type { Cuenta } from '@/types/account';
import type { Abono, Meta } from '@/types/goal';

const ATAJOS = [50, 100, 200];

interface HojaAbonarProps {
  meta: Meta;
  esRetiro: boolean;
  cuentas: Cuenta[];
  cuentaPorDefecto: string | null;
  guardando: boolean;
  error: string | null;
  onGuardar: (abono: Abono) => Promise<boolean>;
  onCerrar: () => void;
}

export function HojaAbonar(props: HojaAbonarProps) {
  const { meta, esRetiro, cuentas } = props;
  const [cuentaId, setCuentaId] = useState<string | null>(props.cuentaPorDefecto);
  const [texto, setTexto] = useState('');
  const monto = leerMonto(texto);

  const guardar = async () => {
    if (!monto || monto <= 0) return;
    if (await props.onGuardar({ metaId: meta.id, cuentaId, monto: esRetiro ? -monto : monto })) props.onCerrar();
  };

  return (
    <Hoja titulo={esRetiro ? `Retirar de ${meta.nombre}` : `Abonar a ${meta.nombre}`} onCerrar={props.onCerrar}
      subtitulo={esRetiro ? `Llevás ${formatCurrency(meta.ahorrado)} ahorrados.` : `Te faltan ${formatCurrency(faltante(meta))}.`}>
      {!esRetiro && (
        <div className="flex gap-2">
          {ATAJOS.map((a) => (
            <button key={a} type="button" onClick={() => setTexto(String(a))}
              className="flex-1 rounded-full bg-white py-2 text-sm font-black text-primary shadow-card active:scale-95">Q{a}</button>
          ))}
        </div>
      )}
      <CampoMonto etiqueta="¿Cuánto?" valor={texto} onCambiar={setTexto} />
      {cuentas.length > 0 && (
        <SelectorDeCuenta titulo={esRetiro ? '¿A qué cuenta vuelve?' : '¿De qué cuenta sale?'} cuentas={cuentas}
          elegida={cuentaId} onElegir={setCuentaId} />
      )}
      <FormAlert message={texto && monto === null ? 'Escribí un monto válido, por ejemplo 150' : props.error} />
      <Button variant="mint" size="lg" fullWidth disabled={props.guardando || !monto || monto <= 0} onClick={guardar}>
        {props.guardando ? 'Guardando…' : esRetiro ? 'Retirar' : 'Abonar'}
      </Button>
    </Hoja>
  );
}
