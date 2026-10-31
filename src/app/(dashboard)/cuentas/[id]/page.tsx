/**
 * cuentas/[id]/page.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Una cuenta por dentro: su saldo, lo que entró y salió, el
 *            historial de movimientos. La tuerquita de la tarjeta abre
 *            "Opciones de la cuenta" (corregir saldo y quitar).
 *
 * POR QUÉ EXISTE: Pedido del 31/10/2026: ver el historial de cada cuenta
 *            y que el saldo no se cambie por error (antes se ajustaba con
 *            solo tocar la cuenta). Esta página solo CONECTA (§2.1).
 *
 * DEPENDE DE: hooks/useAccounts.ts, hooks/useHistorialCuenta.ts,
 *            components/finance/cuentas/*
 * ---------------------------------------------------------------
 */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { FormAlert } from '@/components/auth/AuthHeading';
import { HistorialCuenta } from '@/components/finance/cuentas/HistorialCuenta';
import { HojaAjustarSaldo } from '@/components/finance/cuentas/HojaAjustarSaldo';
import { EncabezadoCuenta } from '@/components/finance/cuentas/ListaCuentas';
import { HojaOpcionesCuenta } from '@/components/finance/cuentas/HojaOpcionesCuenta';
import { PageContainer } from '@/components/layout/PageContainer';
import { useAccounts } from '@/hooks/useAccounts';
import { useHistorialCuenta } from '@/hooks/useHistorialCuenta';
import { RUTA_CUENTAS } from '@/lib/routes';

export default function CuentaPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const c = useAccounts();
  const cuenta = c.data.find((x) => x.id === id) ?? null;
  const historial = useHistorialCuenta(cuenta, c.data);
  const [hoja, setHoja] = useState<'opciones' | 'corregir' | null>(null);

  const quitar = async () => {
    if (cuenta && (await c.quitar(cuenta.id))) router.push(RUTA_CUENTAS);
  };
  const cerrarHoja = () => {
    setHoja(null);
    c.limpiarError();
  };

  return (
    <PageContainer>
      <Link href={RUTA_CUENTAS} className="mb-4 mt-4 inline-flex items-center gap-1.5 text-sm font-extrabold text-primary">
        <ArrowLeft size={17} aria-hidden /> Mis cuentas
      </Link>
      {c.isLoading && <div aria-busy className="h-44 animate-pulse rounded-card bg-primary/20" />}
      {!c.isLoading && !cuenta && <FormAlert message={c.error ?? 'No encontramos esta cuenta.'} />}
      {cuenta && (
        <div className="flex flex-col gap-4">
          <EncabezadoCuenta cuenta={cuenta} entro={historial.totales.entro} salio={historial.totales.salio}
            onOpciones={() => setHoja('opciones')} />
          <h2 className="text-lg font-black tracking-tight">Movimientos</h2>
          <FormAlert message={historial.error ?? (hoja ? null : c.error)} />
          <HistorialCuenta grupos={historial.grupos} cargando={historial.isLoading} saldoInicial={cuenta.saldoInicial} />
        </div>
      )}
      {cuenta && hoja === 'opciones' && (
        <HojaOpcionesCuenta nombre={cuenta.nombre} ocupado={c.guardando} onCorregir={() => setHoja('corregir')}
          onQuitar={quitar} onCerrar={cerrarHoja} />
      )}
      {cuenta && hoja === 'corregir' && (
        <HojaAjustarSaldo cuenta={cuenta} guardando={c.guardando} error={c.error} onAjustar={c.ajustar} onCerrar={cerrarHoja} />
      )}
    </PageContainer>
  );
}
