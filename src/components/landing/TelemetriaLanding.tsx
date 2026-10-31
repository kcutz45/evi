/**
 * TelemetriaLanding.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Componente invisible que registra landing_viewed al abrir
 *            la página y landing_section_viewed cuando cada sección
 *            (marcada con data-seccion) aparece en pantalla.
 *
 * POR QUÉ EXISTE: La métrica del smoke test necesita saber cuántos
 *            visitantes hubo y hasta dónde bajaron (§3 y §4.3). La landing
 *            es estática (rápida y buena para buscadores); solo esta
 *            pieza corre en el navegador.
 * ---------------------------------------------------------------
 */
'use client';

import { useEffect } from 'react';
import { track } from '@/services/telemetryService';

const VISIBLE = 0.4;

export function TelemetriaLanding() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    void track('landing_viewed', { referrer: document.referrer || null, utm_source: params.get('utm_source') });

    const vistas = new Set<string>();
    const observador = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => {
        const seccion = (e.target as HTMLElement).dataset.seccion;
        if (!e.isIntersecting || !seccion || vistas.has(seccion)) return;
        vistas.add(seccion);
        void track('landing_section_viewed', { section: seccion });
      });
    }, { threshold: VISIBLE });
    document.querySelectorAll('[data-seccion]').forEach((el) => observador.observe(el));
    return () => observador.disconnect();
  }, []);

  return null;
}
