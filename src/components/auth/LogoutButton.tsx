/**
 * LogoutButton.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Botón "Cerrar sesión" con su estado de espera.
 *
 * POR QUÉ EXISTE: Hasta que exista la pantalla de perfil, el Dashboard
 *            necesita una salida visible. Recibe la acción por props
 *            (viene de useAuth en la página) para no duplicar la sesión.
 *
 * DEPENDE DE: lib/routes.ts
 * USADO EN:   app/(dashboard)/inicio/page.tsx
 * ---------------------------------------------------------------
 */
'use client';

import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { RUTA_LOGIN, navegarConRecarga } from '@/lib/routes';
import type { AuthResultado } from '@/types/auth';

export function LogoutButton({ onLogout }: { onLogout: () => Promise<AuthResultado> }) {
  const [isLeaving, setIsLeaving] = useState(false);

  const handleClick = async () => {
    setIsLeaving(true);
    const resultado = await onLogout();
    if (!resultado.ok) return setIsLeaving(false);
    navegarConRecarga(RUTA_LOGIN);
  };

  return (
    <Button variant="ghost" fullWidth disabled={isLeaving} onClick={handleClick}
      icon={<LogOut size={17} aria-hidden />} className="mt-6">
      {isLeaving ? 'Cerrando sesión…' : 'Cerrar sesión'}
    </Button>
  );
}
