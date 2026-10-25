/**
 * HojaNuevaCuenta.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: "Nueva cuenta": nombre, tipo (efectivo, banco, billetera,
 *            otra) y cuánto tenés ahí hoy.
 *
 * POR QUÉ EXISTE: "Lo que tenés hoy" es el saldo inicial: NO cuenta
 *            como ingreso del mes (§12 de schema.sql). El ícono sale
 *            del tipo, así es un toque menos.
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
import { leerMonto } from '@/lib/formatCurrency';
import { NOMBRE_CUENTA_MAX, TIPOS_DE_CUENTA, type AccountKind, type NuevaCuenta } from '@/types/account';

interface HojaNuevaCuentaProps {
  guardando: boolean;
  error: string | null;
  onCrear: (datos: NuevaCuenta) => Promise<boolean>;
  onCerrar: () => void;
}

export function HojaNuevaCuenta({ guardando, error, onCrear, onCerrar }: HojaNuevaCuentaProps) {
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState<AccountKind>('banco');
  const [saldo, setSaldo] = useState('');
  const monto = saldo.trim() === '' ? 0 : leerMonto(saldo);

  const crear = async () => {
    if (monto !== null && (await onCrear({ nombre, tipo, saldoActual: monto }))) onCerrar();
  };

  return (
    <Hoja titulo="Nueva cuenta" subtitulo="Un banco, una billetera digital o donde guardés dinero." onCerrar={onCerrar}>
      <div role="radiogroup" aria-label="Tipo de cuenta" className="grid grid-cols-2 gap-2">
        {TIPOS_DE_CUENTA.map((t) => (
          <button key={t.tipo} type="button" role="radio" aria-checked={tipo === t.tipo} onClick={() => setTipo(t.tipo)}
            className={cn('flex items-center gap-2 rounded-tile px-3 py-3 text-sm font-extrabold transition active:scale-95',
              tipo === t.tipo ? 'bg-primary text-white shadow-glow-primary' : 'bg-surface text-dark shadow-card')}>
            <AppIcon name={t.icono} size={18} /> {t.etiqueta}
          </button>
        ))}
      </div>
      <Input label="Nombre" value={nombre} maxLength={NOMBRE_CUENTA_MAX} placeholder="Ej. Banco Industrial"
        onChange={(e) => setNombre(e.target.value)} />
      <CampoMonto etiqueta="¿Cuánto tenés ahí hoy?" valor={saldo} onCambiar={setSaldo} />
      <p className="text-xs font-bold text-muted-soft">No cuenta como ingreso: es tu punto de partida.</p>
      <FormAlert message={monto === null ? 'Escribí un monto válido, por ejemplo 1250.50' : error} />
      <Button variant="mint" size="lg" fullWidth disabled={guardando || nombre.trim() === '' || monto === null} onClick={crear}>
        {guardando ? 'Creando…' : 'Crear cuenta'}
      </Button>
    </Hoja>
  );
}
