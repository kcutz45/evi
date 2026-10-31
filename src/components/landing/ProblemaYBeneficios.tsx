/**
 * ProblemaYBeneficios.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Dos secciones de la landing: "Sin EVI / Con EVI" (el
 *            problema contra la solución) y "Tres cosas que EVI hace
 *            mejor".
 *
 * POR QUÉ EXISTE: Wireframe de §3 (pantalla 1). El contraste oscuro vs.
 *            menta deja claro el antes y el después sin leer mucho.
 * ---------------------------------------------------------------
 */
import { ArrowLeftRight, CalendarCheck, Check, X, Zap, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

const SIN_EVI = [
  'Notas del celular que se pierden',
  'Te pasás del presupuesto y lo ves hasta el final',
  'Doble trabajo: el evento por un lado y tus cuentas por otro',
];

const CON_EVI = [
  'Un gasto anotado en 3 toques',
  'El presupuesto del evento en vivo',
  'Aviso al 80%, antes de pasarte',
  'Al cerrar el evento, sus gastos pasan solos a tus finanzas',
];

const BENEFICIOS: Array<{ titulo: string; texto: string; Icono: LucideIcon; tono: string }> = [
  { titulo: 'Registrá gastos en segundos', Icono: Zap, tono: 'bg-primary-soft text-primary',
    texto: 'Teclado grande, categorías de un toque y listo. Tres toques y el gasto ya está anotado.' },
  { titulo: 'Organizá eventos sin caos', Icono: CalendarCheck, tono: 'bg-gold/25 text-gold-dark',
    texto: 'Presupuesto, tareas y gastos del evento. EVI te avisa antes de que se te pase el gasto.' },
  { titulo: 'Vé todo junto, automático', Icono: ArrowLeftRight, tono: 'bg-mint-soft text-mint-dark',
    texto: 'Al cerrar un evento sus gastos pasan solos a tu reporte del mes. Un solo lugar, siempre al día.' },
];

export function ProblemaSolucion() {
  return (
    <section data-seccion="problema" className="mx-auto grid max-w-5xl gap-4 px-4 py-12 md:grid-cols-2">
      <Lista titulo="Sin EVI" items={SIN_EVI} oscura />
      <Lista titulo="Con EVI" items={CON_EVI} />
    </section>
  );
}

function Lista({ titulo, items, oscura = false }: { titulo: string; items: string[]; oscura?: boolean }) {
  const Icono = oscura ? X : Check;
  return (
    <div className={cn('flex flex-col gap-4 rounded-sheet p-6', oscura ? 'bg-noche text-white' : 'bg-mint text-mint-ink')}>
      <h2 className="text-2xl font-black tracking-tight">{titulo}</h2>
      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-[15px] font-bold leading-snug">
            <Icono size={19} strokeWidth={2.8} className={cn('mt-0.5 flex-none', oscura ? 'text-gold' : 'text-mint-ink')} aria-hidden />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Beneficios() {
  return (
    <section id="beneficios" data-seccion="beneficios" className="mx-auto max-w-5xl scroll-mt-20 px-4 py-12">
      <h2 className="text-center text-3xl font-black tracking-tighter">Tres cosas que EVI hace mejor</h2>
      <ul className="mt-8 grid gap-4 md:grid-cols-3">
        {BENEFICIOS.map(({ titulo, texto, Icono, tono }) => (
          <li key={titulo} className="flex flex-col gap-3 rounded-sheet bg-surface p-6 shadow-card">
            <span className={cn('grid h-12 w-12 place-items-center rounded-tile', tono)}><Icono size={24} aria-hidden /></span>
            <h3 className="text-lg font-black tracking-tight">{titulo}</h3>
            <p className="text-sm font-semibold leading-relaxed text-muted">{texto}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
