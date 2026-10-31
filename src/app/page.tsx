/**
 * page.tsx (raíz) — Landing pública
 * ---------------------------------------------------------------
 * PROPÓSITO: Página de inicio de EVI (§3, pantalla 1): propuesta de
 *            valor, Sin EVI / Con EVI, beneficios, precios y lista de
 *            espera. Arriba, "Iniciar sesión" para quien ya tiene cuenta.
 *
 * POR QUÉ EXISTE: Es el smoke test: valida si la gente quiere EVI antes
 *            de terminarlo. Es estática (rápida y buena para buscadores);
 *            solo el formulario y la telemetría corren en el navegador.
 *            Quien ya tiene sesión no la ve: el middleware lo manda a
 *            /inicio (así también funciona el enlace de confirmar correo).
 *
 * NOTA:      /demo sigue disponible escribiendo la ruta a mano.
 * ---------------------------------------------------------------
 */
import type { Metadata } from 'next';
import { Hero } from '@/components/landing/Hero';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { ListaEspera, PieLanding } from '@/components/landing/ListaEspera';
import { Precios } from '@/components/landing/Precios';
import { Beneficios, ProblemaSolucion } from '@/components/landing/ProblemaYBeneficios';
import { TelemetriaLanding } from '@/components/landing/TelemetriaLanding';

export const metadata: Metadata = {
  title: 'EVI — Tus eventos y tu dinero, en un solo lugar',
  description: 'Organizá tus eventos y llevá tus quetzales al día desde la misma app. Gratis para empezar, hecho en Guatemala.',
};

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-light">
      <LandingHeader />
      <main>
        <Hero />
        <ProblemaSolucion />
        <Beneficios />
        <Precios />
        <ListaEspera />
      </main>
      <PieLanding />
      <TelemetriaLanding />
    </div>
  );
}
