/**
 * MockupCelular.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Celular dibujado con el Inicio de EVI adentro (balance y
 *            últimos movimientos), para el lado derecho del hero.
 *
 * POR QUÉ EXISTE: Mostrar la app vende más que describirla. Es HTML, no
 *            una imagen: se ve nítido en cualquier pantalla, pesa casi
 *            nada y respeta el modo oscuro. Flota suavemente (animación).
 * ---------------------------------------------------------------
 */
import { AppIcon } from '@/components/ui/AppIcon';
import { Brillo } from '@/components/ui/Brillo';
import { MontoGrande } from '@/components/ui/MontoGrande';
import { cn } from '@/lib/cn';

const MOVIMIENTOS = [
  { nombre: 'Cuota tardeada Antigua', meta: 'Eventos · hoy', monto: '+Q350.00', icono: 'party-popper', ingreso: true },
  { nombre: 'Súper La Torre', meta: 'Despensa · ayer', monto: '−Q412.75', icono: 'shopping-basket', ingreso: false },
  { nombre: 'Pago de freelance', meta: 'Ingreso · 26 sep', monto: '+Q2,800.00', icono: 'laptop', ingreso: true },
];

export function MockupCelular() {
  return (
    <div aria-hidden className="mx-auto w-[280px] animate-flota rounded-[44px] bg-noche p-3 shadow-float motion-reduce:animate-none">
      <div className="flex flex-col gap-3 overflow-hidden rounded-[34px] bg-light px-4 pb-5 pt-6">
        <div>
          <span className="text-xs font-semibold text-muted">Buen día,</span>
          <p className="text-lg font-black tracking-tight">Andrea</p>
        </div>
        <div className="relative overflow-hidden rounded-card bg-hero p-4 text-white">
          <Brillo />
          <span className="relative text-[10px] font-bold uppercase tracking-wider text-white/70">Balance del mes</span>
          <MontoGrande monto={4820.5} className="relative mt-1.5 text-[30px] text-mint" />
          <span className="vidrio relative mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-extrabold">↑ 12.4% vs. septiembre</span>
        </div>
        <ul className="flex flex-col gap-2">
          {MOVIMIENTOS.map((m) => (
            <li key={m.nombre} className="flex items-center gap-2.5 rounded-2xl bg-surface p-2.5 shadow-card">
              <span className={cn('grid h-8 w-8 place-items-center rounded-xl', m.ingreso ? 'bg-mint-soft text-mint-dark' : 'bg-gold-soft text-gold-dark')}>
                <AppIcon name={m.icono} size={15} />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-[11.5px] font-extrabold">{m.nombre}</span>
                <span className="text-[10px] font-semibold text-muted-soft">{m.meta}</span>
              </span>
              <span className={cn('tabular text-[11.5px] font-black', m.ingreso ? 'text-mint-dark' : 'text-dark')}>{m.monto}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
