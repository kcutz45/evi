/**
 * PasoCategoria.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Paso 2 del registro: ¿en qué gastaste? / ¿de dónde vino?
 *            Cuadrícula de categorías grandes; "Tus frecuentes" arriba.
 *
 * POR QUÉ EXISTE: Una cuadrícula con íconos grandes se recorre de un
 *            vistazo (como elegir un contacto). Las frecuentes salen de
 *            lo que el usuario registra (lib/categoryRanking.ts), así
 *            el registro se adapta a sus hábitos sin configurar nada.
 * ---------------------------------------------------------------
 */
import type { ReactNode } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { AppIcon } from '@/components/ui/AppIcon';
import { ordenarPorFrecuencia } from '@/lib/categoryRanking';
import { cn } from '@/lib/cn';
import type { Category } from '@/types/category';

interface PasoCategoriaProps {
  categorias: Category[];
  usos: string[];
  seleccionadaId: string | null;
  onElegir: (id: string) => void;
  // Abre la pantalla "Nueva categoría".
  onNueva: () => void;
}

export function PasoCategoria({ categorias, usos, seleccionadaId, onElegir, onNueva }: PasoCategoriaProps) {
  const { frecuentes, resto } = ordenarPorFrecuencia(categorias, usos);

  if (categorias.length === 0) {
    return <p className="px-5 text-sm font-semibold text-muted">Cargando categorías…</p>;
  }

  return (
    <div className="flex min-h-0 flex-1 animate-step-in flex-col gap-5 overflow-y-auto px-5 pb-6 motion-reduce:animate-none">
      {frecuentes.length > 0 && (
        <Grupo titulo="Tus frecuentes" icono>
          {frecuentes.map((c) => (
            <Mosaico key={c.id} categoria={c} activa={c.id === seleccionadaId} onElegir={onElegir} />
          ))}
        </Grupo>
      )}
      <Grupo titulo={frecuentes.length > 0 ? 'Todas' : 'Elegí una'}>
        {resto.map((c) => (
          <Mosaico key={c.id} categoria={c} activa={c.id === seleccionadaId} onElegir={onElegir} />
        ))}
        <MosaicoNueva onClick={onNueva} />
      </Grupo>
    </div>
  );
}

function Grupo({ titulo, icono = false, children }: { titulo: string; icono?: boolean; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2.5">
      <h3 className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-muted-soft">
        {icono && <Sparkles size={14} className="text-gold-dark" aria-hidden />}
        {titulo}
      </h3>
      <div className="grid grid-cols-3 gap-2.5">{children}</div>
    </section>
  );
}

interface MosaicoProps {
  categoria: Category;
  activa: boolean;
  onElegir: (id: string) => void;
}

function Mosaico({ categoria, activa, onElegir }: MosaicoProps) {
  return (
    <button type="button" onClick={() => onElegir(categoria.id)} aria-pressed={activa}
      className={cn(
        'flex min-h-[96px] flex-col items-center justify-center gap-2 rounded-[18px] px-1 py-3 transition active:scale-95',
        activa ? 'bg-primary text-white shadow-glow-primary' : 'bg-white text-dark shadow-card hover:ring-2 hover:ring-primary/30',
      )}>
      <span className={cn('grid h-11 w-11 place-items-center rounded-full',
        activa ? 'bg-white/20' : categoria.kind === 'ingreso' ? 'bg-mint-soft text-mint-dark' : 'bg-primary-soft text-primary')}>
        <AppIcon name={categoria.icon} size={22} strokeWidth={2} />
      </span>
      <span className="text-center text-[13px] font-extrabold leading-tight tracking-tight">{categoria.name}</span>
    </button>
  );
}

// Último mosaico: crear una categoría propia. Borde punteado para que se
// vea como "agregar" y no como una categoría más.
function MosaicoNueva({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className="flex min-h-[96px] flex-col items-center justify-center gap-2 rounded-[18px] border-2 border-dashed border-primary/40 px-1 py-3 text-primary transition hover:bg-primary-soft active:scale-95">
      <span className="grid h-11 w-11 place-items-center rounded-full bg-primary-soft">
        <Plus size={22} strokeWidth={2.4} aria-hidden />
      </span>
      <span className="text-center text-[13px] font-extrabold leading-tight">Nueva categoría</span>
    </button>
  );
}
