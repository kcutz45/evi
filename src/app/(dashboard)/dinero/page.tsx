/**
 * dinero/page.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Historial de movimientos: elegir el mes, ver sus totales,
 *            filtrar por tipo o categoría, y tocar un movimiento para
 *            verlo, editarlo o eliminarlo.
 *
 * POR QUÉ EXISTE: El Dashboard muestra solo los últimos 5. Aquí está
 *            todo, agrupado por día. Editar reutiliza el mismo registro
 *            paso a paso (ya cargado), así no hay un segundo formulario
 *            que aprender.
 *
 * NOTA:      La lista muestra lo que OCURRIÓ en el mes; los totales
 *            vienen de vw_monthly_summary (solo confirmados). Un gasto
 *            pendiente de evento aparece en la lista con su marca, pero
 *            no suma al total hasta cerrar el evento (§4d).
 *
 * DEPENDE DE: hooks/useMonthMovements, useMonthlySummary,
 *            useMovementActions, useMovements, useCategories,
 *            useCategoryUsage, useActiveEvents · lib/movementList
 * ---------------------------------------------------------------
 */
'use client';

import { useState } from 'react';
import { AddMovementButton } from '@/components/finance/AddMovementButton';
import { MonthHeader } from '@/components/finance/dinero/MonthHeader';
import { MovementDayGroups } from '@/components/finance/dinero/MovementDayGroups';
import { MovementDetailSheet } from '@/components/finance/dinero/MovementDetailSheet';
import { MovementFilters } from '@/components/finance/dinero/MovementFilters';
import { RegistroWizard } from '@/components/finance/registro/RegistroWizard';
import { Header } from '@/components/layout/Header';
import { PageContainer } from '@/components/layout/PageContainer';
import { useActiveEvents } from '@/hooks/useActiveEvents';
import { useCategories } from '@/hooks/useCategories';
import { useCategoryUsage } from '@/hooks/useCategoryUsage';
import { useMonthMovements } from '@/hooks/useMonthMovements';
import { useMonthlySummary } from '@/hooks/useMonthlySummary';
import { etiquetaDeMes, inicioDeMesGT, moverMes } from '@/lib/dates';
import {
  SIN_FILTRO, agruparPorDia, categoriasPresentes, filtrarMovimientos, type FiltroMovimientos,
} from '@/lib/movementList';
import { useAccionesDinero } from './useAccionesDinero';

export default function DineroPage() {
  const mesActual = inicioDeMesGT();
  const [mes, setMes] = useState(mesActual);
  const [filtro, setFiltro] = useState<FiltroMovimientos>(SIN_FILTRO);
  const lista = useMonthMovements(mes);
  const resumen = useMonthlySummary(mes);
  const usos = useCategoryUsage();
  const { data: categorias } = useCategories();
  const { data: eventos } = useActiveEvents();
  const a = useAccionesDinero(categorias, [lista.recargar, resumen.recargar, usos.recargar]);

  const cambiarMes = (delta: number) => {
    setMes((actual) => moverMes(actual, delta));
    setFiltro(SIN_FILTRO);
  };
  const hayFiltro = filtro.tipo !== null || filtro.categoriaId !== null;

  return (
    <PageContainer floatingAction={<AddMovementButton onClick={a.abrirCrear} />}>
      <Header title="Dinero" subtitle="Todo lo que entró y salió, mes a mes." />
      <div className="flex flex-col gap-4">
        <MonthHeader etiqueta={etiquetaDeMes(mes)} puedeAvanzar={mes < mesActual} onAnterior={() => cambiarMes(-1)}
          onSiguiente={() => cambiarMes(1)} ingresos={resumen.data.income} egresos={resumen.data.expense}
          isLoading={resumen.isLoading} />
        <MovementFilters filtro={filtro} categorias={categoriasPresentes(lista.data)} onCambiar={setFiltro} />
        {lista.error && <p role="alert" className="text-sm font-bold text-gold-dark">{lista.error}</p>}
        <MovementDayGroups grupos={agruparPorDia(filtrarMovimientos(lista.data, filtro))}
          isLoading={lista.isLoading} hayFiltro={hayFiltro} onElegir={a.setSeleccionado} />
      </div>
      {a.seleccionado && !a.wizard && (
        <MovementDetailSheet movimiento={a.seleccionado} ocupado={a.ocupado} error={a.error}
          onEditar={a.abrirEditar} onEliminar={a.eliminar} onCerrar={a.cerrarDetalle} />
      )}
      {a.wizard && (
        <RegistroWizard categorias={categorias} usos={usos.data} eventosActivos={eventos}
          guardando={a.ocupado} errorGuardado={a.error} onGuardar={a.guardar} onCerrar={a.cerrarWizard}
          inicial={a.wizard.inicial} />
      )}
    </PageContainer>
  );
}
