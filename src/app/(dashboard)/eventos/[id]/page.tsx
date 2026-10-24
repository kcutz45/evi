/**
 * eventos/[id]/page.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Detalle de un evento: presupuesto con la alerta del 80%,
 *            pestañas Tareas y Gastos, "Agregar gasto" y "Cerrar evento".
 *
 * POR QUÉ EXISTE: Aquí ocurre el diferenciador de EVI (§0): al cerrar,
 *            los gastos pendientes pasan a tus finanzas del mes con la
 *            RPC atómica close_event_and_transfer. Esta página solo
 *            CONECTA hooks y componentes (§2.1).
 *
 * DEPENDE DE: hooks/useEvento, useEventTasks, useMovements, useCategories,
 *            useCategoryUsage; components/events/*
 * ---------------------------------------------------------------
 */
'use client';

import { useCallback, useState } from 'react';
import { useParams } from 'next/navigation';
import { CircleCheck } from 'lucide-react';
import { FormAlert } from '@/components/auth/AuthHeading';
import { CloseEventModal } from '@/components/events/CloseEventModal';
import { EventoEncabezado } from '@/components/events/detalle/EventoEncabezado';
import { PanelGastos } from '@/components/events/detalle/PanelGastos';
import { PanelTareas } from '@/components/events/detalle/PanelTareas';
import { PestanasEvento, type Pestana } from '@/components/events/detalle/PestanasEvento';
import { RegistroWizard } from '@/components/finance/registro/RegistroWizard';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { useCategories } from '@/hooks/useCategories';
import { useCategoryUsage } from '@/hooks/useCategoryUsage';
import { useEventTasks } from '@/hooks/useEventTasks';
import { useEvento } from '@/hooks/useEvento';
import { useMovements } from '@/hooks/useMovements';
import { inicioDeMesGT, nombreDelMes } from '@/lib/dates';
import type { EventoDetalle } from '@/types/event';
import type { MovementDraft } from '@/types/movement';
import type { Deudor } from '@/types/receivable';

export default function EventoPage() {
  const { id } = useParams<{ id: string }>();
  const ev = useEvento(id);
  const evento = ev.evento.data;

  if (ev.evento.isLoading && !evento) {
    return <PageContainer><div aria-busy className="mt-16 h-64 animate-pulse rounded-card bg-white/70" /></PageContainer>;
  }
  if (!evento) {
    return (
      <PageContainer>
        <div className="mt-16"><FormAlert message={ev.evento.error ?? 'No encontramos este evento.'} /></div>
      </PageContainer>
    );
  }
  return <DetalleEvento evento={evento} ev={ev} />;
}

type EstadoEvento = ReturnType<typeof useEvento>;

function DetalleEvento({ evento, ev }: { evento: EventoDetalle; ev: EstadoEvento }) {
  const tareas = useEventTasks(evento.id);
  const registro = useGastoDelEvento(ev.recargar);
  const [pestana, setPestana] = useState<Pestana>('tareas');
  const cierre = useModalDeCierre(ev);
  const activo = evento.status === 'activo';
  const pendientes = tareas.data.filter((t) => !t.isDone).length;

  return (
    <PageContainer>
      <EventoEncabezado evento={evento} />
      <div className="flex flex-col gap-3 pb-4">
        <PestanasEvento activa={pestana} tareasPendientes={pendientes} gastos={ev.gastos.data.length} onCambiar={setPestana} />
        <div role="tabpanel" id={`panel-${pestana}`} aria-labelledby={`tab-${pestana}`}>
          {pestana === 'tareas' ? (
            <PanelTareas tareas={tareas.data} cargando={tareas.isLoading} error={tareas.error ?? tareas.errorTarea}
              soloLectura={!activo} onAlternar={tareas.alternar} onAgregar={tareas.agregar} />
          ) : (
            <PanelGastos gastos={ev.gastos.data} cargando={ev.gastos.isLoading} error={ev.gastos.error}
              onAgregar={activo ? registro.abrir : null} />
          )}
        </div>
        {activo && (
          <Button variant="mint" size="lg" fullWidth className="mt-2" onClick={cierre.abrir}
            icon={<CircleCheck size={20} strokeWidth={2.4} />}>
            Cerrar evento
          </Button>
        )}
      </div>
      <CloseEventModal isOpen={cierre.abierto} eventName={evento.name} planned={evento.plannedBudget}
        actual={evento.spentAmount} expensesCount={evento.expensesCount}
        targetMonthLabel={nombreDelMes(inicioDeMesGT())} isClosing={ev.cerrando} error={ev.errorCierre}
        onConfirm={cierre.confirmar} onCancel={cierre.cancelar} />
      {registro.abierto && <RegistroDelEvento evento={evento} registro={registro} />}
    </PageContainer>
  );
}

// Abrir/cerrar la hoja de cierre. Si la RPC falla, la hoja queda abierta con el error.
function useModalDeCierre(ev: EstadoEvento) {
  const [abierto, setAbierto] = useState(false);
  return {
    abierto,
    abrir: () => setAbierto(true),
    confirmar: async () => {
      if (await ev.cerrar()) setAbierto(false);
    },
    cancelar: () => {
      setAbierto(false);
      ev.limpiarErrorCierre();
    },
  };
}

// "Agregar gasto": el registro paso a paso, ya apuntado a este evento.
function useGastoDelEvento(recargarEvento: () => void) {
  const movimientos = useMovements(1);
  const cats = useCategories();
  const usos = useCategoryUsage();
  const [abierto, setAbierto] = useState(false);
  const { limpiarError } = movimientos;

  // useCallback: "¡Listo!" programa su cierre con esta función.
  const cerrar = useCallback(() => {
    setAbierto(false);
    limpiarError();
  }, [limpiarError]);

  const guardar = async (draft: MovementDraft, segundos: number, deudores: Deudor[]) => {
    const categoria = cats.data.find((c) => c.id === draft.categoryId)?.name ?? null;
    const ok = await movimientos.crear(draft, segundos, categoria, deudores);
    if (ok) [recargarEvento, usos.recargar].forEach((recargar) => recargar());
    return ok;
  };

  return { abierto, abrir: () => setAbierto(true), cerrar, guardar, movimientos, cats, usos: usos.data };
}

function RegistroDelEvento({ evento, registro }: { evento: EventoDetalle; registro: ReturnType<typeof useGastoDelEvento> }) {
  const { cats, movimientos } = registro;
  const fijo = { id: evento.id, name: evento.name };
  return (
    <RegistroWizard eventoFijo={fijo} eventosActivos={[fijo]} categorias={cats.data} usos={registro.usos}
      onCrearCategoria={cats.crear} creandoCategoria={cats.creando} errorCategoria={cats.errorCrear}
      guardando={movimientos.isSaving} errorGuardado={movimientos.saveError}
      onGuardar={registro.guardar} onCerrar={registro.cerrar} />
  );
}
