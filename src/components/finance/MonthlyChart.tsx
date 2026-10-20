/**
 * MonthlyChart.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Dona del reporte mensual con la categoría mayor al centro
 *            y la leyenda con porcentajes al lado.
 *
 * POR QUÉ EXISTE: Recibe las porciones ya ordenadas y coloreadas por
 *            lib/report.ts. Recharts necesita los colores como texto;
 *            vienen de styles/tokens.ts, nunca escritos aquí.
 *
 * USADO EN:   app/(dashboard)/reportes/page.tsx
 * ---------------------------------------------------------------
 */
'use client';

import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/Card';
import { toPercent } from '@/lib/budget';
import type { CategorySlice } from '@/types/category';

const DONUT_INNER_RADIUS = '68%';
const DONUT_OUTER_RADIUS = '100%';

export function MonthlyChart({ slices }: { slices: CategorySlice[] }) {
  const top = slices[0];

  if (!top) {
    return (
      <Card className="p-5 text-center text-sm font-semibold text-muted">
        Sin gastos confirmados este mes. Cuando registrés gastos, acá vas a ver en qué se te va el dinero.
      </Card>
    );
  }

  return (
    <Card className="flex items-center gap-4 p-[18px]">
      <div className="relative h-[148px] w-[148px] flex-none">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={slices} dataKey="amount" nameKey="name" innerRadius={DONUT_INNER_RADIUS}
              outerRadius={DONUT_OUTER_RADIUS} startAngle={90} endAngle={-270} stroke="none" isAnimationActive>
              {slices.map((slice) => (
                <Cell key={slice.categoryId} fill={slice.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-soft">Mayor</span>
          <span className="text-[17px] font-black tracking-tight">{top.name}</span>
          <span className="text-[12.5px] font-extrabold text-primary">{toPercent(top.share)}%</span>
        </div>
      </div>
      <ChartLegend slices={slices} />
    </Card>
  );
}

function ChartLegend({ slices }: { slices: CategorySlice[] }) {
  return (
    <ul className="flex min-w-0 flex-1 flex-col gap-2">
      {slices.map((slice) => (
        <li key={slice.categoryId} className="flex items-center gap-2">
          {/* SVG con fill como atributo: el color es dato, no estilo inline. */}
          <svg width="10" height="10" aria-hidden className="flex-none">
            <rect width="10" height="10" rx="3" fill={slice.color} />
          </svg>
          <span className="flex-1 truncate text-[12.5px] font-bold text-closed-ink">{slice.name}</span>
          <span className="tabular text-[12.5px] font-black">{toPercent(slice.share)}%</span>
        </li>
      ))}
    </ul>
  );
}
