/**
 * RegistroForm.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Formulario de creación de cuenta (§3, pantalla 2): nombre,
 *            correo y contraseña en un solo paso.
 *
 * POR QUÉ EXISTE: Une los campos con useZodForm (validación) y useAuth
 *            (registro). No habla con Supabase ni crea el perfil: eso
 *            lo hacen authService y el trigger handle_new_user.
 *
 * FLUJO:     registrarse → si hay sesión, /inicio. Si el proyecto de
 *            Supabase exige confirmar el correo, se avisa y se queda.
 *
 * DEPENDE DE: hooks/useAuth.ts, hooks/useZodForm.ts, hooks/useSignupTracking.ts
 * USADO EN:   app/(auth)/registro/page.tsx
 * ---------------------------------------------------------------
 */
'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { Mail, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { useSignupTracking } from '@/hooks/useSignupTracking';
import { useZodForm } from '@/hooks/useZodForm';
import { RUTA_INICIO, RUTA_LOGIN, navegarConRecarga } from '@/lib/routes';
import { PASSWORD_MIN_LENGTH, registroSchema } from '@/types/auth';
import { AuthHeading, FormAlert } from './AuthHeading';
import { PasswordInput } from './PasswordInput';

const CONFIRMACION = 'Te enviamos un correo para confirmar tu cuenta. Abrilo y después iniciá sesión.';

export function RegistroForm() {
  const { registrarse } = useAuth();
  const segundosTranscurridos = useSignupTracking('registro');
  const form = useZodForm(registroSchema, { nombre: '', correo: '', contrasena: '' });
  const [aviso, setAviso] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const datos = form.enviar();
    if (!datos) return;
    setIsSending(true);
    const resultado = await registrarse(datos, segundosTranscurridos());
    setIsSending(false);
    if (!resultado.ok) return setAviso(resultado.error);
    if (resultado.requiereConfirmacion) return setAviso(CONFIRMACION);
    navegarConRecarga(RUTA_INICIO);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <AuthHeading title="Creá tu cuenta" subtitle="Tus eventos y tu dinero, en un solo lugar." />
      <Input label="Nombre" autoComplete="name" icon={<User size={17} />} value={form.valores.nombre}
        error={form.errores.nombre} onChange={(e) => form.cambiar('nombre', e.target.value)}
        onBlur={() => form.salir('nombre')} />
      <Input label="Correo electrónico" type="email" inputMode="email" autoComplete="email"
        icon={<Mail size={17} />} placeholder="tu@correo.com" value={form.valores.correo}
        error={form.errores.correo} onChange={(e) => form.cambiar('correo', e.target.value)}
        onBlur={() => form.salir('correo')} />
      <PasswordInput label="Contraseña" autoComplete="new-password" value={form.valores.contrasena}
        hint={`Mínimo ${PASSWORD_MIN_LENGTH} caracteres`} error={form.errores.contrasena}
        onChange={(e) => form.cambiar('contrasena', e.target.value)} onBlur={() => form.salir('contrasena')} />
      <FormAlert message={aviso} />
      <Button type="submit" size="lg" fullWidth disabled={isSending}>
        {isSending ? 'Creando tu cuenta…' : 'Crear mi cuenta'}
      </Button>
      <RegistroFooter />
    </form>
  );
}

function RegistroFooter() {
  return (
    <>
      <p className="text-center text-sm font-semibold text-muted">
        ¿Ya tenés cuenta?{' '}
        <Link href={RUTA_LOGIN} className="font-black text-primary">Iniciar sesión</Link>
      </p>
      <p className="text-center text-xs font-bold text-muted-soft">Gratis para siempre. Sin tarjeta de crédito.</p>
    </>
  );
}
