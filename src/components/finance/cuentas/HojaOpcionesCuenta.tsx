/**
 * HojaOpcionesCuenta.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Hoja "Opciones de la cuenta" que abre la tuerquita de la
 *            tarjeta: "Corregir saldo" y "Quitar cuenta" (con
 *            confirmación).
 *
 * POR QUÉ EXISTE: Antes, tocar una cuenta abría directo el ajuste de
 *            saldo y era fácil cambiarlo sin querer. Ahora las acciones
 *            delicadas están detrás de la tuerquita y se confirman.
 * ---------------------------------------------------------------
 */
'use client';

import { useState } from 'react';
import { PencilLine, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Hoja } from '@/components/ui/Hoja';

interface HojaOpcionesCuentaProps {
  nombre: string;
  ocupado: boolean;
  onCorregir: () => void;
  onQuitar: () => void;
  onCerrar: () => void;
}

export function HojaOpcionesCuenta({ nombre, ocupado, onCorregir, onQuitar, onCerrar }: HojaOpcionesCuentaProps) {
  const [confirmarQuitar, setConfirmarQuitar] = useState(false);
  return (
    <Hoja titulo="Opciones de la cuenta" subtitulo={nombre} onCerrar={onCerrar}>
      <Button variant="soft" size="lg" fullWidth icon={<PencilLine size={18} aria-hidden />} onClick={onCorregir}>
        Corregir saldo
      </Button>
      {confirmarQuitar ? (
        <div className="flex flex-col gap-2 rounded-tile bg-surface p-3 shadow-card">
          <p className="text-[12.5px] font-bold text-muted">
            {nombre} deja de aparecer y no suma a «Tu dinero hoy». Sus movimientos se conservan.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="ghost" onClick={() => setConfirmarQuitar(false)}>Cancelar</Button>
            <Button variant="soft" disabled={ocupado} onClick={onQuitar}>Sí, quitar</Button>
          </div>
        </div>
      ) : (
        <Button variant="ghost" fullWidth icon={<Trash2 size={17} aria-hidden />} onClick={() => setConfirmarQuitar(true)}>
          Quitar esta cuenta
        </Button>
      )}
    </Hoja>
  );
}
