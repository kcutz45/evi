/**
 * LoginForm.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Formulario de inicio de sesión: correo y contraseña.
 *
 * POR QUÉ EXISTE: Misma mecánica que RegistroForm (useZodForm +
 *            useAuth); al entrar redirige a /inicio.
 *
 * DEPENDE DE: hooks/useAuth.ts, hooks/useZodForm.ts
 * USADO EN:   app/(auth)/login/page.tsx
 * ---------------------------------------------------------------
 */
'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { useZodForm } from '@/hooks/useZodForm';
import { RUTA_INICIO, RUTA_REGISTRO, navegarConRecarga } from '@/lib/routes';
import { loginSchema } from '@/types/auth';
import { AuthHeading, FormAlert } from './AuthHeading';
import { PasswordInput } from './PasswordInput';

export function LoginForm() {
  const { iniciarSesion } = useAuth();
  const form = useZodForm(loginSchema, { correo: '', contrasena: '' });
  const [aviso, setAviso] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const datos = form.enviar();
    if (!datos) return;
    setIsSending(true);
    const resultado = await iniciarSesion(datos);
    setIsSending(false);
    if (!resultado.ok) return setAviso(resultado.error);
    navegarConRecarga(RUTA_INICIO);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <AuthHeading title="Qué bueno verte" subtitle="Iniciá sesión para seguir con tus eventos y tu dinero." />
      <Input label="Correo electrónico" type="email" inputMode="email" autoComplete="email"
        icon={<Mail size={17} />} placeholder="tu@correo.com" value={form.valores.correo}
        error={form.errores.correo} onChange={(e) => form.cambiar('correo', e.target.value)}
        onBlur={() => form.salir('correo')} />
      <PasswordInput label="Contraseña" autoComplete="current-password" value={form.valores.contrasena}
        error={form.errores.contrasena} onChange={(e) => form.cambiar('contrasena', e.target.value)}
        onBlur={() => form.salir('contrasena')} />
      <FormAlert message={aviso} />
      <Button type="submit" size="lg" fullWidth disabled={isSending}>
        {isSending ? 'Entrando…' : 'Iniciar sesión'}
      </Button>
      <p className="text-center text-sm font-semibold text-muted">
        ¿Todavía no tenés cuenta?{' '}
        <Link href={RUTA_REGISTRO} className="font-black text-primary">Crear cuenta</Link>
      </p>
    </form>
  );
}
