/**
 * telemetryService.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Punto ÚNICO de registro de eventos analíticos (§4.4).
 *
 * POR QUÉ EXISTE: Si cada componente insertara en analytics_events
 *            por su cuenta, tendríamos nombres inconsistentes y el
 *            tablero de Looker Studio sería inservible.
 *
 * CORRECCIÓN v1.2: no se envía user_id. La columna tiene
 *            DEFAULT auth.uid() y la política RLS exige que coincida
 *            con la sesión: el dato queda bien atribuido sin que el
 *            cliente pueda olvidarlo ni falsearlo.
 *
 * REGLA:     Ningún componente llama a Supabase para telemetría.
 *            Todo pasa por track().
 *
 * DEPENDE DE: lib/supabase.ts, types/telemetry.ts
 * ---------------------------------------------------------------
 */
import { supabase } from '@/lib/supabase';
import type { AnalyticsEvent, DeviceType } from '@/types/telemetry';

const SESSION_KEY = 'evi_session_id';
const TABLET_MIN_WIDTH = 768;
const DESKTOP_MIN_WIDTH = 1024;

// sessionStorage puede fallar en modo privado; en ese caso usamos un id
// en memoria para que la sesión siga siendo consistente en esta pestaña.
let memorySessionId: string | null = null;

function getSessionId(): string {
  try {
    const stored = window.sessionStorage.getItem(SESSION_KEY);
    if (stored) return stored;
    const fresh = crypto.randomUUID();
    window.sessionStorage.setItem(SESSION_KEY, fresh);
    return fresh;
  } catch {
    memorySessionId ??= crypto.randomUUID();
    return memorySessionId;
  }
}

function getDeviceType(): DeviceType {
  const width = window.innerWidth;
  if (width >= DESKTOP_MIN_WIDTH) return 'desktop';
  return width >= TABLET_MIN_WIDTH ? 'tablet' : 'mobile';
}

export async function track(
  eventName: AnalyticsEvent,
  properties: Record<string, unknown> = {},
): Promise<void> {
  try {
    const { error } = await supabase.from('analytics_events').insert({
      event_name: eventName,
      properties,
      session_id: getSessionId(),
      device_type: getDeviceType(),
    });
    if (error) throw error;
  } catch (error) {
    // La telemetría NUNCA rompe la experiencia del usuario.
    console.error('[telemetry] fallo al registrar:', eventName, error);
  }
}
