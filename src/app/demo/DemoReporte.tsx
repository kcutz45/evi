/**
 * DemoReporte.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Reporte mensual con datos simulados.
 *
 * TEMPORAL:  Para revisar el diseño sin sesión. Se borra con /demo.
 * ---------------------------------------------------------------
 */
import { MonthlyChart } from '@/components/finance/MonthlyChart';
import { DesgloseCategorias } from '@/components/report/DesgloseCategorias';
import { ResumenDelMes } from '@/components/report/ResumenDelMes';
import { TotalGastado } from '@/components/report/TotalGastado';
import { demoSlices } from './mockData';

const TOTAL_DEMO = 3629.5;

export function DemoReporte() {
  return (
    <>
      <TotalGastado total={TOTAL_DEMO} comparacion={{ diferencia: 412, subio: false }} nombreMesAnterior="septiembre" />
      <MonthlyChart slices={demoSlices} />
      <DesgloseCategorias slices={demoSlices} />
      {demoSlices[0] && <ResumenDelMes mayor={demoSlices[0]} total={TOTAL_DEMO} promedioDiario={62.5} desdeEventos={1240} />}
    </>
  );
}
