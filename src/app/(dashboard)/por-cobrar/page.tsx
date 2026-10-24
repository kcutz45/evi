/**
 * por-cobrar/page.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: "Te deben": quién te debe cuánto, por qué cuenta, y el
 *            botón para marcar cada deuda como cobrada.
 *
 * POR QUÉ EXISTE: Es el otro lado de "Dividir cuenta" (EVI_SPEC §0,
 *            aprobado 24/10/2026). Cobrar NO es un ingreso: solo baja
 *            lo que te deben; tu balance ya contaba solo tu parte.
 *
 * DEPENDE DE: hooks/useReceivables.ts, lib/porCobrar.ts
 * ---------------------------------------------------------------
 */
'use client';

import Link from 'next/link';
import { ArrowLeft, HandCoins } from 'lucide-react';
import { FormAlert } from '@/components/auth/AuthHeading';
import { ListaCobradas, TarjetaPersona } from '@/components/finance/porCobrar/DeudasList';
import { Header } from '@/components/layout/Header';
import { PageContainer } from '@/components/layout/PageContainer';
import { useReceivables } from '@/hooks/useReceivables';
import { RUTA_INICIO } from '@/lib/routes';
import { agruparPendientesPorPersona, cobradas } from '@/lib/porCobrar';

const FILAS_DE_CARGA = 2;

export default function PorCobrarPage() {
  const deudas = useReceivables();
  const personas = agruparPendientesPorPersona(deudas.data);
  const acciones = { ocupadoId: deudas.ocupadoId, onAlternar: deudas.alternarCobro };

  return (
    <PageContainer>
      <Link href={RUTA_INICIO} className="mt-4 inline-flex items-center gap-1.5 text-sm font-extrabold text-primary">
        <ArrowLeft size={17} aria-hidden /> Inicio
      </Link>
      <Header title="Te deben" subtitle="Lo que pagaste por otros. Tocá Cobrar cuando te devuelvan." />
      <div className="flex flex-col gap-3">
        <FormAlert message={deudas.error ?? deudas.errorAccion} />
        {deudas.isLoading && Array.from({ length: FILAS_DE_CARGA }, (_, i) => (
          <div key={i} aria-busy className="h-32 animate-pulse rounded-card bg-white/70" />
        ))}
        {!deudas.isLoading && personas.length === 0 && <SinDeudas />}
        {personas.map((p) => <TarjetaPersona key={p.clave} persona={p} {...acciones} />)}
        <ListaCobradas deudas={cobradas(deudas.data)} {...acciones} />
      </div>
    </PageContainer>
  );
}

function SinDeudas() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card bg-white px-6 py-10 text-center shadow-card">
      <HandCoins size={38} strokeWidth={1.6} className="text-gold-dark" aria-hidden />
      <p className="text-sm font-bold leading-relaxed text-muted">
        Nadie te debe nada. Cuando pagués una cuenta de varios, tocá <strong>«Dividir esta cuenta»</strong> al
        registrar el gasto y anotá quién te debe.
      </p>
    </div>
  );
}
