/**
 * RecuperarForm.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: "¿Olvidaste tu contraseña?": se escribe el correo y EVI
 *            manda un enlace para poner una nueva.
 *
 * POR QUÉ EXISTE: Sin esto, quien olvida la contraseña pierde la cuenta
 *            (o hay que cambiarla a mano en Supabase). El mensaje de
 *            éxito es el mismo exista o no el correo: así no se revela
 *            quién tiene cuenta.
 *
 * DEPENDE DE: hooks/useRecuperacion.ts, hooks/useZodForm.ts
 * ---------------------------------------------------------------
 */
'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { MailCheck, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useRecuperacion } from '@/hooks/useRecuperacion';
import { useZodForm } from '@/hooks/useZodForm';
import { RUTA_LOGIN } from '@/lib/routes';
import { recuperarSchema } from '@/types/auth';
import { AuthHeading, FormAlert } from './AuthHeading';

export function RecuperarForm({ enlaceVencido }: { enlaceVencido: boolean }) {
  const form = useZodForm(recuperarSchema, { correo: '' });
  const recuperacion = useRecuperacion();
  const [enviadoA, setEnviadoA] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const datos = form.enviar();
    if (datos && (await recuperacion.pedirEnlace(datos.correo))) setEnviadoA(datos.correo);
  };

  if (enviadoA) return <EnlaceEnviado correo={enviadoA} />;

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <AuthHeading title="¿Olvidaste tu contraseña?" subtitle="Escribí tu correo y te mandamos un enlace para poner una nueva." />
      <FormAlert message={enlaceVencido ? 'Ese enlace ya venció o ya se usó. Pedí uno nuevo aquí.' : null} />
      <Input label="Correo electrónico" type="email" inputMode="email" autoComplete="email" autoFocus
        icon={<Mail size={17} />} placeholder="tu@correo.com" value={form.valores.correo}
        error={form.errores.correo} onChange={(e) => form.cambiar('correo', e.target.value)}
        onBlur={() => form.salir('correo')} />
      <FormAlert message={recuperacion.error} />
      <Button type="submit" size="lg" fullWidth disabled={recuperacion.enviando}>
        {recuperacion.enviando ? 'Enviando…' : 'Enviarme el enlace'}
      </Button>
      <VolverAlLogin />
    </form>
  );
}

function EnlaceEnviado({ correo }: { correo: string }) {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <span className="grid h-20 w-20 place-items-center rounded-full bg-mint-soft text-mint-dark">
        <MailCheck size={38} aria-hidden />
      </span>
      <AuthHeading title="Revisá tu correo" subtitle={`Si ${correo} tiene una cuenta en EVI, te llegó un enlace para poner una contraseña nueva. Puede tardar un par de minutos; revisá también "Spam".`} />
      <VolverAlLogin />
    </div>
  );
}

function VolverAlLogin() {
  return (
    <p className="text-center text-sm font-semibold text-muted">
      ¿Te acordaste?{' '}
      <Link href={RUTA_LOGIN} className="font-black text-primary">Iniciar sesión</Link>
    </p>
  );
}
