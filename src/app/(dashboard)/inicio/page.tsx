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
 *            useCategories, useCategoryUsage, useActiveEvents, useAccounts,
 *            useGoals
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
import { MetasCard } from '@/components/metas/MetasCard';
import { useAccounts } from '@/hooks/useAccounts';
import { useActiveEvents } from '@/hooks/useActiveEvents';
import { useAuth } from '@/hooks/useAuth';
import { useCategories } from '@/hooks/useCategories';
import { useCategoryUsage } from '@/hooks/useCategoryUsage';
import { useGoals, type EstadoMetas } from '@/hooks/useGoals';
import { useMonthlySummary } from '@/hooks/useMonthlySummary';
import { useMovements } from '@/hooks/useMovements';
import { useReceivablesSummary } from '@/hooks/useReceivables';
import { nombreDelMes, saludoGT } from '@/lib/dates';
import type { Category } from '@/types/category';
import type { MovementDraft } from '@/types/movement';
import type { Deudor, ResumenPorCobrar } from '@/types/receivable';

export default function InicioPage() {
  const { perfil, cerrarSesion } = useAuth();
  const resumen = useMonthlySummary();
  const movimientos = useMovements();
  const usos = useCategoryUsage();
  const teDeben = useReceivablesSummary();
  const cats = useCategories();
  const cuentas = useAccounts();
  const metas = useGoals();
  const categorias = cats.data;
  const { data: eventos } = useActiveEvents();
  const [isHidden, setIsHidden] = useState(false);
  const registro = useRegistroEnDashboard(movimientos, categorias, [resumen.recargar, usos.recargar, teDeben.recargar, cuentas.recargar]);

  const nombre = perfil?.fullName ?? '';
  return (
    <PageContainer floatingAction={<AddMovementButton onClick={registro.abrir} />}>
      <Header eyebrow={saludoGT()} title={nombre || 'qué gusto verte'}
        action={<UserMenu nombre={nombre} plan={perfil?.plan ?? null} onLogout={cerrarSesion} />} />
      <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-6">
        <div>
          <BalanceSection monthLabel={nombreDelMes(resumen.inicioDeMes)} {...resumen.data}
            isLoading={resumen.isLoading || cuentas.isLoading} error={resumen.error} isHidden={isHidden}
            dinero={cuentas.error || cuentas.data.length === 0 ? null : cuentas.total}
            onToggleHidden={() => setIsHidden((oculto) => !oculto)} onRetry={resumen.recargar} />
          <TarjetasDeInicio teDeben={teDeben.data} metas={metas} isHidden={isHidden} />
        </div>
        <RecentMovementsSection movements={movimientos.data} isLoading={movimientos.isLoading}
          error={movimientos.error} onRetry={movimientos.recargar} />
      </div>
      {registro.abierto && (
        <RegistroWizard categorias={categorias} onCrearCategoria={cats.crear} creandoCategoria={cats.creando}
          errorCategoria={cats.errorCrear} usos={usos.data} eventosActivos={eventos}
          cuentas={cuentas.data} cuentaPorDefecto={cuentas.cuentaPorDefecto} guardando={movimientos.isSaving} errorGuardado={movimientos.saveError}
          onGuardar={registro.guardar} onCerrar={registro.cerrar} />
      )}
    </PageContainer>
  );
}

// "Te deben" y "Mis metas": lado a lado en tablet, una sobre otra en PC.
function TarjetasDeInicio({ teDeben, metas, isHidden }: { teDeben: ResumenPorCobrar; metas: EstadoMetas; isHidden: boolean }) {
  return (
    <div className="md:grid md:grid-cols-2 md:gap-3 lg:grid-cols-1 lg:gap-0">
      <TeDebenCard resumen={teDeben} />
      <MetasCard metas={metas.data.length} totalAhorrado={metas.totalAhorrado} isHidden={isHidden} />
    </div>
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
