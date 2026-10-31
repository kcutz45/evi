/**
 * Hero.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Primera pantalla de la landing: la propuesta de valor,
 *            "Empezar gratis", "Ya tengo cuenta" y el celular de muestra.
 *
 * POR QUÉ EXISTE: La métrica del smoke test depende de este mensaje
 *            (§3): si menos del 8% deja su correo, se reescribe el hero.
 *            Por eso el texto vive aquí, fácil de cambiar.
 * ---------------------------------------------------------------
 */
import Link from 'next/link';
import { ArrowRight, MapPin } from 'lucide-react';
import { RUTA_LOGIN, RUTA_REGISTRO } from '@/lib/routes';
import { MockupCelular } from './MockupCelular';

const DATOS = [
  { valor: '3 toques', texto: 'para anotar un gasto' },
  { valor: 'Q0', texto: 'para empezar, sin tarjeta' },
  { valor: '1 app', texto: 'eventos + finanzas' },
];

export function Hero() {
  return (
    <section id="inicio" data-seccion="hero" className="relative overflow-hidden">
      <span aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
      <span aria-hidden className="pointer-events-none absolute -left-24 top-60 h-72 w-72 rounded-full bg-mint/20 blur-3xl" />
      <div className="relative mx-auto grid max-w-5xl items-center gap-10 px-4 pb-16 pt-10 md:grid-cols-2 md:pt-16">
        <div className="flex flex-col gap-5">
          <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-surface px-3 py-1.5 text-xs font-extrabold text-primary shadow-card">
            <MapPin size={14} aria-hidden /> Hecho en Guatemala
          </span>
          <h1 className="text-4xl font-black leading-[1.05] tracking-tighter sm:text-5xl">
            Tus eventos y tu dinero, <span className="text-primary">en un solo lugar.</span>
          </h1>
          <p className="text-base font-semibold leading-relaxed text-muted sm:text-lg">
            Organizá la tardeada y llevá tus quetzales al día desde la misma app. Sin hojas de cálculo, sin adivinar en qué
            se te fue el mes.
          </p>
          <Botones />
          <ul className="grid grid-cols-3 gap-2 pt-2">
            {DATOS.map((d) => (
              <li key={d.valor} className="rounded-2xl bg-surface/70 p-3 shadow-card">
                <p className="text-lg font-black tracking-tight text-dark">{d.valor}</p>
                <p className="text-[11.5px] font-bold leading-snug text-muted-soft">{d.texto}</p>
              </li>
            ))}
          </ul>
        </div>
        <MockupCelular />
      </div>
    </section>
  );
}

function Botones() {
  return (
    <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
      <Link href={RUTA_REGISTRO}
        className="inline-flex min-h-[56px] items-center justify-center gap-2 rounded-card bg-primary px-6 text-base font-black text-white shadow-glow-primary transition hover:bg-primary-dark">
        Empezar gratis <ArrowRight size={19} strokeWidth={2.6} aria-hidden />
      </Link>
      <Link href={RUTA_LOGIN}
        className="inline-flex min-h-[56px] items-center justify-center rounded-card bg-surface px-6 text-base font-black text-primary shadow-card transition hover:ring-2 hover:ring-primary/30">
        Ya tengo cuenta · Iniciar sesión
      </Link>
    </div>
  );
}
