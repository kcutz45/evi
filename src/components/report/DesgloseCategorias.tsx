/**
 * DesgloseCategorias.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Lista "Por categoría": cada categoría con su monto, su
 *            porcentaje y una barra relativa a la mayor.
 *
 * POR QUÉ EXISTE: La dona da la idea general; esta lista da los
 *            números exactos. La barra es un SVG con el ancho como
 *            atributo: el color y el tamaño son datos, no estilo inline.
 * ---------------------------------------------------------------
 */
import { AppIcon } from '@/components/ui/AppIcon';
import { toPercent } from '@/lib/budget';
import { formatCurrency } from '@/lib/formatCurrency';
import type { CategorySlice } from '@/types/category';

const ALTO_BARRA = 6;

export function DesgloseCategorias({ slices }: { slices: CategorySlice[] }) {
  const mayor = slices[0]?.amount ?? 0;
  if (mayor <= 0) return null;
  return (
    <section className="flex flex-col gap-2.5">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-black tracking-tight">Por categoría</h2>
        <span className="text-xs font-bold text-muted-soft">De mayor a menor</span>
      </div>
      <ul className="flex flex-col gap-2">
        {slices.map((s) => (
          <li key={s.categoryId} className="flex items-center gap-3 rounded-[18px] bg-white p-3.5 shadow-card">
            <span className="grid h-10 w-10 flex-none place-items-center rounded-tile bg-primary-soft text-primary">
              <AppIcon name={s.icon} size={19} />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate text-[14.5px] font-extrabold">{s.name}</span>
                <span className="tabular text-[14.5px] font-black">{formatCurrency(s.amount)}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg width="100%" height={ALTO_BARRA} aria-hidden className="block flex-1">
                  <rect width="100%" height={ALTO_BARRA} rx={ALTO_BARRA / 2} className="fill-track" />
                  <rect width={`${(s.amount / mayor) * 100}%`} height={ALTO_BARRA} rx={ALTO_BARRA / 2} fill={s.color} />
                </svg>
                <span className="tabular w-9 text-right text-xs font-extrabold text-muted-soft">{toPercent(s.share)}%</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
