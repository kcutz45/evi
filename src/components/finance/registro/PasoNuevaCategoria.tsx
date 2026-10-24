/**
 * PasoNuevaCategoria.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Pantalla "Nueva categoría" (aparte, como la Calculadora):
 *            nombre + ícono → "Crear y usar". Queda elegida y se pasa
 *            directo al monto.
 *
 * POR QUÉ EXISTE: Las 18 categorías del sistema no cubren todos los
 *            hábitos ("Gym", "Café de la U", "Mascota"). Crear una desde
 *            el mismo registro evita salir a otra pantalla de ajustes.
 *            El tipo (gasto/ingreso) es el del registro en curso.
 *
 * NOTA:      Nombre e ícono elegidos son estado visual de esta pantalla.
 *            Guardar es trabajo de la página (onCrear).
 * ---------------------------------------------------------------
 */
'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { AppIcon, ICONOS_CATEGORIA } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { NOMBRE_CATEGORIA_MAX } from '@/types/category';

interface PasoNuevaCategoriaProps {
  esIngreso: boolean;
  creando: boolean;
  error: string | null;
  onCrear: (nombre: string, icono: string) => void;
}

export function PasoNuevaCategoria({ esIngreso, creando, error, onCrear }: PasoNuevaCategoriaProps) {
  const [nombre, setNombre] = useState('');
  const [icono, setIcono] = useState<string>(ICONOS_CATEGORIA[0] ?? 'ellipsis');
  // El error solo se muestra tras intentar crear EN ESTA visita: así no
  // reaparece uno viejo al volver a abrir la pantalla.
  const [intento, setIntento] = useState(false);
  const tono = esIngreso ? 'bg-mint-soft text-mint-dark' : 'bg-primary-soft text-primary';

  return (
    <div className="flex min-h-0 flex-1 animate-step-in flex-col motion-reduce:animate-none">
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 pb-4">
        <label className="flex items-center gap-3 rounded-card bg-white p-3 shadow-card">
          <span className={cn('grid h-12 w-12 flex-none place-items-center rounded-full', tono)}>
            <AppIcon name={icono} size={24} />
          </span>
          <span className="sr-only">Nombre de la categoría</span>
          <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} autoFocus
            maxLength={NOMBRE_CATEGORIA_MAX} placeholder={esIngreso ? 'Ej. Propinas' : 'Ej. Gym'}
            className="min-w-0 flex-1 bg-transparent text-lg font-black text-dark outline-none placeholder:text-muted-faint" />
        </label>
        <SelectorIcono elegido={icono} onElegir={setIcono} />
      </div>
      <div className="flex flex-col gap-2 px-5 pb-5 pt-3">
        {intento && error && <p role="alert" className="text-center text-xs font-bold text-gold-dark">{error}</p>}
        <Button variant="mint" size="lg" fullWidth disabled={nombre.trim() === '' || creando}
          onClick={() => { setIntento(true); onCrear(nombre, icono); }} icon={<Check size={21} strokeWidth={2.6} />}>
          {creando ? 'Creando…' : 'Crear y usar'}
        </Button>
      </div>
    </div>
  );
}

function SelectorIcono({ elegido, onElegir }: { elegido: string; onElegir: (icono: string) => void }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-xs font-black uppercase tracking-widest text-muted-soft">Elegí un ícono</h3>
      <div role="radiogroup" aria-label="Ícono" className="grid grid-cols-6 gap-2">
        {ICONOS_CATEGORIA.map((nombreIcono) => (
          <button key={nombreIcono} type="button" role="radio" aria-checked={elegido === nombreIcono}
            aria-label={nombreIcono} onClick={() => onElegir(nombreIcono)}
            className={cn('grid aspect-square place-items-center rounded-tile transition active:scale-95',
              elegido === nombreIcono ? 'bg-primary text-white shadow-glow-primary' : 'bg-white text-primary shadow-card')}>
            <AppIcon name={nombreIcono} size={20} />
          </button>
        ))}
      </div>
    </section>
  );
}
