/**
 * TarjetasMeta.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: La meta principal (grande, con anillo de avance) y las
 *            demás (compactas, con barra), cada una con "Abonar".
 *
 * POR QUÉ EXISTE: Ver el avance motiva a seguir ahorrando. Anillo y
 *            barra son SVG con el tamaño como atributo: el avance es un
 *            dato, no estilo inline. Solo avisan: guardar es del hook.
 * ---------------------------------------------------------------
 */
import { Check, Minus, Plus } from 'lucide-react';
import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { toPercent } from '@/lib/budget';
import { formatCurrency } from '@/lib/formatCurrency';
import { avance, faltante } from '@/lib/metas';
import type { Meta } from '@/types/goal';

const RADIO = 37;
const CIRCUNFERENCIA = 2 * Math.PI * RADIO;
const ALTO_BARRA = 8;

interface AccionesMeta {
  onAbonar: (meta: Meta) => void;
  onRetirar: (meta: Meta) => void;
}

export function MetaDestacada({ meta, onAbonar, onRetirar }: { meta: Meta } & AccionesMeta) {
  const frac = avance(meta);
  return (
    <Card variant="hero" className="p-5">
      <div className="relative flex items-center gap-4">
        <svg width="92" height="92" viewBox="0 0 92 92" role="img" aria-label={`${toPercent(frac)}% ahorrado`} className="flex-none -rotate-90">
          <circle cx="46" cy="46" r={RADIO} strokeWidth="9" fill="none" className="stroke-white/20" />
          <circle cx="46" cy="46" r={RADIO} strokeWidth="9" fill="none" strokeLinecap="round" className="stroke-mint"
            strokeDasharray={`${CIRCUNFERENCIA * frac} ${CIRCUNFERENCIA}`} />
        </svg>
        <span className="absolute left-0 grid h-[92px] w-[92px] place-items-center text-lg font-black">{toPercent(frac)}%</span>
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-xs font-bold uppercase tracking-wider text-white/70">Meta principal</span>
          <span className="truncate text-lg font-black">{meta.nombre}</span>
          <span className="tabular text-[22px] font-black leading-tight text-mint">{formatCurrency(meta.ahorrado)}</span>
          <span className="tabular text-xs font-bold text-white/80">
            de {formatCurrency(meta.objetivo)} · {meta.estado === 'completada' ? '¡cumplida!' : `faltan ${formatCurrency(faltante(meta))}`}
          </span>
        </div>
      </div>
      <div className="relative mt-4 grid grid-cols-2 gap-2.5">
        <Button variant="mint" icon={<Plus size={18} strokeWidth={2.6} />} onClick={() => onAbonar(meta)}>Abonar</Button>
        <Button variant="soft" icon={<Minus size={18} strokeWidth={2.6} />} disabled={meta.ahorrado <= 0} onClick={() => onRetirar(meta)}>
          Retirar
        </Button>
      </div>
    </Card>
  );
}

export function TarjetaMeta({ meta, onAbonar, onRetirar }: { meta: Meta } & AccionesMeta) {
  const frac = avance(meta);
  const cumplida = meta.estado === 'completada';
  return (
    <li className="flex flex-col gap-2.5 rounded-card bg-white p-4 shadow-card">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 flex-none place-items-center rounded-tile bg-primary-soft text-primary">
          <AppIcon name={meta.icono} size={20} />
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-[15px] font-extrabold">{meta.nombre}</span>
          <span className="tabular text-xs font-bold text-muted-soft">{formatCurrency(meta.ahorrado)} de {formatCurrency(meta.objetivo)}</span>
        </div>
        <span className="tabular text-sm font-black text-primary">{toPercent(frac)}%</span>
      </div>
      <svg width="100%" height={ALTO_BARRA} aria-hidden className="block">
        <rect width="100%" height={ALTO_BARRA} rx={ALTO_BARRA / 2} className="fill-track" />
        <rect width={`${frac * 100}%`} height={ALTO_BARRA} rx={ALTO_BARRA / 2} className={cumplida ? 'fill-mint' : 'fill-primary'} />
      </svg>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-muted-soft">
          {cumplida ? <span className="inline-flex items-center gap-1 text-mint-dark"><Check size={14} /> ¡Cumplida!</span> : `Te faltan ${formatCurrency(faltante(meta))}`}
        </span>
        <div className="flex gap-1.5">
          {meta.ahorrado > 0 && <Accion onClick={() => onRetirar(meta)}>Retirar</Accion>}
          <Accion onClick={() => onAbonar(meta)} principal>+ Abonar</Accion>
        </div>
      </div>
    </li>
  );
}

function Accion({ onClick, principal = false, children }: { onClick: () => void; principal?: boolean; children: string }) {
  return (
    <button type="button" onClick={onClick}
      className={principal ? 'rounded-full bg-primary px-3.5 py-1.5 text-xs font-black text-white hover:bg-primary-dark'
        : 'rounded-full bg-primary-soft px-3 py-1.5 text-xs font-black text-primary hover:bg-line'}>
      {children}
    </button>
  );
}
