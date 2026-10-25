/**
 * useTema.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Preferencia de tema del usuario (claro, oscuro o
 *            programado) y si ahora mismo se ve oscuro.
 *
 * POR QUÉ EXISTE: Con el modo programado hay que revisar la hora cada
 *            minuto: a las 18:00 la app se oscurece sola, sin recargar.
 *
 * DEPENDE DE: lib/tema.ts
 * USADO EN:   components/layout/MenuTema.tsx, components/layout/VigilanteTema.tsx
 * ---------------------------------------------------------------
 */
'use client';

import { useEffect, useState } from 'react';
import {
  EVENTO_TEMA, TEMA_POR_DEFECTO, aplicarTema, debeSerOscuro, guardarPreferencia, leerPreferencia, type PreferenciaTema,
} from '@/lib/tema';

const UN_MINUTO = 60_000;

export function useTema() {
  // Arranca con el valor por defecto y lee el guardado ya en el
  // navegador: así el HTML del servidor y el del cliente coinciden.
  const [pref, setPref] = useState<PreferenciaTema>(TEMA_POR_DEFECTO);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    const releer = () => setPref(leerPreferencia());
    releer();
    setListo(true);
    window.addEventListener(EVENTO_TEMA, releer);
    return () => window.removeEventListener(EVENTO_TEMA, releer);
  }, []);

  useEffect(() => {
    if (!listo) return;
    aplicarTema(debeSerOscuro(pref));
    if (pref.modo !== 'programado') return;
    const reloj = window.setInterval(() => aplicarTema(debeSerOscuro(pref)), UN_MINUTO);
    return () => window.clearInterval(reloj);
  }, [pref, listo]);

  const cambiar = (cambios: Partial<PreferenciaTema>) => {
    const nueva = { ...pref, ...cambios };
    setPref(nueva);
    guardarPreferencia(nueva);
  };

  return { pref, cambiar, oscuroAhora: debeSerOscuro(pref) };
}
