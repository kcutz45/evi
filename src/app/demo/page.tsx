/**
 * demo/page.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Vitrina de los componentes con datos simulados.
 *
 * TEMPORAL:  Sirve para revisar diseño y estados en un celular real
 *            antes de conectar Supabase. Se borra antes de la beta.
 * ---------------------------------------------------------------
 */
'use client';

import { useState, type ReactNode } from 'react';
import { ClosedEventCard } from '@/components/events/ClosedEventCard';
import { CloseEventModal } from '@/components/events/CloseEventModal';
import { Checklist } from '@/components/events/Checklist';
import { EventCard } from '@/components/events/EventCard';
import { AddMovementButton } from '@/components/finance/AddMovementButton';
import { BalanceCard } from '@/components/finance/BalanceCard';
import { MonthlyChart } from '@/components/finance/MonthlyChart';
import { RegistroWizard } from '@/components/finance/registro/RegistroWizard';
import { MovementList } from '@/components/finance/MovementList';
import { Header } from '@/components/layout/Header';
import { UserMenu } from '@/components/layout/UserMenu';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { TeDebenCard } from '@/components/finance/porCobrar/TeDebenCard';
import { DesgloseCategorias } from '@/components/report/DesgloseCategorias';
import { ResumenDelMes } from '@/components/report/ResumenDelMes';
import { TotalGastado } from '@/components/report/TotalGastado';
import type { NuevaCategoria } from '@/types/category';
import { DemoDinero } from './DemoDinero';
import { DemoEvento } from './DemoEvento';
import { DemoTeDeben } from './DemoTeDeben';
import { demoCategories, demoEvents, demoMovements, demoSlices, demoTasks, demoUsos } from './mockData';

export default function DemoPage() {
  const [isHidden, setIsHidden] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCloseOpen, setIsCloseOpen] = useState(false);
  const [tasks, setTasks] = useState(demoTasks);
  const active = demoEvents.filter((e) => e.status === 'activo');
  const toggleTask = (taskId: string, isDone: boolean) =>
    setTasks((current) => current.map((t) => (t.id === taskId ? { ...t, isDone } : t)));

  const { demoCategorias, crearCategoriaDemo } = useCategoriasDemo();
  // En la demo no hay sesión: cerrar sesión no hace nada.
  const logoutDemo = async () => ({ ok: false as const, error: 'Demo sin sesión' });
  // Simula el guardado: espera un poco y "sale bien" para ver el ¡Listo!.
  const guardarDemo = () => new Promise<boolean>((resolve) => setTimeout(() => resolve(true), 500));

  return (
    <PageContainer floatingAction={<AddMovementButton onClick={() => setIsFormOpen(true)} />}>
      <Header eyebrow="Buen día," title="Andrea" action={<UserMenu nombre="Andrea López" plan="gratis" onLogout={logoutDemo} />} />
      <BalanceCard monthLabel="octubre" balance={4820.5} income={8450} expense={3629.5}
        isHidden={isHidden} onToggleHidden={() => setIsHidden((h) => !h)} />
      <TeDebenCard resumen={{ total: 235, personas: 2 }} />
      <DemoSection title="Últimos movimientos"><MovementList movements={demoMovements} /></DemoSection>
      <DemoSection title="Eventos">
        {active.map((e) => <EventCard key={e.id} event={e} />)}
        {demoEvents.filter((e) => e.status === 'cerrado').map((e) => <ClosedEventCard key={e.id} event={e} />)}
      </DemoSection>
      <DemoSection title="Evento (pantalla)"><DemoEvento /></DemoSection>
      <DemoSection title="Dinero (pantalla)"><DemoDinero /></DemoSection>
      <DemoSection title="Te deben (pantalla)"><DemoTeDeben /></DemoSection>
      <DemoSection title="Tareas"><Checklist tasks={tasks} onToggle={toggleTask} /></DemoSection>
      <DemoSection title="Reporte">
        <TotalGastado total={3629.5} comparacion={{ diferencia: 412, subio: false }} nombreMesAnterior="septiembre" />
        <MonthlyChart slices={demoSlices} />
        <DesgloseCategorias slices={demoSlices} />
        {demoSlices[0] && <ResumenDelMes mayor={demoSlices[0]} total={3629.5} promedioDiario={62.5} desdeEventos={1240} />}
      </DemoSection>
      <Button variant="soft" fullWidth className="mt-6" onClick={() => setIsCloseOpen(true)}>Probar cierre de evento</Button>
      <CloseEventModal isOpen={isCloseOpen} eventName="Cumpleaños de Sofía" planned={2000} actual={1700}
        expensesCount={12} targetMonthLabel="octubre" isClosing={false}
        onConfirm={() => setIsCloseOpen(false)} onCancel={() => setIsCloseOpen(false)} />
      {isFormOpen && (
        <RegistroWizard categorias={demoCategorias} onCrearCategoria={crearCategoriaDemo} creandoCategoria={false}
          errorCategoria={null} usos={demoUsos} eventosActivos={active}
          guardando={false} errorGuardado={null} onGuardar={guardarDemo} onCerrar={() => setIsFormOpen(false)} />
      )}
    </PageContainer>
  );
}

function DemoSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-6 flex flex-col gap-3">
      <h2 className="text-lg font-black tracking-tight">{title}</h2>
      {children}
    </section>
  );
}

// En la demo, crear una categoría solo la agrega a la lista en memoria.
function useCategoriasDemo() {
  const [demoCategorias, setDemoCategorias] = useState(demoCategories);
  const crearCategoriaDemo = async (datos: NuevaCategoria) => {
    const nueva = { id: crypto.randomUUID(), ...datos, name: datos.name.trim() };
    setDemoCategorias((actual) => [...actual, nueva]);
    return nueva;
  };
  return { demoCategorias, crearCategoriaDemo };
}
