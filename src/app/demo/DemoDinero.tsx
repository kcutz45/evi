/**
 * demo/DemoDinero.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: La pantalla Dinero con datos de ejemplo (sin Supabase).
 *
 * TEMPORAL:  Vive en app/demo para borrarse junto con ella antes de la
 *            beta. Usa los mismos componentes y funciones puras que la
 *            pantalla real; solo cambia de dónde vienen los datos.
 * ---------------------------------------------------------------
 */
'use client';

import { useState } from 'react';
import { MonthHeader } from '@/components/finance/dinero/MonthHeader';
import { MovementDayGroups } from '@/components/finance/dinero/MovementDayGroups';
import { MovementDetailSheet } from '@/components/finance/dinero/MovementDetailSheet';
import { MovementFilters } from '@/components/finance/dinero/MovementFilters';
import {
  SIN_FILTRO, agruparPorDia, categoriasPresentes, filtrarMovimientos, type FiltroMovimientos,
} from '@/lib/movementList';
import type { MovementDetalle } from '@/types/movement';
import { demoDetalles } from './mockData';

export function DemoDinero() {
  const [filtro, setFiltro] = useState<FiltroMovimientos>(SIN_FILTRO);
  const [seleccionado, setSeleccionado] = useState<MovementDetalle | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <MonthHeader etiqueta="Octubre 2026" puedeAvanzar={false} onAnterior={() => {}} onSiguiente={() => {}}
        ingresos={1500} egresos={608.75} isLoading={false} />
      <MovementFilters filtro={filtro} categorias={categoriasPresentes(demoDetalles)} onCambiar={setFiltro} />
      <MovementDayGroups grupos={agruparPorDia(filtrarMovimientos(demoDetalles, filtro))} isLoading={false}
        hayFiltro={filtro.tipo !== null || filtro.categoriaId !== null} onElegir={setSeleccionado} />
      {seleccionado && (
        <MovementDetailSheet movimiento={seleccionado} ocupado={false} error={null}
          onEditar={() => setSeleccionado(null)} onEliminar={() => setSeleccionado(null)}
          onCerrar={() => setSeleccionado(null)} />
      )}
    </div>
  );
}
