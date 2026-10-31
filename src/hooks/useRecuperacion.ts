/**
 * useRecuperacion.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: "¿Olvidaste tu contraseña?": pedir el correo con el enlace
 *            y, al volver del enlace, guardar la contraseña nueva.
 *
 * POR QUÉ EXISTE: Frontera entre las pantallas /recuperar y
 *            /nueva-contrasena y authService (§2.1). El enlace del correo
 *            vuelve a /auth/confirm, que abre la sesión y manda a
 *            /nueva-contrasena.
 *
 * DEPENDE DE: services/authService.ts, lib/routes.ts
 * USADO EN:   components/auth/RecuperarForm.tsx, NuevaContrasenaForm.tsx
 * ---------------------------------------------------------------
 */
'use client';

import { useState } from 'react';
import { RUTA_NUEVA_CONTRASENA } from '@/lib/routes';
import * as authService from '@/services/authService';

const mensajeDe = (err: unknown) => (err instanceof Error ? err.message : 'Ocurrió un error inesperado.');

export function useRecuperacion() {
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Envuelve la acción: espera, error y devuelve true si salió bien.
  const ejecutar = async (accion: () => Promise<void>) => {
    setEnviando(true);
    setError(null);
    try {
      await accion();
      return true;
    } catch (err) {
      setError(mensajeDe(err));
      return false;
    } finally {
      setEnviando(false);
    }
  };

  return {
    enviando,
    error,
    pedirEnlace: (correo: string) => ejecutar(() => {
      const volverA = `${window.location.origin}/auth/confirm?next=${RUTA_NUEVA_CONTRASENA}`;
      return authService.pedirRecuperacion(correo, volverA);
    }),
    guardarNueva: (contrasena: string) => ejecutar(() => authService.cambiarContrasena(contrasena)),
  };
}
