/**
 * useSignupTracking.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Registra signup_started al abrir /registro y mide cuántos
 *            segundos tarda el usuario en completar el formulario.
 *
 * POR QUÉ EXISTE: signup_duration_seconds (§4.3) dice si el registro
 *            "de un solo paso" de verdad es rápido. El inicio se mide
 *            aquí y no en useAuth porque useAuth también se usa en
 *            pantallas que no son el registro.
 *
 * DEPENDE DE: services/telemetryService.ts
 * USADO EN:   components/auth/RegistroForm.tsx
 * ---------------------------------------------------------------
 */
'use client';

import { useCallback, useEffect, useRef } from 'react';
import { track } from '@/services/telemetryService';

const MS_POR_SEGUNDO = 1000;

export function useSignupTracking(source: string) {
  // useRef: el momento de inicio no debe provocar renders.
  const inicio = useRef(Date.now());

  useEffect(() => {
    inicio.current = Date.now();
    void track('signup_started', { source });
  }, [source]);

  return useCallback(() => Math.round((Date.now() - inicio.current) / MS_POR_SEGUNDO), []);
}
