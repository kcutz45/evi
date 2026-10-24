/**
 * PasoDividir.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: "¿Con quién dividís?": las personas que te deben parte de
 *            la cuenta, cuánto pone cada una y cuánto queda como tu gasto.
 *
 * POR QUÉ EXISTE: Arranca en partes iguales (lo más común) y deja
 *            cambiar el monto de cualquiera. "Tu parte" se ve grande y
 *            se explica qué pasa con el resto, para que nadie se confunda
 *            pensando que el balance bajó los Q300 completos.
 *
 * DEPENDE DE: hooks/useDivision.ts
 * ---------------------------------------------------------------
 */
import { Check, Plus, UserRound, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { Division, FilaPersona } from '@/hooks/useDivision';
import { cn } from '@/lib/cn';
import { formatCurrency } from '@/lib/formatCurrency';

interface PasoDividirProps {
  total: number;
  division: Division;
  errorServidor: string | null;
  guardando: boolean;
  onGuardar: () => void;
}

export function PasoDividir({ total, division: d, errorServidor, guardando, onGuardar }: PasoDividirProps) {
  const miParteValida = d.miParte > 0;
  return (
    <div className="flex min-h-0 flex-1 animate-step-in flex-col motion-reduce:animate-none">
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 pb-4">
        <p className="text-sm font-bold text-muted">Total de la cuenta: <strong className="text-dark">{formatCurrency(total)}</strong></p>
        <ul className="flex flex-col gap-2">
          {d.filas.map((fila, i) => (
            <FilaDeudor key={fila.id} fila={fila} numero={i + 1} puedeQuitar={d.filas.length > 1}
              onNombre={(v) => d.cambiarNombre(fila.id, v)} onMonto={(v) => d.cambiarMonto(fila.id, v)}
              onQuitar={() => d.quitar(fila.id)} />
          ))}
        </ul>
        <div className="flex gap-2">
          {d.puedeAgregar && (
            <Button variant="soft" className="flex-1" icon={<Plus size={17} aria-hidden />} onClick={d.agregar}>Otra persona</Button>
          )}
          <Button variant="ghost" className="flex-1" onClick={d.repartirIgual}>Partes iguales</Button>
        </div>
      </div>
      <div className="flex flex-col gap-3 border-t border-line bg-light px-5 pb-5 pt-3">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-extrabold text-muted">Tu parte (tu gasto)</span>
          <span className={cn('tabular text-3xl font-black tracking-tighter', miParteValida ? 'text-dark' : 'text-gold-dark')}>
            {formatCurrency(d.miParte)}
          </span>
        </div>
        <p role={d.error || errorServidor ? 'alert' : undefined}
          className={cn('text-xs font-bold leading-snug', d.error || errorServidor ? 'text-gold-dark' : 'text-muted-soft')}>
          {errorServidor ?? d.error ?? `Lo demás (${formatCurrency(total - d.miParte)}) queda en «Te deben» hasta que te paguen.`}
        </p>
        <Button variant="mint" size="lg" fullWidth disabled={d.error !== null || guardando} onClick={onGuardar}
          icon={<Check size={21} strokeWidth={2.6} />}>
          {guardando ? 'Guardando…' : 'Guardar y anotar deudas'}
        </Button>
      </div>
    </div>
  );
}

interface FilaDeudorProps {
  fila: FilaPersona;
  numero: number;
  puedeQuitar: boolean;
  onNombre: (valor: string) => void;
  onMonto: (valor: string) => void;
  onQuitar: () => void;
}

function FilaDeudor({ fila, numero, puedeQuitar, onNombre, onMonto, onQuitar }: FilaDeudorProps) {
  return (
    <li className="flex items-center gap-2 rounded-tile bg-white p-2 pl-3 shadow-card">
      <UserRound size={18} className="flex-none text-primary" aria-hidden />
      <input type="text" value={fila.nombre} maxLength={60} placeholder={`Persona ${numero}`}
        aria-label={`Nombre de la persona ${numero}`} onChange={(e) => onNombre(e.target.value)}
        className="min-w-0 flex-1 bg-transparent text-sm font-bold text-dark outline-none placeholder:text-muted-faint" />
      <label className="flex w-28 flex-none items-center gap-1 rounded-xl bg-light px-2.5 py-2">
        <span className="text-sm font-black text-muted-soft">Q</span>
        <input type="text" inputMode="decimal" value={fila.montoTexto} aria-label={`Monto de la persona ${numero}`}
          onChange={(e) => onMonto(e.target.value)}
          className="tabular min-w-0 flex-1 bg-transparent text-right text-sm font-black text-dark outline-none" />
      </label>
      {puedeQuitar && (
        <button type="button" onClick={onQuitar} aria-label={`Quitar persona ${numero}`}
          className="grid h-8 w-8 flex-none place-items-center rounded-lg text-muted-faint hover:bg-light">
          <X size={16} aria-hidden />
        </button>
      )}
    </li>
  );
}
