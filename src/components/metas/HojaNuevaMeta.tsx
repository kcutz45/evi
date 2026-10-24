/**
 * HojaNuevaMeta.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: "Nueva meta": nombre, ícono, cuánto querés juntar y una
 *            fecha opcional.
 *
 * POR QUÉ EXISTE: "Poné un nombre y un monto, y EVI te va llevando la
 *            cuenta" (diseño de Metas). La fecha es opcional para no
 *            asustar a quien solo quiere empezar con poquito.
 * ---------------------------------------------------------------
 */
'use client';

import { useState } from 'react';
import { FormAlert } from '@/components/auth/AuthHeading';
import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { CampoMonto } from '@/components/ui/CampoMonto';
import { Hoja } from '@/components/ui/Hoja';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/cn';
import { hoyGT } from '@/lib/dates';
import { leerMonto } from '@/lib/formatCurrency';
import { ICONOS_META, NOMBRE_META_MAX, type NuevaMeta } from '@/types/goal';

interface HojaNuevaMetaProps {
  guardando: boolean;
  error: string | null;
  onCrear: (datos: NuevaMeta) => Promise<boolean>;
  onCerrar: () => void;
}

export function HojaNuevaMeta({ guardando, error, onCrear, onCerrar }: HojaNuevaMetaProps) {
  const [nombre, setNombre] = useState('');
  const [icono, setIcono] = useState(ICONOS_META[0] ?? 'piggy-bank');
  const [texto, setTexto] = useState('');
  const [fecha, setFecha] = useState('');
  const objetivo = leerMonto(texto);

  const crear = async () => {
    if (objetivo && (await onCrear({ nombre, icono, objetivo, fechaLimite: fecha || null }))) onCerrar();
  };

  return (
    <Hoja titulo="Nueva meta" subtitulo="¿Para qué estás ahorrando? Se vale empezar con poquito." onCerrar={onCerrar}>
      <Input label="Nombre" value={nombre} maxLength={NOMBRE_META_MAX} placeholder="Ej. Laptop nueva"
        onChange={(e) => setNombre(e.target.value)} />
      <div role="radiogroup" aria-label="Ícono de la meta" className="grid grid-cols-5 gap-2">
        {ICONOS_META.map((i) => (
          <button key={i} type="button" role="radio" aria-checked={icono === i} aria-label={i} onClick={() => setIcono(i)}
            className={cn('grid aspect-square place-items-center rounded-tile transition active:scale-95',
              icono === i ? 'bg-primary text-white shadow-glow-primary' : 'bg-white text-primary shadow-card')}>
            <AppIcon name={i} size={20} />
          </button>
        ))}
      </div>
      <CampoMonto etiqueta="¿Cuánto querés juntar?" valor={texto} onCambiar={setTexto} />
      <Input label="¿Para cuándo? (opcional)" type="date" value={fecha} min={hoyGT()} onChange={(e) => setFecha(e.target.value)} />
      <FormAlert message={texto && objetivo === null ? 'Escribí un monto válido, por ejemplo 2000' : error} />
      <Button variant="mint" size="lg" fullWidth disabled={guardando || nombre.trim() === '' || !objetivo} onClick={crear}>
        {guardando ? 'Creando…' : 'Crear meta'}
      </Button>
    </Hoja>
  );
}
