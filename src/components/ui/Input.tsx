/**
 * Input.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Campo de texto con etiqueta, ícono y mensaje de error.
 *
 * POR QUÉ EXISTE: §3 pantalla 2 — los errores van bajo cada campo y
 *            en dorado, nunca en rojo. Centralizarlo evita que alguien
 *            use text-red-500 "solo esta vez".
 *
 * NOTA:      forwardRef permite conectarlo a react-hook-form después.
 * ---------------------------------------------------------------
 */
import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  icon?: ReactNode;
  // Elemento a la derecha del campo (ej. botón "ver contraseña").
  trailing?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, icon, trailing, className, id, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const messageId = `${inputId}-message`;
  const message = error ?? hint;
  const hasMessage = Boolean(message);

  return (
    <div className="flex flex-col gap-1.5">
      {label && <label htmlFor={inputId} className="text-sm font-bold text-muted">{label}</label>}
      <div
        className={cn(
          'flex items-center gap-2 rounded-tile bg-white px-3.5 py-3 ring-1 ring-transparent',
          'focus-within:ring-primary',
          error && 'ring-gold',
        )}
      >
        {icon && <span className="flex-none text-muted-faint">{icon}</span>}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={hasMessage ? messageId : undefined}
          className={cn(
            'min-w-0 flex-1 bg-transparent text-sm font-bold text-dark outline-none',
            'placeholder:text-muted-faint',
            className,
          )}
          {...rest}
        />
        {trailing}
      </div>
      <InputMessage id={messageId} message={message} isError={Boolean(error)} />
    </div>
  );
});

// Mensaje bajo el campo: dorado si es error, gris si es una ayuda.
function InputMessage({ id, message, isError }: { id: string; message?: string; isError: boolean }) {
  if (!message) return null;
  return (
    <span id={id} className={cn('text-xs font-bold', isError ? 'text-gold-dark' : 'text-muted-soft')}>
      {message}
    </span>
  );
}
