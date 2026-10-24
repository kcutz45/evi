/**
 * HojaAjustarSaldo.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Al tocar una cuenta: "¿Cuánto tenés hoy en Efectivo?" para
 *            corregir el saldo, y la opción de quitar la cuenta.
 *
 * POR QUÉ EXISTE: El efectivo se gasta sin registrar (una tortrix, un
 *            bus). Ajustar deja el saldo igual a la realidad sin
 *            inventar un gasto. Quitar archiva: los movimientos viejos
 *            conservan su cuenta.
 * ---------------------------------------------------------------
 */
'use client';

import { useState } from 'react';
import { FormAlert } from '@/components/auth/AuthHeading';
import { Button } from '@/components/ui/Button';
import { CampoMonto } from '@/components/ui/CampoMonto';
import { Hoja } from '@/components/ui/Hoja';
import { formatCurrency, leerMonto } from '@/lib/formatCurrency';
import type { Cuenta } from '@/types/account';

interface HojaAjustarSaldoProps {
  cuenta: Cuenta;
  guardando: boolean;
  error: string | null;
  onAjustar: (cuenta: Cuenta, saldoReal: number) => Promise<boolean>;
  onQuitar: (id: string) => Promise<boolean>;
  onCerrar: () => void;
}

export function HojaAjustarSaldo({ cuenta, guardando, error, onAjustar, onQuitar, onCerrar }: HojaAjustarSaldoProps) {
  const [texto, setTexto] = useState(cuenta.saldo.toFixed(2));
  const [confirmarQuitar, setConfirmarQuitar] = useState(false);
  const monto = leerMonto(texto);

  const ajustar = async () => {
    if (monto !== null && (await onAjustar(cuenta, monto))) onCerrar();
  };
  const quitar = async () => {
    if (await onQuitar(cuenta.id)) onCerrar();
  };

  return (
    <Hoja titulo={cuenta.nombre} subtitulo={`EVI calcula que tenés ${formatCurrency(cuenta.saldo)}.`} onCerrar={onCerrar}>
      <CampoMonto etiqueta="¿Cuánto tenés hoy de verdad?" valor={texto} onCambiar={setTexto} autoFocus />
      <p className="text-xs font-bold text-muted-soft">Ajustar no crea un gasto ni un ingreso: solo corrige el saldo.</p>
      <FormAlert message={monto === null ? 'Escribí un monto válido, por ejemplo 1250.50' : error} />
      <Button variant="mint" size="lg" fullWidth disabled={guardando || monto === null} onClick={ajustar}>
        {guardando ? 'Guardando…' : 'Guardar saldo'}
      </Button>
      {confirmarQuitar ? (
        <Button variant="soft" fullWidth disabled={guardando} onClick={quitar}>Sí, quitar {cuenta.nombre}</Button>
      ) : (
        <Button variant="ghost" fullWidth onClick={() => setConfirmarQuitar(true)}>Quitar esta cuenta</Button>
      )}
    </Hoja>
  );
}
