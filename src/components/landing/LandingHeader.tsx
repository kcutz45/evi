/**
 * LandingHeader.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Barra de arriba de la landing: logo, enlaces a Beneficios y
 *            Precios, "Iniciar sesión" y "Empezar gratis".
 *
 * POR QUÉ EXISTE: Quien ya tiene cuenta necesita entrar en un toque
 *            desde la página de inicio; quien no, ve el botón principal.
 *            Se queda pegada arriba al bajar (sticky) con fondo de vidrio.
 * ---------------------------------------------------------------
 */
import Link from 'next/link';
import { LogIn } from 'lucide-react';
import { IsotipoEvi, LogoEvi } from '@/components/ui/Logo';
import { RUTA_LOGIN, RUTA_REGISTRO } from '@/lib/routes';

// Marca completa (isotipo + logotipo): la versión de la guía para la landing.
export function MarcaEvi() {
  return (
    <span className="flex items-center gap-2">
      <IsotipoEvi className="h-7 w-7" />
      <LogoEvi className="w-[62px]" />
    </span>
  );
}

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line/60 bg-light/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <Link href="#inicio" aria-label="EVI, ir al inicio de la página"><MarcaEvi /></Link>
        <nav aria-label="Secciones" className="hidden items-center gap-6 text-sm font-extrabold text-muted md:flex">
          <a href="#beneficios" className="hover:text-primary">Beneficios</a>
          <a href="#precios" className="hover:text-primary">Precios</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link href={RUTA_LOGIN}
            className="inline-flex h-10 items-center gap-1.5 rounded-full px-3.5 text-sm font-black text-primary hover:bg-primary-soft">
            <LogIn size={17} aria-hidden /> Iniciar sesión
          </Link>
          <Link href={RUTA_REGISTRO}
            className="hidden h-10 items-center rounded-full bg-primary px-4 text-sm font-black text-white shadow-glow-primary hover:bg-primary-dark sm:inline-flex">
            Empezar gratis
          </Link>
        </div>
      </div>
    </header>
  );
}
