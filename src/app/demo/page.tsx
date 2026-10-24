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
import { Header, UserAvatar } from '@/components/layout/Header';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { demoCategories, demoEvents, demoMovements, demoSlices, demoTasks, demoUsos } from './mockData';

export default function DemoPage() {
  const [isHidden, setIsHidden] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCloseOpen, setIsCloseOpen] = useState(false);
  const [tasks, setTasks] = useState(demoTasks);
  const active = demoEvents.filter((e) => e.status === 'activo');
  const toggleTask = (taskId: string, isDone: boolean) =>
    setTasks((current) => current.map((t) => (t.id === taskId ? { ...t, isDone } : t)));

  // Simula el guardado: espera un poco y "sale bien" para ver el ¡Listo!.
  const guardarDemo = () => new Promise<boolean>((resolve) => setTimeout(() => resolve(true), 500));

  return (
    <PageContainer floatingAction={<AddMovementButton onClick={() => setIsFormOpen(true)} />}>
      <Header eyebrow="Buen día," title="Andrea" action={<UserAvatar fullName="Andrea López" />} />
      <BalanceCard monthLabel="octubre" balance={4820.5} income={8450} expense={3629.5}
        isHidden={isHidden} onToggleHidden={() => setIsHidden((h) => !h)} />
      <DemoSection title="Últimos movimientos"><MovementList movements={demoMovements} /></DemoSection>
      <DemoSection title="Eventos">
        {active.map((e) => <EventCard key={e.id} event={e} />)}
        {demoEvents.filter((e) => e.status === 'cerrado').map((e) => <ClosedEventCard key={e.id} event={e} />)}
      </DemoSection>
      <DemoSection title="Tareas"><Checklist tasks={tasks} onToggle={toggleTask} /></DemoSection>
      <DemoSection title="Reporte"><MonthlyChart slices={demoSlices} /></DemoSection>
      <Button variant="soft" fullWidth className="mt-6" onClick={() => setIsCloseOpen(true)}>Probar cierre de evento</Button>
      <CloseEventModal isOpen={isCloseOpen} eventName="Cumpleaños de Sofía" planned={2000} actual={1700}
        expensesCount={12} targetMonthLabel="octubre" isClosing={false}
        onConfirm={() => setIsCloseOpen(false)} onCancel={() => setIsCloseOpen(false)} />
      {isFormOpen && (
        <RegistroWizard categorias={demoCategories} usos={demoUsos} eventosActivos={active}
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
