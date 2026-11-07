/**
 * useTeclaEsc.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Ejecuta una acción al presionar Esc.
 *
 * POR QUÉ EXISTE: En PC, Esc es la forma natural de salir: vuelve un
 *            paso en el registro y cierra el menú del avatar.
 *
 * USADO EN:   finance/registro/WizardHeader.tsx, layout/UserMenu.tsx
 * ---------------------------------------------------------------
 */
'use client';

import { useEffect, useRef } from 'react';

export function useTeclaEsc(accion: () => void, activo = true) {
  // En un ref: el escuchador no se vuelve a registrar en cada render.
  const actual = useRef(accion);
  actual.current = accion;

  useEffect(() => {
    if (!activo) return;
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'Escape') actual.current();
    };
    window.addEventListener('keydown', alTeclear);
    return () => window.removeEventListener('keydown', alTeclear);
  }, [activo]);
}
