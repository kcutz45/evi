/**
 * ComingSoon.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Pantalla temporal para las pestañas que todavía no se
 *            construyen (Dinero, Eventos, Reportes).
 *
 * POR QUÉ EXISTE: La barra de navegación del Dashboard ya las muestra;
 *            sin esto, tocarlas daba un 404. Cada página se reemplaza
 *            por la real cuando se construya.
 * ---------------------------------------------------------------
 */
import { Hammer } from 'lucide-react';
import { Header } from './Header';
import { PageContainer } from './PageContainer';

export function ComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <PageContainer>
      <Header title={title} />
      <div className="flex flex-col items-center gap-4 px-4 pt-16 text-center">
        <div className="grid h-24 w-24 place-items-center rounded-[36px] bg-primary/15 text-primary">
          <Hammer size={44} strokeWidth={1.6} aria-hidden />
        </div>
        <h2 className="text-xl font-black tracking-tight">Muy pronto</h2>
        <p className="text-sm font-semibold leading-relaxed text-muted">{description}</p>
      </div>
    </PageContainer>
  );
}
