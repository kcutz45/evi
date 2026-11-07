/**
 * HojaAjustarSaldo.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: "Corregir saldo" en dos pasos: 1) escribir cuánto hay de
 *            verdad; 2) revisar la diferencia y confirmar.
 *
 * POR QUÉ EXISTE: El efectivo se gasta sin registrar (una tortrix, un
 *            bus) y a veces hay que corregir. Pero cambiar un saldo por
 *            error confunde todo, por eso vive en "Opciones de la cuenta"
 *            y pide confirmar viendo de cuánto a cuánto cambia. Corregir
 *            no crea un gasto ni un ingreso.
 * ---------------------------------------------------------------
 */
'use client';

import { useState } from 'react';
import { ArrowDown, TriangleAlert } from 'lucide-react';
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
  onCerrar: () => void;
}

export function HojaAjustarSaldo({ cuenta, guardando, error, onAjustar, onCerrar }: HojaAjustarSaldoProps) {
  const [texto, setTexto] = useState('');
  const [revisando, setRevisando] = useState(false);
  const monto = leerMonto(texto);
  const cambia = monto !== null && monto !== cuenta.saldo;

  const confirmar = async () => {
    if (monto !== null && (await onAjustar(cuenta, monto))) onCerrar();
  };

  if (revisando && monto !== null) {
    return (
      <Hoja titulo="¿Confirmás el cambio?" subtitulo={cuenta.nombre} onCerrar={onCerrar} onEnviar={confirmar}>
        <Comparacion antes={cuenta.saldo} despues={monto} />
        <FormAlert message={error} />
        <Button type="submit" variant="mint" size="lg" fullWidth disabled={guardando}>
          {guardando ? 'Guardando…' : 'Sí, corregir el saldo'}
        </Button>
        <Button variant="ghost" fullWidth disabled={guardando} onClick={() => setRevisando(false)}>Volver</Button>
      </Hoja>
    );
  }

  return (
    <Hoja titulo="Corregir saldo" subtitulo={`EVI calcula que en ${cuenta.nombre} tenés ${formatCurrency(cuenta.saldo)}.`} onCerrar={onCerrar}
      onEnviar={() => setRevisando(true)}>
      <p className="flex items-start gap-2 rounded-tile bg-gold/25 px-3 py-2.5 text-[12.5px] font-bold text-gold-ink">
        <TriangleAlert size={16} className="mt-px flex-none text-gold-dark" aria-hidden />
        Usalo solo si el saldo no coincide con lo que tenés de verdad. Si fue un gasto, mejor registralo.
      </p>
      <CampoMonto etiqueta="¿Cuánto tenés hoy de verdad?" valor={texto} onCambiar={setTexto} autoFocus />
      <FormAlert message={texto && monto === null ? 'Escribí un monto válido, por ejemplo 1250.50' : null} />
      <Button type="submit" size="lg" fullWidth disabled={!cambia}>Revisar el cambio</Button>
    </Hoja>
  );
}

function Comparacion({ antes, despues }: { antes: number; despues: number }) {
  const diferencia = despues - antes;
  return (
    <div className="flex flex-col items-center gap-1 rounded-card bg-surface p-4 text-center shadow-card">
      <span className="text-xs font-bold text-muted-soft">Ahora</span>
      <span className="tabular text-xl font-black text-muted line-through decoration-2">{formatCurrency(antes)}</span>
      <ArrowDown size={18} className="text-primary" aria-hidden />
      <span className="tabular text-3xl font-black tracking-tight">{formatCurrency(despues)}</span>
      <span className="tabular mt-1 rounded-full bg-primary-soft px-3 py-1 text-xs font-black text-primary">
        {diferencia > 0 ? '+' : '−'}{formatCurrency(Math.abs(diferencia))} · no es gasto ni ingreso
      </span>
    </div>
  );
}
