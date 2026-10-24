/**
 * useDivision.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Estado del paso "¿Con quién dividís?": las personas, lo
 *            que pone cada una y tu parte.
 *
 * POR QUÉ EXISTE: Por defecto se reparte en partes iguales (lo más
 *            común). Si el usuario cambia el monto de alguien, ese monto
 *            se respeta y los demás siguen en partes iguales. Las cuentas
 *            viven en lib/split.ts.
 *
 * DEPENDE DE: lib/split.ts
 * USADO EN:   components/finance/registro/RegistroWizard.tsx
 * ---------------------------------------------------------------
 */
'use client';

import { useRef, useState } from 'react';
import { MAX_PERSONAS_DIVISION, calcularMiParte, leerMonto, parteIgual, validarDivision } from '@/lib/split';
import type { Deudor } from '@/types/receivable';

export interface FilaPersona {
  id: number;
  nombre: string;
  montoTexto: string;
  // true = el usuario escribió el monto; ya no se recalcula solo.
  editado: boolean;
}

const filaNueva = (id: number): FilaPersona => ({ id, nombre: '', montoTexto: '', editado: false });

export function useDivision(total: number) {
  const [filas, setFilas] = useState<FilaPersona[]>([filaNueva(1)]);
  const siguienteId = useRef(2);

  // Partes iguales contándote a vos (+1). Se recalcula en cada render,
  // así si el total cambia, los montos automáticos lo siguen.
  const igual = parteIgual(total, filas.length + 1);
  const vistas = filas.map((f) => (f.editado ? f : { ...f, montoTexto: igual.toFixed(2) }));
  const deudores: Deudor[] = vistas.map((f) => ({ nombre: f.nombre, monto: leerMonto(f.montoTexto) ?? 0 }));

  const cambiar = (id: number, cambios: Partial<FilaPersona>) =>
    setFilas((actual) => actual.map((f) => (f.id === id ? { ...f, ...cambios } : f)));

  return {
    filas: vistas,
    deudores,
    miParte: calcularMiParte(total, deudores),
    error: validarDivision(total, deudores),
    puedeAgregar: filas.length < MAX_PERSONAS_DIVISION,
    agregar: () => setFilas((actual) => [...actual, filaNueva(siguienteId.current++)]),
    quitar: (id: number) => setFilas((actual) => (actual.length > 1 ? actual.filter((f) => f.id !== id) : actual)),
    cambiarNombre: (id: number, nombre: string) => cambiar(id, { nombre }),
    cambiarMonto: (id: number, montoTexto: string) => cambiar(id, { montoTexto, editado: true }),
    repartirIgual: () => setFilas((actual) => actual.map((f) => ({ ...f, editado: false }))),
  };
}

export type Division = ReturnType<typeof useDivision>;
