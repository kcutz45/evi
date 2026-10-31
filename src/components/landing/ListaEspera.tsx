/**
 * ListaEspera.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: "Entrá a la lista de espera": correo + botón, y el ¡Listo!
 *            al enviarlo. También el pie de la landing.
 *
 * POR QUÉ EXISTE: Es el corazón del smoke test (§3): mide cuánta gente
 *            quiere EVI antes de terminarlo. Guardar es trabajo de
 *            useListaEspera; aquí solo se pinta.
 * ---------------------------------------------------------------
 */
'use client';

import type { FormEvent } from 'react';
import { CircleCheck, Mail } from 'lucide-react';
import { FormAlert } from '@/components/auth/AuthHeading';
import { useListaEspera } from '@/hooks/useListaEspera';
import { MarcaEvi } from './LandingHeader';

export function ListaEspera() {
  const lista = useListaEspera();
  const enviar = (e: FormEvent) => {
    e.preventDefault();
    void lista.enviar();
  };

  return (
    <section id="lista" data-seccion="formulario" className="mx-auto max-w-5xl scroll-mt-20 px-4 py-12">
      <div className="relative overflow-hidden rounded-sheet bg-hero px-6 py-10 text-center text-white shadow-float">
        <span aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-mint/30 blur-3xl" />
        <h2 className="relative text-3xl font-black tracking-tighter">Entrá a la lista de espera</h2>
        <p className="relative mt-2 text-sm font-bold text-white/80">Te avisamos cuando abramos cupos. Sin spam, solo el aviso.</p>
        {lista.listo ? (
          <p role="status" className="vidrio relative mx-auto mt-6 flex max-w-md items-center justify-center gap-2 rounded-card px-4 py-4 text-base font-black">
            <CircleCheck size={22} className="text-mint" aria-hidden /> ¡Listo! Te escribimos pronto.
          </p>
        ) : (
          <form onSubmit={enviar} noValidate className="relative mx-auto mt-6 flex max-w-md flex-col gap-2.5 sm:flex-row">
            <label className="flex flex-1 items-center gap-2 rounded-card bg-white px-4 text-noche">
              <Mail size={18} className="flex-none text-muted-faint" aria-hidden />
              <span className="sr-only">Tu correo</span>
              <input type="email" inputMode="email" autoComplete="email" value={lista.correo} placeholder="tu@correo.com"
                onChange={(e) => lista.setCorreo(e.target.value)}
                className="h-14 min-w-0 flex-1 bg-transparent text-base font-bold outline-none placeholder:text-muted-faint" />
            </label>
            <button type="submit" disabled={lista.enviando}
              className="h-14 rounded-card bg-mint px-6 text-base font-black text-mint-ink shadow-glow-mint transition hover:brightness-95 disabled:opacity-60">
              {lista.enviando ? 'Enviando…' : 'Quiero probarla'}
            </button>
          </form>
        )}
        {lista.error && <div className="relative mx-auto mt-3 max-w-md text-left"><FormAlert message={lista.error} /></div>}
      </div>
    </section>
  );
}

export function PieLanding() {
  return (
    <footer className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-4 pb-10 pt-4 text-center sm:flex-row sm:justify-between">
      <MarcaEvi />
      <p className="text-xs font-bold text-muted-soft">EVI · Guatemala, 2026 · Proyecto académico UMES</p>
    </footer>
  );
}
