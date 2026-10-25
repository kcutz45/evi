/**
 * VigilanteTema.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Componente invisible, en la raíz de la app, que mantiene
 *            el tema al día (incluido el cambio por horario).
 *
 * POR QUÉ EXISTE: El menú del avatar solo existe mientras está abierto;
 *            el reloj del modo programado tiene que correr siempre.
 * ---------------------------------------------------------------
 */
'use client';

import { useTema } from '@/hooks/useTema';

export function VigilanteTema() {
  useTema();
  return null;
}
