/**
 * reportes/page.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Reporte mensual: total gastado y comparación con el mes
 *            anterior, dona por categoría, desglose y "Tu resumen".
 *
 * POR QUÉ EXISTE: Es parte del alcance congelado (§0). Responde "¿en qué
 *            se me va el dinero?". Solo cuenta gastos CONFIRMADOS (§4d):
 *            lo de un evento activo aparece cuando se cierra. Esta
 *            página solo CONECTA el hook con los componentes (§2.1).
 *
 * DEPENDE DE: hooks/useMonthlyReport.ts, components/report/*
 * ---------------------------------------------------------------
 */
'use client';

import { FormAlert } from '@/components/auth/AuthHeading';
import { SelectorDeMes } from '@/components/finance/dinero/MonthHeader';
import { MonthlyChart } from '@/components/finance/MonthlyChart';
import { Header } from '@/components/layout/Header';
import { PageContainer } from '@/components/layout/PageContainer';
import { DesgloseCategorias } from '@/components/report/DesgloseCategorias';
import { ResumenDelMes } from '@/components/report/ResumenDelMes';
import { TotalGastado } from '@/components/report/TotalGastado';
import { useMonthlyReport } from '@/hooks/useMonthlyReport';
import { etiquetaDeMes, nombreDelMes } from '@/lib/dates';

export default function ReportesPage() {
  const r = useMonthlyReport();
  const cargando = r.isLoading && !r.error;

  return (
    <PageContainer>
      <Header title="Reporte" subtitle="En qué se te fue el dinero este mes." />
      <div className="flex flex-col gap-4">
        <SelectorDeMes etiqueta={etiquetaDeMes(r.mes)} puedeAvanzar={r.puedeAvanzar}
          onAnterior={() => r.cambiarMes(-1)} onSiguiente={() => r.cambiarMes(1)} />
        <FormAlert message={r.error} />
        {cargando && (
          <>
            <div aria-busy className="h-32 animate-pulse rounded-card bg-white/70" />
            <div aria-busy className="h-44 animate-pulse rounded-card bg-white/70" />
          </>
        )}
        {!cargando && !r.error && (
          <>
            <TotalGastado total={r.total} comparacion={r.comparacion} nombreMesAnterior={nombreDelMes(r.mesAnterior)} />
            <MonthlyChart slices={r.slices} />
            <DesgloseCategorias slices={r.slices} />
            {r.mayor && (
              <ResumenDelMes mayor={r.mayor} total={r.total} promedioDiario={r.promedioMayor} desdeEventos={r.desdeEventos} />
            )}
          </>
        )}
      </div>
    </PageContainer>
  );
}
