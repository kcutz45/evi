/**
 * DemoCuentas.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: "Mis cuentas" con datos simulados: total, lista y las
 *            hojas de nueva cuenta, transferir y ajustar saldo.
 *
 * TEMPORAL:  Para revisar el diseño sin sesión. Se borra con /demo.
 * ---------------------------------------------------------------
 */
'use client';

import { useState } from 'react';
import { HojaAjustarSaldo } from '@/components/finance/cuentas/HojaAjustarSaldo';
import { HojaNuevaCuenta } from '@/components/finance/cuentas/HojaNuevaCuenta';
import { HojaTransferir } from '@/components/finance/cuentas/HojaTransferir';
import { ListaCuentas, TotalCuentas } from '@/components/finance/cuentas/ListaCuentas';
import { Button } from '@/components/ui/Button';
import { demoCuentas } from './mockData';

const ok = async () => true;

export function DemoCuentas() {
  const [hoja, setHoja] = useState<'nueva' | 'transferir' | 'corregir' | null>(null);
  const comun = { guardando: false, error: null, onCerrar: () => setHoja(null) };
  return (
    <>
      <TotalCuentas total={demoCuentas.reduce((s, c) => s + c.saldo, 0)} cuentas={demoCuentas.length} />
      <div className="grid grid-cols-2 gap-2.5">
        <Button variant="soft" onClick={() => setHoja('nueva')}>Nueva cuenta</Button>
        <Button variant="soft" onClick={() => setHoja('transferir')}>Transferir</Button>
      </div>
      <ListaCuentas cuentas={demoCuentas} />
      <Button variant="ghost" onClick={() => setHoja('corregir')}>Probar corregir saldo</Button>
      {hoja === 'nueva' && <HojaNuevaCuenta {...comun} onCrear={ok} />}
      {hoja === 'transferir' && <HojaTransferir {...comun} cuentas={demoCuentas} onTransferir={ok} />}
      {hoja === 'corregir' && demoCuentas[0] && <HojaAjustarSaldo {...comun} cuenta={demoCuentas[0]} onAjustar={ok} />}
    </>
  );
}
