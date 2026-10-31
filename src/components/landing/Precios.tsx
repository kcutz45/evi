/**
 * Precios.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: "Precios claros": Gratis (Q0), Personal (Q50, destacada) y
 *            Organizador (Q150), con lo que incluye cada plan.
 *
 * POR QUÉ EXISTE: El smoke test también mide interés por pagar (§0 y
 *            §3). Gratis lleva a crear la cuenta; los planes pagados, a
 *            la lista de espera (el cobro todavía no existe en la app).
 * ---------------------------------------------------------------
 */
import Link from 'next/link';
import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';
import { RUTA_REGISTRO } from '@/lib/routes';

interface Plan {
  nombre: string;
  precio: string;
  periodo: string;
  incluye: string[];
  boton: string;
  href: string;
  destacado?: boolean;
}

const PLANES: Plan[] = [
  { nombre: 'Gratis', precio: 'Q0', periodo: 'para siempre', boton: 'Empezar gratis', href: RUTA_REGISTRO,
    incluye: ['1 evento activo a la vez', 'Gastos ilimitados con categorías', '1 reporte mensual', '1 meta de ahorro'] },
  { nombre: 'Personal', precio: 'Q50', periodo: 'al mes', boton: 'Quiero el Personal', href: '#lista', destacado: true,
    incluye: ['Eventos ilimitados', 'Reportes avanzados e historial', 'Metas de ahorro ilimitadas', 'Sin publicidad'] },
  { nombre: 'Organizador', precio: 'Q150', periodo: 'al mes', boton: 'Quiero el Organizador', href: '#lista',
    incluye: ['Todo lo del plan Personal', 'Gestión de proveedores', 'Reportes por cliente', 'Exportar a Excel'] },
];

export function Precios() {
  return (
    <section id="precios" data-seccion="precios" className="mx-auto max-w-5xl scroll-mt-20 px-4 py-12">
      <h2 className="text-center text-3xl font-black tracking-tighter">Precios claros</h2>
      <p className="mt-2 text-center text-sm font-bold text-muted">Plan anual: 2 meses gratis. Pagá por transferencia o por WhatsApp.</p>
      <ul className="mt-8 grid items-stretch gap-4 md:grid-cols-3">
        {PLANES.map((plan) => <TarjetaPlan key={plan.nombre} plan={plan} />)}
      </ul>
    </section>
  );
}

function TarjetaPlan({ plan }: { plan: Plan }) {
  const d = plan.destacado;
  return (
    <li className={cn('relative flex flex-col gap-4 rounded-sheet p-6',
      d ? 'bg-hero text-white shadow-float md:-translate-y-2' : 'bg-surface shadow-card')}>
      {d && <span className="absolute -top-3 left-6 rounded-full bg-gold px-3 py-1 text-xs font-black text-noche">Más popular</span>}
      <h3 className="text-lg font-black">{plan.nombre}</h3>
      <p className="flex items-baseline gap-1.5">
        <span className="text-4xl font-black tracking-tighter">{plan.precio}</span>
        <span className={cn('text-sm font-bold', d ? 'text-white/70' : 'text-muted-soft')}>{plan.periodo}</span>
      </p>
      <ul className="flex flex-1 flex-col gap-2.5">
        {plan.incluye.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm font-bold">
            <Check size={17} strokeWidth={2.8} className={cn('mt-0.5 flex-none', d ? 'text-mint' : 'text-mint-dark')} aria-hidden />
            {item}
          </li>
        ))}
      </ul>
      <Link href={plan.href}
        className={cn('inline-flex min-h-[50px] items-center justify-center rounded-card px-5 text-sm font-black transition',
          d ? 'bg-mint text-mint-ink shadow-glow-mint hover:brightness-95' : 'bg-primary-soft text-primary hover:bg-line')}>
        {plan.boton}
      </Link>
    </li>
  );
}
