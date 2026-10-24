/**
 * inicio/page.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Pantalla protegida MÍNIMA: saludo con el nombre del
 *            perfil, el plan y el botón para cerrar sesión.
 *
 * POR QUÉ EXISTE: Verifica de punta a punta el flujo de auth:
 *            registro → trigger handle_new_user crea el perfil →
 *            middleware deja pasar → RLS deja leer SOLO el perfil propio.
 *            El dashboard real (§3, pantalla 3) la reemplaza después.
 *
 * NOTA:      Si alguien llega aquí sin sesión, el middleware ya lo mandó
 *            a /login; este archivo no necesita revisar eso.
 *
 * DEPENDE DE: hooks/useAuth.ts
 * ---------------------------------------------------------------
 */
'use client';

import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { FormAlert } from '@/components/auth/AuthHeading';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';
import { RUTA_LOGIN, navegarConRecarga } from '@/lib/routes';
import { planLabel } from '@/lib/text';

export default function InicioPage() {
  const { perfil, isLoading, error, cerrarSesion } = useAuth();
  const [isLeaving, setIsLeaving] = useState(false);

  const handleCerrarSesion = async () => {
    setIsLeaving(true);
    const resultado = await cerrarSesion();
    if (!resultado.ok) return setIsLeaving(false);
    navegarConRecarga(RUTA_LOGIN);
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-5 bg-light px-5 py-8">
      {isLoading && <div aria-busy className="h-40 animate-pulse rounded-card bg-white/70" />}
      <FormAlert message={error} />
      {!isLoading && perfil && (
        <Card className="flex flex-col gap-3 p-5">
          <h1 className="text-2xl font-black tracking-tight">Hola, {perfil.fullName || 'de nuevo'}</h1>
          <p className="flex items-center gap-2 text-sm font-bold text-muted">
            Tu plan: <Badge tone="mint">{planLabel(perfil.plan)}</Badge>
          </p>
        </Card>
      )}
      {!isLoading && !perfil && !error && (
        <FormAlert message="Tu sesión está activa, pero no encontramos tu perfil." />
      )}
      <Button variant="soft" fullWidth disabled={isLeaving} onClick={handleCerrarSesion}
        icon={<LogOut size={18} aria-hidden />}>
        {isLeaving ? 'Cerrando sesión…' : 'Cerrar sesión'}
      </Button>
    </main>
  );
}
