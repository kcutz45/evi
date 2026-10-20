/**
 * CategoryPicker.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Carrusel horizontal de categorías, elegible con un toque.
 *
 * POR QUÉ EXISTE: Es el segundo de los 3 toques del registro. Muestra
 *            además la categoría sugerida por Gemini (§1.4) con una
 *            marca "Sugerida"; el usuario siempre puede elegir otra.
 *
 * USADO EN:   components/finance/MovementForm.tsx
 * ---------------------------------------------------------------
 */
import { Sparkles } from 'lucide-react';
import { AppIcon } from '@/components/ui/AppIcon';
import { cn } from '@/lib/cn';
import type { Category } from '@/types/category';

interface CategoryPickerProps {
  categories: Category[];
  selectedId: string | null;
  suggestedId?: string | null;
  onSelect: (categoryId: string) => void;
}

export function CategoryPicker({ categories, selectedId, suggestedId, onSelect }: CategoryPickerProps) {
  if (categories.length === 0) {
    return <p className="text-sm font-semibold text-muted">No hay categorías disponibles.</p>;
  }

  return (
    <div role="radiogroup" aria-label="Categoría" className="flex snap-x gap-2.5 overflow-x-auto pb-1.5">
      {categories.map((category) => (
        <CategoryChip
          key={category.id}
          category={category}
          isSelected={category.id === selectedId}
          isSuggested={category.id === suggestedId}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

interface CategoryChipProps {
  category: Category;
  isSelected: boolean;
  isSuggested: boolean;
  onSelect: (categoryId: string) => void;
}

function CategoryChip({ category, isSelected, isSuggested, onSelect }: CategoryChipProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      onClick={() => onSelect(category.id)}
      className={cn(
        'relative flex w-[84px] flex-none snap-start flex-col items-center gap-2 rounded-[18px] px-1.5 pb-2.5 pt-3',
        isSelected ? 'bg-primary text-white shadow-glow-primary' : 'bg-white text-dark shadow-card',
      )}
    >
      {isSuggested && !isSelected && (
        <Sparkles size={13} aria-label="Sugerida" className="absolute right-2 top-2 text-gold-dark" />
      )}
      <AppIcon name={category.icon} size={22} className={isSelected ? 'text-white' : 'text-primary'} />
      <span className="text-xs font-extrabold tracking-tight">{category.name}</span>
    </button>
  );
}
