/**
 * DemoMetas.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: "Mis metas" con datos simulados: meta principal, las
 *            demás, el mensaje de ánimo y las hojas de abonar y crear.
 *
 * TEMPORAL:  Para revisar el diseño sin sesión. Se borra con /demo.
 * ---------------------------------------------------------------
 */
'use client';

import { useState } from 'react';
import { HojaAbonar } from '@/components/metas/HojaAbonar';
import { HojaNuevaMeta } from '@/components/metas/HojaNuevaMeta';
import { MetaDestacada, TarjetaMeta } from '@/components/metas/TarjetasMeta';
import { Button } from '@/components/ui/Button';
import { mensajeDeAnimo } from '@/lib/metas';
import type { Meta } from '@/types/goal';
import { demoCuentas } from './mockData';

const META = (id: string, nombre: string, icono: string, objetivo: number, ahorrado: number): Meta =>
  ({ id, nombre, icono, objetivo, ahorrado, fechaLimite: null, estado: ahorrado >= objetivo ? 'completada' : 'activa' });

const METAS = [
  META('1', 'Viaje a la playa', 'tree-palm', 2000, 650),
  META('2', 'Laptop nueva', 'laptop', 6500, 2900),
  META('3', 'Curso de inglés', 'graduation-cap', 1200, 1050),
];

const ok = async () => true;

export function DemoMetas() {
  const [abono, setAbono] = useState<{ meta: Meta; esRetiro: boolean } | null>(null);
  const [nueva, setNueva] = useState(false);
  const acciones = { onAbonar: (meta: Meta) => setAbono({ meta, esRetiro: false }), onRetirar: (meta: Meta) => setAbono({ meta, esRetiro: true }) };
  const [principal, ...resto] = METAS;
  return (
    <>
      {principal && <MetaDestacada meta={principal} {...acciones} />}
      <ul className="flex flex-col gap-2.5">{resto.map((m) => <TarjetaMeta key={m.id} meta={m} {...acciones} />)}</ul>
      <p className="rounded-card bg-gold/25 px-4 py-3 text-[13px] font-bold text-gold-ink">{mensajeDeAnimo(METAS)}</p>
      <Button variant="soft" fullWidth onClick={() => setNueva(true)}>Probar nueva meta</Button>
      {abono && (
        <HojaAbonar {...abono} cuentas={demoCuentas} cuentaPorDefecto={demoCuentas[0]?.id ?? null} guardando={false}
          error={null} onGuardar={ok} onCerrar={() => setAbono(null)} />
      )}
      {nueva && <HojaNuevaMeta guardando={false} error={null} onCrear={ok} onCerrar={() => setNueva(false)} />}
    </>
  );
}
