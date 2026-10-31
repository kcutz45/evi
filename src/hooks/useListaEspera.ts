/**
 * useListaEspera.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Formulario "Entrá a la lista de espera" de la landing:
 *            valida el correo, lo guarda y registra waitlist_submitted.
 *
 * POR QUÉ EXISTE: Frontera entre la landing y waitlistService (§2.1).
 *            La fuente (utm_source o el sitio de donde vino) mide qué
 *            canal trae más interesados.
 *
 * DEPENDE DE: services/waitlistService.ts, services/telemetryService.ts
 * USADO EN:   components/landing/ListaEspera.tsx
 * ---------------------------------------------------------------
 */
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { track } from '@/services/telemetryService';
import { unirseALista } from '@/services/waitlistService';
import { recuperarSchema } from '@/types/auth';
import type { PlanName } from '@/types/database';

function fuenteDeLaVisita(): string | null {
  const utm = new URLSearchParams(window.location.search).get('utm_source');
  return utm ?? (document.referrer ? new URL(document.referrer).hostname : null);
}

export function useListaEspera() {
  const [correo, setCorreo] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listo, setListo] = useState(false);

  const enviar = async (plan: PlanName | null = null) => {
    const r = recuperarSchema.safeParse({ correo });
    if (!r.success) return setError(r.error.issues[0]?.message ?? 'Revisá tu correo');
    setEnviando(true);
    setError(null);
    try {
      await unirseALista(supabase, r.data.correo, plan, fuenteDeLaVisita());
      void track('waitlist_submitted', { plan_interest: plan });
      setListo(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos anotarte.');
    } finally {
      setEnviando(false);
    }
  };

  return { correo, setCorreo, enviando, error, listo, enviar };
}
