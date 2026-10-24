/**
 * useMonthlyReport.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Datos del reporte mensual: mes elegido, total gastado,
 *            porciones por categoría, comparación con el mes anterior,
 *            promedio diario y cuánto vino de eventos cerrados.
 *
 * POR QUÉ EXISTE: Frontera entre la pantalla Reportes y los servicios
 *            (§2.1). Los cálculos viven en lib/report.ts. Registra
 *            monthly_report_viewed una vez por mes visto (§4.3).
 *
 * DEPENDE DE: services/reportService.ts, services/movementService.ts,
 *            services/telemetryService.ts, lib/report.ts
 * USADO EN:   app/(dashboard)/reportes/page.tsx
 * ---------------------------------------------------------------
 */
'use client';

import { useEffect, useRef, useState } from 'react';
import { hoyGT, inicioDeMesGT, moverMes } from '@/lib/dates';
import { buildCategorySlices, compararConAnterior, promedioDiario, totalesPorCategoria } from '@/lib/report';
import { supabase } from '@/lib/supabase';
import { obtenerResumenDelMes } from '@/services/movementService';
import { listarGastosConfirmados } from '@/services/reportService';
import { track } from '@/services/telemetryService';
import { useAsyncData } from './useAsyncData';

// mes: a qué mes pertenecen los datos. Al cambiar de mes, por un render
// todavía están los del anterior; así no se pintan ni se registran mal.
const SIN_DATOS = { mes: '', gastos: [] as Awaited<ReturnType<typeof listarGastosConfirmados>>, anterior: 0 };

async function cargarReporte(mes: string) {
  const [gastos, resumenAnterior] = await Promise.all([
    listarGastosConfirmados(supabase, mes, moverMes(mes, 1)),
    obtenerResumenDelMes(supabase, moverMes(mes, -1)),
  ]);
  return { mes, gastos, anterior: resumenAnterior.expense };
}

export function useMonthlyReport() {
  const mesActual = inicioDeMesGT();
  const [mes, setMes] = useState(mesActual);
  const estado = useAsyncData(() => cargarReporte(mes), SIN_DATOS, mes);

  const cargando = estado.isLoading || estado.data.mes !== mes;
  const { gastos, anterior } = cargando ? SIN_DATOS : estado.data;
  const slices = buildCategorySlices(totalesPorCategoria(gastos));
  const total = slices.reduce((suma, s) => suma + s.amount, 0);
  const mayor = slices[0] ?? null;
  useReporteVisto(cargando ? null : { mes, total, categorias: slices.length });

  return {
    error: estado.error,
    recargar: estado.recargar,
    isLoading: cargando,
    mes,
    mesAnterior: moverMes(mes, -1),
    puedeAvanzar: mes < mesActual,
    cambiarMes: (delta: number) => setMes((actual) => moverMes(actual, delta)),
    slices,
    total,
    comparacion: compararConAnterior(total, anterior),
    mayor,
    promedioMayor: mayor ? promedioDiario(mayor.amount, mes, hoyGT()) : 0,
    desdeEventos: gastos.filter((g) => g.fromEvent).reduce((suma, g) => suma + g.amount, 0),
  };
}

// monthly_report_viewed: una vez por cada mes que se mira en esta visita.
function useReporteVisto(datos: { mes: string; total: number; categorias: number } | null) {
  const vistos = useRef(new Set<string>());
  useEffect(() => {
    if (!datos || vistos.current.has(datos.mes)) return;
    vistos.current.add(datos.mes);
    void track('monthly_report_viewed', { month: datos.mes, total_spent: datos.total, categories_count: datos.categorias });
  }, [datos]);
}
