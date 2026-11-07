/**
 * useVentana.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Lo que toda ventana necesita con teclado: tomar el foco al
 *            abrir, mantener Tab adentro, cerrar con Esc y devolver el
 *            foco a donde estaba.
 *
 * POR QUÉ EXISTE: Sin esto, Tab se iba a la página de atrás (invisible
 *            detrás del fondo oscuro) y Esc no hacía nada. El foco inicial
 *            va al panel y no a un campo: en el celular no abre el teclado
 *            sin que el usuario lo pida.
 *
 * USADO EN:   components/ui/MarcoHoja.tsx, components/ui/PantallaPasoAPaso.tsx
 * ---------------------------------------------------------------
 */
'use client';

import { useEffect, useRef } from 'react';

const ENFOCABLES = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])';

function mantenerTabAdentro(e: KeyboardEvent, panel: HTMLElement) {
  const items = [...panel.querySelectorAll<HTMLElement>(ENFOCABLES)].filter((el) => el.offsetParent !== null);
  const primero = items[0];
  const ultimo = items[items.length - 1];
  if (!primero || !ultimo) return e.preventDefault();
  const activo = document.activeElement;
  const afuera = !panel.contains(activo) || activo === panel;
  if (afuera || (!e.shiftKey && activo === ultimo)) {
    e.preventDefault();
    (e.shiftKey ? ultimo : primero).focus();
  } else if (e.shiftKey && activo === primero) {
    e.preventDefault();
    ultimo.focus();
  }
}

// onEscape undefined: Esc no hace nada aquí (lo maneja el contenido).
export function useVentana<T extends HTMLElement>(onEscape?: () => void) {
  const ref = useRef<T>(null);
  const escapar = useRef(onEscape);
  escapar.current = onEscape;

  useEffect(() => {
    const panel = ref.current;
    const previo = document.activeElement as HTMLElement | null;
    if (panel && !panel.contains(previo)) panel.focus({ preventScroll: true });

    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'Escape') escapar.current?.();
      if (e.key === 'Tab' && panel) mantenerTabAdentro(e, panel);
    };
    document.addEventListener('keydown', alTeclear);
    return () => {
      document.removeEventListener('keydown', alTeclear);
      previo?.focus?.({ preventScroll: true });
    };
  }, []);

  return ref;
}
