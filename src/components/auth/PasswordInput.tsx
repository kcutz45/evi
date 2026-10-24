/**
 * PasswordInput.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Campo de contraseña con botón para mostrarla u ocultarla.
 *
 * POR QUÉ EXISTE: En el celular es fácil equivocarse con una tecla. Ver
 *            lo que se escribió evita el error "contraseña incorrecta"
 *            justo en el primer intento (§3, pantalla 2: [ojo]).
 *
 * NOTA:      Mostrar/ocultar es estado visual, por eso vive aquí.
 * ---------------------------------------------------------------
 */
'use client';

import { forwardRef, useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/Input';

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  hint?: string;
  error?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput(props, ref) {
    const [isVisible, setIsVisible] = useState(false);

    return (
      <Input
        ref={ref}
        {...props}
        type={isVisible ? 'text' : 'password'}
        trailing={
          <button
            type="button"
            onClick={() => setIsVisible((visible) => !visible)}
            aria-label={isVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            className="flex-none text-muted-faint hover:text-primary"
          >
            {isVisible ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
          </button>
        }
      />
    );
  },
);
