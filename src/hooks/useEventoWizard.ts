/**
 * useEventoWizard.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Estado del formulario por pasos para crear un evento:
 *            1 ¿Qué evento es? → 2 ¿Cuándo es? → 3 ¿Cuánto querés gastar?
 *
 * POR QUÉ EXISTE: Mismo patrón que el registro de movimientos (una
 *            pregunta por pantalla), que fue lo que mejor entendieron los
 *            usuarios. Los componentes de cada paso solo pintan.
 *
 * DEPENDE DE: hooks/useCalculator.ts
 * USADO EN:   components/events/nuevo/EventoWizard.tsx
 * ---------------------------------------------------------------
 */
'use client';

import { useState } from 'react';
import { EVENT_ICON_NAMES } from '@/components/ui/AppIcon';
import type { NuevoEvento } from '@/types/event';
import { useCalculator } from './useCalculator';

export type PasoEvento = 'nombre' | 'fecha' | 'presupuesto';
export const PASOS_EVENTO: PasoEvento[] = ['nombre', 'fecha', 'presupuesto'];

export function useEventoWizard() {
  const presupuesto = useCalculator();
  const [paso, setPaso] = useState<PasoEvento>('nombre');
  const [nombre, setNombre] = useState('');
  const [icono, setIcono] = useState(EVENT_ICON_NAMES[0] ?? 'party-popper');
  const [fecha, setFecha] = useState('');
  const [lugar, setLugar] = useState('');

  const indice = PASOS_EVENTO.indexOf(paso);

  return {
    paso,
    numeroDePaso: indice,
    nombre, setNombre,
    icono, setIcono,
    fecha, setFecha,
    lugar, setLugar,
    presupuesto,
    // Cada paso solo deja avanzar si tiene lo mínimo.
    puedeAvanzar: paso === 'nombre' ? nombre.trim() !== '' : paso === 'fecha' ? fecha !== '' : presupuesto.esValido,
    siguiente: () => setPaso(PASOS_EVENTO[Math.min(indice + 1, PASOS_EVENTO.length - 1)] ?? 'presupuesto'),
    volver: () => setPaso(PASOS_EVENTO[Math.max(indice - 1, 0)] ?? 'nombre'),
    construir: (): NuevoEvento => ({
      name: nombre,
      icon: icono,
      eventDate: fecha,
      location: lugar.trim() || null,
      plannedBudget: presupuesto.valor ?? 0,
    }),
  };
}

export type EventoWizardEstado = ReturnType<typeof useEventoWizard>;
