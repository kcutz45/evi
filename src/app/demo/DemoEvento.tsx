/**
 * DemoEvento.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Detalle de un evento y "Nuevo evento" con datos simulados.
 *
 * TEMPORAL:  Para revisar el diseño sin sesión. Se borra con /demo.
 * ---------------------------------------------------------------
 */
'use client';

import { useState } from 'react';
import { EventoEncabezado } from '@/components/events/detalle/EventoEncabezado';
import { PanelGastos } from '@/components/events/detalle/PanelGastos';
import { PanelTareas } from '@/components/events/detalle/PanelTareas';
import { PestanasEvento, type Pestana } from '@/components/events/detalle/PestanasEvento';
import { EventoWizard } from '@/components/events/nuevo/EventoWizard';
import { Button } from '@/components/ui/Button';
import type { EventoDetalle } from '@/types/event';
import { demoEvents, demoTasks } from './mockData';

const base = demoEvents[0];

export function DemoEvento() {
  const [pestana, setPestana] = useState<Pestana>('tareas');
  const [tareas, setTareas] = useState(demoTasks);
  const [nuevo, setNuevo] = useState(false);
  if (!base) return null;
  const evento: EventoDetalle = { ...base, eventDate: '2026-11-14', countdown: 'faltan 21 días', closedAt: null };
  const agregar = async (titulo: string) => {
    setTareas((t) => [...t, { id: crypto.randomUUID(), title: titulo.trim(), isDone: false }]);
    return true;
  };

  return (
    <div className="flex flex-col gap-3">
      <EventoEncabezado evento={evento} />
      <PestanasEvento activa={pestana} tareasPendientes={tareas.filter((t) => !t.isDone).length} gastos={0}
        onCambiar={setPestana} />
      {pestana === 'tareas' ? (
        <PanelTareas tareas={tareas} cargando={false} error={null} soloLectura={false} onAgregar={agregar}
          onAlternar={(id, hecha) => setTareas((t) => t.map((x) => (x.id === id ? { ...x, isDone: hecha } : x)))} />
      ) : (
        <PanelGastos gastos={[]} cargando={false} error={null} onAgregar={() => undefined} />
      )}
      <Button variant="soft" fullWidth onClick={() => setNuevo(true)}>Probar nuevo evento</Button>
      {nuevo && <EventoWizard creando={false} error={null} onCrear={() => setNuevo(false)} onCerrar={() => setNuevo(false)} />}
    </div>
  );
}
