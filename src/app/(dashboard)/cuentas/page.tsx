/**
 * cuentas/page.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: "Mis cuentas": cuánto tenés en total y en cada cuenta
 *            (Efectivo, bancos, billeteras), crear cuentas, transferir
 *            entre ellas y ajustar saldos.
 *
 * POR QUÉ EXISTE: Propuesta aprobada el 24/10/2026 (EVI_SPEC.md §0).
 *            Es el segundo número de EVI: el balance dice cómo te fue
 *            en el mes; esto, cuánto tenés y dónde. Esta página solo
 *            CONECTA el hook con los componentes (§2.1).
 *
 * DEPENDE DE: hooks/useAccounts.ts, components/finance/cuentas/*
 * ---------------------------------------------------------------
 */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowLeftRight, Plus } from 'lucide-react';
import { FormAlert } from '@/components/auth/AuthHeading';
import { HojaNuevaCuenta } from '@/components/finance/cuentas/HojaNuevaCuenta';
import { HojaTransferir } from '@/components/finance/cuentas/HojaTransferir';
import { ListaCuentas, TotalCuentas } from '@/components/finance/cuentas/ListaCuentas';
import { Header } from '@/components/layout/Header';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { useAccounts } from '@/hooks/useAccounts';
import { RUTA_INICIO } from '@/lib/routes';

type HojaAbierta = { tipo: 'nueva' } | { tipo: 'transferir' } | null;

export default function CuentasPage() {
  const c = useAccounts();
  const [hoja, setHoja] = useState<HojaAbierta>(null);
  const cerrar = () => {
    setHoja(null);
    c.limpiarError();
  };
  const comun = { guardando: c.guardando, error: c.error, onCerrar: cerrar };

  return (
    <PageContainer>
      <Link href={RUTA_INICIO} className="mt-4 inline-flex items-center gap-1.5 text-sm font-extrabold text-primary">
        <ArrowLeft size={17} aria-hidden /> Inicio
      </Link>
      <Header title="Mis cuentas" subtitle="Dónde tenés tu dinero. Tocá una cuenta para ver su historial." />
      <div className="flex flex-col gap-4">
        <FormAlert message={c.error && !hoja ? c.error : null} />
        {c.isLoading ? <div aria-busy className="h-32 animate-pulse rounded-card bg-primary/20" /> : (
          <TotalCuentas total={c.total} cuentas={c.data.length} />
        )}
        <div className="grid grid-cols-2 gap-2.5">
          <Button variant="soft" icon={<Plus size={18} strokeWidth={2.6} />} onClick={() => setHoja({ tipo: 'nueva' })}>
            Nueva cuenta
          </Button>
          <Button variant="soft" icon={<ArrowLeftRight size={18} strokeWidth={2.4} />} disabled={c.data.length < 2}
            onClick={() => setHoja({ tipo: 'transferir' })}>
            Transferir
          </Button>
        </div>
        <ListaCuentas cuentas={c.data} />
      </div>
      {hoja?.tipo === 'nueva' && <HojaNuevaCuenta {...comun} onCrear={c.crear} />}
      {hoja?.tipo === 'transferir' && <HojaTransferir {...comun} cuentas={c.data} onTransferir={c.transferir} />}
    </PageContainer>
  );
}
