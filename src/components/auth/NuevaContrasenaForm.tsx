/**
 * NuevaContrasenaForm.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Pantalla a la que lleva el enlace del correo: escribir la
 *            contraseña nueva dos veces y entrar a EVI.
 *
 * POR QUÉ EXISTE: El enlace ya abrió una sesión (en /auth/confirm); aquí
 *            solo se guarda la contraseña. Si alguien entra sin venir del
 *            enlace, Supabase rechaza el cambio y se le pide otro enlace.
 *
 * DEPENDE DE: hooks/useRecuperacion.ts, hooks/useZodForm.ts
 * ---------------------------------------------------------------
 */
'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { useRecuperacion } from '@/hooks/useRecuperacion';
import { useZodForm } from '@/hooks/useZodForm';
import { RUTA_INICIO, RUTA_RECUPERAR, navegarConRecarga } from '@/lib/routes';
import { PASSWORD_MIN_LENGTH, nuevaContrasenaSchema } from '@/types/auth';
import { AuthHeading, FormAlert } from './AuthHeading';
import { PasswordInput } from './PasswordInput';

export function NuevaContrasenaForm() {
  const form = useZodForm(nuevaContrasenaSchema, { contrasena: '', repetir: '' });
  const recuperacion = useRecuperacion();
  const [noCoinciden, setNoCoinciden] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const datos = form.enviar();
    if (!datos) return;
    setNoCoinciden(datos.contrasena !== datos.repetir);
    if (datos.contrasena !== datos.repetir) return;
    if (await recuperacion.guardarNueva(datos.contrasena)) navegarConRecarga(RUTA_INICIO);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <AuthHeading title="Poné tu contraseña nueva" subtitle="Elegí una que no hayás usado antes. Después entrás directo a EVI." />
      <PasswordInput label="Contraseña nueva" autoComplete="new-password" hint={`Mínimo ${PASSWORD_MIN_LENGTH} caracteres`}
        value={form.valores.contrasena} error={form.errores.contrasena}
        onChange={(e) => form.cambiar('contrasena', e.target.value)} onBlur={() => form.salir('contrasena')} />
      <PasswordInput label="Repetila" autoComplete="new-password" value={form.valores.repetir}
        error={form.errores.repetir ?? (noCoinciden ? 'Las contraseñas no coinciden' : undefined)}
        onChange={(e) => form.cambiar('repetir', e.target.value)} onBlur={() => form.salir('repetir')} />
      <FormAlert message={recuperacion.error} />
      <Button type="submit" size="lg" fullWidth disabled={recuperacion.enviando}>
        {recuperacion.enviando ? 'Guardando…' : 'Guardar y entrar'}
      </Button>
      {recuperacion.error && (
        <p className="text-center text-sm font-semibold text-muted">
          ¿El enlace venció? <Link href={RUTA_RECUPERAR} className="font-black text-primary">Pedí uno nuevo</Link>
        </p>
      )}
    </form>
  );
}
