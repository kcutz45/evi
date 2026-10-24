/**
 * demo/DemoTeDeben.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: La pantalla "Te deben" con datos de ejemplo (sin Supabase).
 *
 * TEMPORAL:  Se borra junto con app/demo antes de la beta. Usa los
 *            mismos componentes y funciones puras que la pantalla real.
 * ---------------------------------------------------------------
 */
'use client';

import { useState } from 'react';
import { ListaCobradas, TarjetaPersona } from '@/components/finance/porCobrar/DeudasList';
import { agruparPendientesPorPersona, cobradas } from '@/lib/porCobrar';
import type { PorCobrar } from '@/types/receivable';
import { demoPorCobrar } from './mockData';

export function DemoTeDeben() {
  const [deudas, setDeudas] = useState(demoPorCobrar);
  const alternar = (d: PorCobrar) =>
    setDeudas((actual) => actual.map((x) => (x.id === d.id ? { ...x, cobrado: !x.cobrado } : x)));
  const acciones = { ocupadoId: null, onAlternar: alternar };

  return (
    <div className="flex flex-col gap-3">
      {agruparPendientesPorPersona(deudas).map((p) => <TarjetaPersona key={p.clave} persona={p} {...acciones} />)}
      <ListaCobradas deudas={cobradas(deudas)} {...acciones} />
    </div>
  );
}
