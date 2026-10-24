/**
 * useAuth.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Expone { usuario, perfil, isLoading, error } y las
 *            acciones registrarse, iniciarSesion y cerrarSesion.
 *
 * POR QUÉ EXISTE: Frontera entre la interfaz y authService (§2.1).
 *            Además dispara la telemetría de activación (§4.3):
 *            signup_completed, signup_failed y login_succeeded, para
 *            que ningún formulario tenga que acordarse de hacerlo.
 *
 * NOTA:      Las acciones NO redirigen. Devuelven un AuthResultado y la
 *            página decide a dónde ir: el hook no conoce las rutas.
 *
 * DEPENDE DE: services/authService.ts, services/authErrors.ts,
 *            services/telemetryService.ts
 * USADO EN:   components/auth/*, app/(dashboard)/inicio/page.tsx
 * ---------------------------------------------------------------
 */
'use client';

import { useCallback, useEffect, useState } from 'react';
import * as authService from '@/services/authService';
import { codigoErrorAuth } from '@/services/authErrors';
import { track } from '@/services/telemetryService';
import type { AuthResultado, LoginDatos, RegistroDatos } from '@/types/auth';
import type { AuthUser, Profile } from '@/types/user';

function mensajeDe(err: unknown): string {
  return err instanceof Error ? err.message : 'Ocurrió un error inesperado.';
}

// Carga la sesión al montar y la limpia si se cierra en otra pestaña.
function useSesionActual() {
  const [usuario, setUsuario] = useState<AuthUser | null>(null);
  const [perfil, setPerfil] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Evita actualizar el estado si el componente ya se desmontó.
    let isActive = true;
    const cargar = async () => {
      const actual = await authService.obtenerUsuarioActual();
      const perfilActual = actual ? await authService.obtenerPerfil(actual.id) : null;
      if (isActive) { setUsuario(actual); setPerfil(perfilActual); }
    };
    cargar()
      .catch((err: unknown) => isActive && setError(mensajeDe(err)))
      .finally(() => isActive && setIsLoading(false));

    const dejarDeEscuchar = authService.escucharCierreDeSesion(() => {
      setUsuario(null);
      setPerfil(null);
    });
    return () => { isActive = false; dejarDeEscuchar(); };
  }, []);

  return { usuario, perfil, isLoading, error, setUsuario, setPerfil, setError };
}

type SetUsuario = (usuario: AuthUser | null) => void;
const EXITO: AuthResultado = { ok: true, requiereConfirmacion: false };

// duracionSegundos la mide el formulario (useSignupTracking) desde que
// se abrió /registro: es la métrica signup_duration_seconds.
async function ejecutarRegistro(
  datos: RegistroDatos,
  duracionSegundos: number,
  setUsuario: SetUsuario,
): Promise<AuthResultado> {
  try {
    const res = await authService.registrarse(datos.nombre, datos.correo, datos.contrasena);
    setUsuario(res.usuario);
    void track('signup_completed', { signup_duration_seconds: duracionSegundos });
    return { ok: true, requiereConfirmacion: !res.tieneSesion };
  } catch (err) {
    void track('signup_failed', { reason: codigoErrorAuth(err instanceof Error ? err.cause : err) });
    return { ok: false, error: mensajeDe(err) };
  }
}

async function ejecutarLogin(datos: LoginDatos, setUsuario: SetUsuario): Promise<AuthResultado> {
  try {
    setUsuario(await authService.iniciarSesion(datos.correo, datos.contrasena));
    void track('login_succeeded');
    return EXITO;
  } catch (err) {
    return { ok: false, error: mensajeDe(err) };
  }
}

export function useAuth() {
  const sesion = useSesionActual();
  const { setUsuario, setPerfil, setError } = sesion;

  const registrarse = useCallback(
    (datos: RegistroDatos, duracionSegundos: number) =>
      ejecutarRegistro(datos, duracionSegundos, setUsuario),
    [setUsuario],
  );

  const iniciarSesion = useCallback(
    (datos: LoginDatos) => ejecutarLogin(datos, setUsuario),
    [setUsuario],
  );

  const cerrarSesion = useCallback(async (): Promise<AuthResultado> => {
    try {
      await authService.cerrarSesion();
      setUsuario(null);
      setPerfil(null);
      return EXITO;
    } catch (err) {
      setError(mensajeDe(err));
      return { ok: false, error: mensajeDe(err) };
    }
  }, [setUsuario, setPerfil, setError]);

  return {
    usuario: sesion.usuario,
    perfil: sesion.perfil,
    isLoading: sesion.isLoading,
    error: sesion.error,
    registrarse,
    iniciarSesion,
    cerrarSesion,
  };
}
