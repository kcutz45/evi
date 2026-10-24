/**
 * UserMenu.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Avatar del encabezado que, al tocarlo, abre un menú con el
 *            nombre, el plan y "Cerrar sesión".
 *
 * POR QUÉ EXISTE: "Cerrar sesión" estaba al final del Dashboard y había
 *            que bajar para encontrarlo (pruebas del 24/10/2026). Arriba
 *            a la derecha es donde todas las apps lo ponen.
 *
 * NOTA:      Abierto/cerrado es estado visual: vive aquí. La acción de
 *            cerrar sesión llega por props (viene de useAuth).
 * ---------------------------------------------------------------
 */
'use client';

import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { RUTA_LOGIN, navegarConRecarga } from '@/lib/routes';
import { planLabel } from '@/lib/text';
import type { AuthResultado } from '@/types/auth';
import type { PlanName } from '@/types/database';
import { UserAvatar } from './Header';

interface UserMenuProps {
  nombre: string;
  plan: PlanName | null;
  onLogout: () => Promise<AuthResultado>;
}

export function UserMenu({ nombre, plan, onLogout }: UserMenuProps) {
  const [abierto, setAbierto] = useState(false);
  const [saliendo, setSaliendo] = useState(false);

  const cerrarSesion = async () => {
    setSaliendo(true);
    const resultado = await onLogout();
    if (!resultado.ok) return setSaliendo(false);
    navegarConRecarga(RUTA_LOGIN);
  };

  return (
    <div className="relative">
      <button type="button" onClick={() => setAbierto((a) => !a)} aria-expanded={abierto}
        aria-haspopup="menu" aria-label="Abrir menú de tu cuenta" className="rounded-tile">
        <UserAvatar fullName={nombre || 'EVI'} />
      </button>
      {abierto && (
        <>
          {/* Capa invisible: tocar fuera del menú lo cierra. */}
          <button type="button" aria-label="Cerrar menú" onClick={() => setAbierto(false)}
            className="fixed inset-0 z-30 cursor-default" />
          <div role="menu" className="absolute right-0 top-full z-40 mt-2 w-60 rounded-card bg-white p-2 shadow-float">
            <div className="flex flex-col gap-1.5 border-b border-line px-3 pb-3 pt-2">
              <span className="truncate text-base font-black tracking-tight">{nombre || 'Tu cuenta'}</span>
              {plan && <Badge tone="mint" className="self-start">Plan {planLabel(plan)}</Badge>}
            </div>
            <button type="button" role="menuitem" onClick={cerrarSesion} disabled={saliendo}
              className="mt-1 flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-extrabold text-dark hover:bg-light disabled:opacity-50">
              <LogOut size={17} className="text-muted" aria-hidden />
              {saliendo ? 'Cerrando sesión…' : 'Cerrar sesión'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
