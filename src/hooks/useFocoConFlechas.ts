/**
 * useFocoConFlechas.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Moverse por una lista o cuadrícula de botones con el
 *            teclado: flechas, escribir las primeras letras ("des" →
 *            Despensa) y atajos de una letra (data-atajo="g").
 *
 * POR QUÉ EXISTE: Con 18 categorías, llegar a una con Tab son muchos
 *            toques. Enter ya activa el botón enfocado. En PC el primer
 *            botón (o el elegido) toma el foco solo; en pantallas táctiles
 *            no, para no dejar un botón marcado sin que nadie lo tocara.
 *
 * USADO EN:   registro/PasoTipo, PasoCategoria, PasoCuenta y los
 *            selectores de ícono y tipo.
 * ---------------------------------------------------------------
 */
'use client';

import { useEffect, useRef } from 'react';
import { tieneMouse } from '@/lib/dispositivo';

const ESPERA_ENTRE_LETRAS_MS = 700;
const FLECHAS = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];

const normalizar = (texto: string) => texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

const centro = (el: HTMLElement) => {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
};

// Arriba/abajo: el botón más cercano en otra fila; así funciona igual en
// una lista que en una cuadrícula de 3 columnas.
function vecinoVertical(botones: HTMLElement[], actual: HTMLElement, sentido: 1 | -1) {
  const a = centro(actual);
  const candidatos = botones.filter((b) => b !== actual && (centro(b).y - a.y) * sentido > 4);
  return candidatos.sort((p, q) => {
    const [cp, cq] = [centro(p), centro(q)];
    return Math.abs(cp.y - a.y) + Math.abs(cp.x - a.x) * 2 - (Math.abs(cq.y - a.y) + Math.abs(cq.x - a.x) * 2);
  })[0];
}

function moverConFlecha(e: KeyboardEvent, botones: HTMLElement[]) {
  const actual = document.activeElement as HTMLElement;
  const i = botones.indexOf(actual);
  if (i < 0) return botones[0]?.focus();
  const destino = e.key === 'ArrowRight' ? botones[i + 1]
    : e.key === 'ArrowLeft' ? botones[i - 1]
      : vecinoVertical(botones, actual, e.key === 'ArrowDown' ? 1 : -1);
  destino?.focus();
}

// Maneja las teclas de una zona de botones. Devuelve el escuchador y cómo limpiarlo.
function crearManejador(zona: HTMLElement) {
  const botones = () => [...zona.querySelectorAll<HTMLElement>('button:not([disabled])')];
  let letras = '';
  let reloj = 0;

  const alTeclear = (e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey || e.altKey || (e.target as HTMLElement).tagName === 'INPUT') return;
    if (FLECHAS.includes(e.key)) {
      e.preventDefault();
      return moverConFlecha(e, botones());
    }
    if (e.key.length !== 1 || e.key === ' ') return;
    const atajo = zona.querySelector<HTMLElement>(`[data-atajo="${CSS.escape(e.key.toLowerCase())}"]`);
    if (atajo) return atajo.click();
    window.clearTimeout(reloj);
    reloj = window.setTimeout(() => { letras = ''; }, ESPERA_ENTRE_LETRAS_MS);
    letras += normalizar(e.key);
    botones().find((b) => normalizar(b.getAttribute('aria-label') ?? b.textContent ?? '').startsWith(letras))?.focus();
  };
  return { alTeclear, botones, limpiar: () => window.clearTimeout(reloj) };
}

// enfocar: es el paso principal de la pantalla; toma el foco en PC y
// escucha en toda la ventana (las teclas sirven aunque se haga clic afuera).
// clave: si cambia (ej. ya cargaron las categorías), se vuelve a preparar.
export function useFocoConFlechas<T extends HTMLElement>({ enfocar = false, clave = 0 }: { enfocar?: boolean; clave?: number } = {}) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const zona = ref.current;
    if (!zona) return;
    const { alTeclear, botones, limpiar } = crearManejador(zona);
    if (enfocar && tieneMouse()) {
      const elegido = zona.querySelector<HTMLElement>('[aria-pressed="true"], [aria-checked="true"]');
      (elegido ?? botones()[0])?.focus({ preventScroll: true });
    }
    const objetivo: HTMLElement | Window = enfocar ? window : zona;
    objetivo.addEventListener('keydown', alTeclear as EventListener);
    return () => {
      objetivo.removeEventListener('keydown', alTeclear as EventListener);
      limpiar();
    };
  }, [enfocar, clave]);

  return ref;
}
