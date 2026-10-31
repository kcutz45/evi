/**
 * OpcionesCuenta.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Apartado plegado "Opciones de la cuenta" al final del
 *            historial: "Corregir saldo" y "Quitar cuenta" (con
 *            confirmación).
 *
 * POR QUÉ EXISTE: Antes, tocar una cuenta abría directo el ajuste de
 *            saldo y era fácil cambiarlo sin querer. Ahora las acciones
 *            delicadas están escondidas tras un toque más y confirmadas.
 * ---------------------------------------------------------------
 */
'use client';

import { useState } from 'react';
import { ChevronDown, PencilLine, Settings, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

interface OpcionesCuentaProps {
  nombre: string;
  ocupado: boolean;
  onCorregir: () => void;
  onQuitar: () => void;
}

export function OpcionesCuenta({ nombre, ocupado, onCorregir, onQuitar }: OpcionesCuentaProps) {
  const [abierto, setAbierto] = useState(false);
  const [confirmarQuitar, setConfirmarQuitar] = useState(false);
  return (
    <section className="rounded-card bg-surface shadow-card">
      <button type="button" onClick={() => setAbierto((a) => !a)} aria-expanded={abierto}
        className="flex w-full items-center gap-2 px-4 py-3.5 text-sm font-extrabold text-muted">
        <Settings size={17} aria-hidden /> Opciones de la cuenta
        <ChevronDown size={17} className={cn('ml-auto transition-transform', abierto && 'rotate-180')} aria-hidden />
      </button>
      {abierto && (
        <div className="flex flex-col gap-2 border-t border-line px-4 pb-4 pt-3">
          <Button variant="soft" fullWidth icon={<PencilLine size={17} aria-hidden />} onClick={onCorregir}>Corregir saldo</Button>
          {confirmarQuitar ? (
            <div className="flex flex-col gap-2 rounded-tile bg-light p-3">
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
        </div>
      )}
    </section>
  );
}
