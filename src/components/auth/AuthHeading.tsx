/**
 * AuthHeading.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Título y subtítulo de las pantallas de registro y login,
 *            más el aviso general de error del formulario.
 *
 * POR QUÉ EXISTE: Las dos pantallas comparten la misma cabecera y el
 *            mismo estilo de aviso; así no se duplica el marcado.
 * ---------------------------------------------------------------
 */
import { CircleAlert } from 'lucide-react';

export function AuthHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-[26px] font-black leading-tight tracking-tight">{title}</h1>
      <p className="text-sm font-semibold text-muted">{subtitle}</p>
    </div>
  );
}

// Error que no pertenece a un campo (ej. "Correo o contraseña
// incorrectos"). Dorado y no rojo, igual que los errores de campo.
export function FormAlert({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="flex items-start gap-2 rounded-[14px] bg-gold/25 px-3 py-2.5 text-[13px] font-bold text-gold-ink">
      <CircleAlert size={16} strokeWidth={2.2} className="mt-px flex-none text-gold-dark" aria-hidden />
      {message}
    </p>
  );
}
