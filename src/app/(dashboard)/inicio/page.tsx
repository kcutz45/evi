/**
 * inicio/page.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Dashboard principal (§3, pantalla 3): saludo, balance del
 *            mes, últimos movimientos y el botón "+" para registrar un
 *            movimiento en 3 toques.
 *
 * POR QUÉ EXISTE: Es la pantalla que el usuario ve todos los días. Esta
 *            página solo CONECTA: los datos vienen de hooks y los
 *            componentes solo pintan (§2.1). No hay sumas aquí: el
 *            balance lo calcula la vista vw_monthly_summary.
 *
 * NOTA:      Sin sesión no se llega aquí: el middleware manda a /login.
 *
 * DEPENDE DE: hooks/useAuth, useMonthlySummary, useMovements,
 *            useCategories, useActiveEvents
 * ---------------------------------------------------------------
 */
'use client';

import { useState } from 'react';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { AddMovementButton } from '@/components/finance/AddMovementButton';
import { BalanceSection, RecentMovementsSection } from '@/components/finance/DashboardSections';
import { MovementForm } from '@/components/finance/MovementForm';
import { Header, UserAvatar } from '@/components/layout/Header';
import { PageContainer } from '@/components/layout/PageContainer';
import { useActiveEvents } from '@/hooks/useActiveEvents';
import { useAuth } from '@/hooks/useAuth';
import { useCategories } from '@/hooks/useCategories';
import { useMonthlySummary } from '@/hooks/useMonthlySummary';
import { useMovements } from '@/hooks/useMovements';
import { nombreDelMes, saludoGT } from '@/lib/dates';
import type { MovementDraft } from '@/types/movement';

export default function InicioPage() {
  const { perfil, cerrarSesion } = useAuth();
  const resumen = useMonthlySummary();
  const movimientos = useMovements();
  const { data: categorias } = useCategories();
  const { data: eventos } = useActiveEvents();
  const [isHidden, setIsHidden] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const cerrarFormulario = () => {
    setIsFormOpen(false);
    movimientos.limpiarError();
  };

  const guardar = async (draft: MovementDraft, segundos: number) => {
    const categoria = categorias.find((c) => c.id === draft.categoryId)?.name ?? null;
    if (!(await movimientos.crear(draft, segundos, categoria))) return;
    setIsFormOpen(false);
    // Recargar ambos: un gasto de evento queda pendiente y no cambia el
    // balance, pero decidir eso aquí duplicaría la regla de la base.
    resumen.recargar();
    movimientos.recargar();
  };

  if (isFormOpen) {
    return (
      <MovementForm categories={categorias} activeEvents={eventos} isSaving={movimientos.isSaving}
        submitError={movimientos.saveError} onSubmit={guardar} onClose={cerrarFormulario} />
    );
  }

  const nombre = perfil?.fullName ?? '';
  return (
    <PageContainer floatingAction={<AddMovementButton onClick={() => setIsFormOpen(true)} />}>
      <Header eyebrow={saludoGT()} title={nombre || 'qué gusto verte'}
        action={<UserAvatar fullName={nombre || 'EVI'} />} />
      <BalanceSection monthLabel={nombreDelMes(resumen.inicioDeMes)} {...resumen.data}
        isLoading={resumen.isLoading} error={resumen.error} isHidden={isHidden}
        onToggleHidden={() => setIsHidden((oculto) => !oculto)} onRetry={resumen.recargar} />
      <RecentMovementsSection movements={movimientos.data} isLoading={movimientos.isLoading}
        error={movimientos.error} onRetry={movimientos.recargar} />
      <LogoutButton onLogout={cerrarSesion} />
    </PageContainer>
  );
}
