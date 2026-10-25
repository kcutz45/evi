/**
 * MenuTema.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Sección "Apariencia" del menú del avatar: Claro, Oscuro
 *            (de una vez) o Programado, con el horario "de … a …".
 *
 * POR QUÉ EXISTE: De noche la pantalla clara encandila; hay quien la
 *            quiere oscura siempre y quien solo de noche. El horario se
 *            guarda en este celular (lib/tema.ts).
 * ---------------------------------------------------------------
 */
'use client';

import { Clock, Moon, Sun, type LucideIcon } from 'lucide-react';
import { useTema } from '@/hooks/useTema';
import { cn } from '@/lib/cn';
import type { ModoTema } from '@/lib/tema';

const MODOS: Array<{ modo: ModoTema; etiqueta: string; Icono: LucideIcon }> = [
  { modo: 'claro', etiqueta: 'Claro', Icono: Sun },
  { modo: 'oscuro', etiqueta: 'Oscuro', Icono: Moon },
  { modo: 'programado', etiqueta: 'Horario', Icono: Clock },
];

export function MenuTema() {
  const { pref, cambiar, oscuroAhora } = useTema();
  return (
    <div className="flex flex-col gap-2 border-b border-line px-3 py-3">
      <span className="text-xs font-black uppercase tracking-widest text-muted-soft">Apariencia</span>
      <div role="radiogroup" aria-label="Tema" className="grid grid-cols-3 gap-1 rounded-xl bg-light p-1">
        {MODOS.map(({ modo, etiqueta, Icono }) => (
          <button key={modo} type="button" role="radio" aria-checked={pref.modo === modo} onClick={() => cambiar({ modo })}
            className={cn('flex flex-col items-center gap-0.5 rounded-lg py-1.5 text-[11.5px] font-extrabold transition',
              pref.modo === modo ? 'bg-surface text-primary shadow-card' : 'text-muted hover:text-dark')}>
            <Icono size={16} aria-hidden /> {etiqueta}
          </button>
        ))}
      </div>
      {pref.modo === 'programado' && (
        <div className="flex flex-col gap-1.5">
          <div className="grid grid-cols-2 gap-2">
            <Hora etiqueta="Oscuro desde" valor={pref.desde} onCambiar={(desde) => cambiar({ desde })} />
            <Hora etiqueta="hasta" valor={pref.hasta} onCambiar={(hasta) => cambiar({ hasta })} />
          </div>
          <span className="text-[11.5px] font-bold text-muted-soft">Ahora: {oscuroAhora ? 'oscuro 🌙' : 'claro ☀️'}</span>
        </div>
      )}
    </div>
  );
}

function Hora({ etiqueta, valor, onCambiar }: { etiqueta: string; valor: string; onCambiar: (hora: string) => void }) {
  return (
    <label className="flex flex-col gap-0.5">
      <span className="text-[11px] font-bold text-muted">{etiqueta}</span>
      <input type="time" value={valor} required onChange={(e) => e.target.value && onCambiar(e.target.value)}
        className="tabular rounded-lg bg-light px-2 py-1.5 text-sm font-extrabold text-dark outline-none focus:ring-2 focus:ring-primary" />
    </label>
  );
}
