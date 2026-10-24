/**
 * inicio/page.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Dashboard principal (§3, pantalla 3): saludo, balance del
 *            mes, últimos movimientos y el botón "+" que abre el
 *            registro paso a paso.
 *
 * POR QUÉ EXISTE: Es la pantalla que el usuario ve todos los días. Esta
 *            página solo CONECTA: los datos vienen de hooks y los
 *            componentes solo pintan (§2.1). No hay sumas aquí: el
 *            balance lo calcula la vista vw_monthly_summary.
 *
 * NOTA:      El registro se abre ENCIMA del Dashboard. Al guardar se
 *            recargan los datos mientras se ve "¡Listo!", así al volver
 *            el balance ya está al día.
 *
 * DEPENDE DE: hooks/useAuth, useMonthlySummary, useMovements,
 *            useCategories, useCategoryUsage, useActiveEvents
 * ---------------------------------------------------------------
 */
'use client';

import { useCallback, useState } from 'react';
import { AddMovementButton } from '@/components/finance/AddMovementButton';
import { BalanceSection, RecentMovementsSection } from '@/components/finance/DashboardSections';
import { TeDebenCard } from '@/components/finance/porCobrar/TeDebenCard';
import { RegistroWizard } from '@/components/finance/registro/RegistroWizard';
import { Header } from '@/components/layout/Header';
import { PageContainer } from '@/components/layout/PageContainer';
import { UserMenu } from '@/components/layout/UserMenu';
import { useActiveEvents } from '@/hooks/useActiveEvents';
import { useAuth } from '@/hooks/useAuth';
import { useCategories } from '@/hooks/useCategories';
import { useCategoryUsage } from '@/hooks/useCategoryUsage';
import { useMonthlySummary } from '@/hooks/useMonthlySummary';
import { useMovements } from '@/hooks/useMovements';
import { useReceivablesSummary } from '@/hooks/useReceivables';
import { nombreDelMes, saludoGT } from '@/lib/dates';
import type { Category } from '@/types/category';
import type { MovementDraft } from '@/types/movement';
import type { Deudor } from '@/types/receivable';

export default function InicioPage() {
  const { perfil, cerrarSesion } = useAuth();
  const resumen = useMonthlySummary();
  const movimientos = useMovements();
  const usos = useCategoryUsage();
  const teDeben = useReceivablesSummary();
  const cats = useCategories();
  const categorias = cats.data;
  const { data: eventos } = useActiveEvents();
  const [isHidden, setIsHidden] = useState(false);
  const registro = useRegistroEnDashboard(movimientos, categorias, [resumen.recargar, usos.recargar, teDeben.recargar]);

  const nombre = perfil?.fullName ?? '';
  return (
    <PageContainer floatingAction={<AddMovementButton onClick={registro.abrir} />}>
      <Header eyebrow={saludoGT()} title={nombre || 'qué gusto verte'}
        action={<UserMenu nombre={nombre} plan={perfil?.plan ?? null} onLogout={cerrarSesion} />} />
      <BalanceSection monthLabel={nombreDelMes(resumen.inicioDeMes)} {...resumen.data}
        isLoading={resumen.isLoading} error={resumen.error} isHidden={isHidden}
        onToggleHidden={() => setIsHidden((oculto) => !oculto)} onRetry={resumen.recargar} />
      <TeDebenCard resumen={teDeben.data} />
      <RecentMovementsSection movements={movimientos.data} isLoading={movimientos.isLoading}
        error={movimientos.error} onRetry={movimientos.recargar} />
      {registro.abierto && (
        <RegistroWizard categorias={categorias} onCrearCategoria={cats.crear} creandoCategoria={cats.creando}
          errorCategoria={cats.errorCrear} usos={usos.data} eventosActivos={eventos}
          guardando={movimientos.isSaving} errorGuardado={movimientos.saveError}
          onGuardar={registro.guardar} onCerrar={registro.cerrar} />
      )}
    </PageContainer>
  );
}

// Abrir, guardar y cerrar el registro. Al guardar bien, recarga la lista
// y lo que se pase en `recargarTambien` (balance, frecuentes).
function useRegistroEnDashboard(
  movimientos: ReturnType<typeof useMovements>,
  categorias: Category[],
  recargarTambien: Array<() => void>,
) {
  const [abierto, setAbierto] = useState(false);
  const { limpiarError } = movimientos;

  // useCallback: "¡Listo!" programa su cierre con esta función; si
  // cambiara en cada render, el temporizador se reiniciaría.
  const cerrar = useCallback(() => {
    setAbierto(false);
    limpiarError();
  }, [limpiarError]);

  const guardar = async (draft: MovementDraft, segundos: number, deudores: Deudor[]) => {
    const categoria = categorias.find((c) => c.id === draft.categoryId)?.name ?? null;
    const ok = await movimientos.crear(draft, segundos, categoria, deudores);
    if (ok) [movimientos.recargar, ...recargarTambien].forEach((recargar) => recargar());
    return ok;
  };

  return { abierto, abrir: () => setAbierto(true), cerrar, guardar };
}
