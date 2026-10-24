/**
 * eventos/page.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Pantalla "Mis eventos" (§3, pantalla 4): los activos
 *            arriba (presupuesto, barra y tareas) y los cerrados abajo.
 *            El "+" abre "Nuevo evento" paso a paso.
 *
 * POR QUÉ EXISTE: Es la puerta al diferenciador de EVI: organizar el
 *            evento y, al cerrarlo, pasar sus gastos a tus finanzas.
 *            Esta página solo CONECTA: datos del hook, pintura de los
 *            componentes (§2.1).
 *
 * DEPENDE DE: hooks/useEvents.ts, components/events/*
 * ---------------------------------------------------------------
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FormAlert } from '@/components/auth/AuthHeading';
import { ClosedEventCard } from '@/components/events/ClosedEventCard';
import { EventCard } from '@/components/events/EventCard';
import { EventsEmptyState } from '@/components/events/EventsEmptyState';
import { EventoWizard } from '@/components/events/nuevo/EventoWizard';
import { AddMovementButton } from '@/components/finance/AddMovementButton';
import { Header } from '@/components/layout/Header';
import { PageContainer } from '@/components/layout/PageContainer';
import { useEvents } from '@/hooks/useEvents';
import type { EventoDetalle, NuevoEvento } from '@/types/event';

const FILAS_DE_CARGA = 2;

export default function EventosPage() {
  const eventos = useEvents();
  const router = useRouter();
  const [creandoNuevo, setCreandoNuevo] = useState(false);
  const activos = eventos.data.filter((e) => e.status === 'activo');
  const cerrados = eventos.data.filter((e) => e.status === 'cerrado');
  const vacio = !eventos.isLoading && !eventos.error && eventos.data.length === 0;

  // Al crear, se entra directo al evento para agregarle tareas y gastos.
  const crear = async (datos: NuevoEvento) => {
    const id = await eventos.crear(datos);
    if (id) router.push(`/eventos/${id}`);
  };

  return (
    <PageContainer floatingAction={vacio ? undefined : (
      <AddMovementButton label="Crear evento" onClick={() => setCreandoNuevo(true)} />
    )}>
      <Header title="Mis eventos" subtitle="Presupuesto y tareas de cada plan." />
      <div className="flex flex-col gap-3">
        <FormAlert message={eventos.error} />
        {eventos.isLoading && Array.from({ length: FILAS_DE_CARGA }, (_, i) => (
          <div key={i} aria-busy className="h-44 animate-pulse rounded-card bg-white/70" />
        ))}
        {vacio && <EventsEmptyState onCreate={() => setCreandoNuevo(true)} />}
        {activos.map((e) => <EventCard key={e.id} event={e} />)}
        <Cerrados eventos={cerrados} />
      </div>
      {creandoNuevo && (
        <EventoWizard creando={eventos.creando} error={eventos.errorCrear} onCrear={crear}
          onCerrar={() => setCreandoNuevo(false)} />
      )}
    </PageContainer>
  );
}

function Cerrados({ eventos }: { eventos: EventoDetalle[] }) {
  if (eventos.length === 0) return null;
  return (
    <section className="mt-3 flex flex-col gap-2.5">
      <h2 className="text-xs font-black uppercase tracking-widest text-muted-soft">Cerrados</h2>
      {eventos.map((e) => <ClosedEventCard key={e.id} event={e} />)}
    </section>
  );
}
