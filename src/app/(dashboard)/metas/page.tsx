/**
 * metas/page.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: "Mis metas": cuánto llevás ahorrado, la meta principal con
 *            su anillo de avance, las demás metas y el mensaje de ánimo.
 *            Abonar o retirar pide de qué cuenta sale (o a cuál vuelve).
 *
 * POR QUÉ EXISTE: Metas de ahorro está en el alcance congelado (§0) y,
 *            desde v1.8, conectada a las cuentas: ahorrar aparta dinero
 *            real. Esta página solo CONECTA hooks y componentes (§2.1).
 *
 * DEPENDE DE: hooks/useGoals.ts, hooks/useAccounts.ts, components/metas/*
 * ---------------------------------------------------------------
 */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, PiggyBank, Plus } from 'lucide-react';
import { FormAlert } from '@/components/auth/AuthHeading';
import { AddMovementButton } from '@/components/finance/AddMovementButton';
import { Header } from '@/components/layout/Header';
import { PageContainer } from '@/components/layout/PageContainer';
import { HojaAbonar } from '@/components/metas/HojaAbonar';
import { HojaNuevaMeta } from '@/components/metas/HojaNuevaMeta';
import { MetaDestacada, TarjetaMeta } from '@/components/metas/TarjetasMeta';
import { Button } from '@/components/ui/Button';
import { useAccounts } from '@/hooks/useAccounts';
import { useGoals } from '@/hooks/useGoals';
import { formatCurrency } from '@/lib/formatCurrency';
import { mensajeDeAnimo } from '@/lib/metas';
import { RUTA_INICIO } from '@/lib/routes';
import type { Meta } from '@/types/goal';

type HojaAbierta = { tipo: 'nueva' } | { tipo: 'abono'; meta: Meta; esRetiro: boolean } | null;

export default function MetasPage() {
  const metas = useGoals();
  const cuentas = useAccounts();
  const [hoja, setHoja] = useState<HojaAbierta>(null);
  const [principal, ...resto] = metas.data;
  const acciones = {
    onAbonar: (meta: Meta) => setHoja({ tipo: 'abono', meta, esRetiro: false }),
    onRetirar: (meta: Meta) => setHoja({ tipo: 'abono', meta, esRetiro: true }),
  };
  const cerrar = () => {
    setHoja(null);
    metas.limpiarError();
    cuentas.recargar();
  };
  const vacio = !metas.isLoading && !metas.error && !principal;

  return (
    <PageContainer floatingAction={vacio ? undefined : <AddMovementButton label="Crear meta" onClick={() => setHoja({ tipo: 'nueva' })} />}>
      <Link href={RUTA_INICIO} className="mt-4 inline-flex items-center gap-1.5 text-sm font-extrabold text-primary">
        <ArrowLeft size={17} aria-hidden /> Inicio
      </Link>
      <Header title="Mis metas" subtitle={principal ? `Llevás ${formatCurrency(metas.totalAhorrado)} ahorrados en total` : 'Todavía no tenés metas'} />
      <div className="flex flex-col gap-3">
        <FormAlert message={hoja ? null : metas.error} />
        {metas.isLoading && <div aria-busy className="h-44 animate-pulse rounded-card bg-primary/20" />}
        {vacio && <MetasVacias onCrear={() => setHoja({ tipo: 'nueva' })} />}
        {principal && <MetaDestacada meta={principal} {...acciones} />}
        {resto.length > 0 && <ul className="flex flex-col gap-2.5">{resto.map((m) => <TarjetaMeta key={m.id} meta={m} {...acciones} />)}</ul>}
        {principal && <p className="rounded-card bg-gold/25 px-4 py-3 text-[13px] font-bold text-gold-ink">{mensajeDeAnimo(metas.data)}</p>}
      </div>
      {hoja?.tipo === 'nueva' && <HojaNuevaMeta guardando={metas.guardando} error={metas.error} onCrear={metas.crear} onCerrar={cerrar} />}
      {hoja?.tipo === 'abono' && (
        <HojaAbonar meta={hoja.meta} esRetiro={hoja.esRetiro} cuentas={cuentas.data} cuentaPorDefecto={cuentas.cuentaPorDefecto}
          guardando={metas.guardando} error={metas.error} onGuardar={metas.abonar} onCerrar={cerrar} />
      )}
    </PageContainer>
  );
}

function MetasVacias({ onCrear }: { onCrear: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 px-2 pt-12 text-center">
      <div className="grid h-[108px] w-[108px] place-items-center rounded-[40px] bg-primary/15 text-primary">
        <PiggyBank size={52} strokeWidth={1.5} aria-hidden />
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="text-[21px] font-black leading-tight tracking-tight">Aquí van tus sueños</h2>
        <p className="px-3 text-sm font-semibold leading-relaxed text-muted">
          Poné un nombre y un monto, y EVI te va llevando la cuenta. Se vale empezar con poquito.
        </p>
      </div>
      <Button size="lg" icon={<Plus size={20} strokeWidth={2.6} />} onClick={onCrear}>Crear mi primera meta</Button>
    </div>
  );
}
