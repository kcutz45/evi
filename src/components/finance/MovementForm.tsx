/**
 * MovementForm.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Pantalla de registro de movimiento (se abre desde el "+").
 *            Flujo de 3 toques: monto → categoría → Guardar.
 *
 * POR QUÉ EXISTE: Une las piezas (TypeToggle, CategoryPicker,
 *            EventPicker, NumericKeypad). No guarda nada: entrega el
 *            borrador validado a onSubmit y la página decide qué hacer.
 *
 * DEPENDE DE: hooks/useMovementDraft.ts
 * USADO EN:   app/(dashboard)/inicio/page.tsx (como hoja modal)
 * ---------------------------------------------------------------
 */
'use client';

import { useState } from 'react';
import { Check, NotebookPen, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { useMovementDraft } from '@/hooks/useMovementDraft';
import type { Category } from '@/types/category';
import type { MovementDraft } from '@/types/movement';
import { CategoryPicker } from './CategoryPicker';
import { EventPicker } from './EventPicker';
import { NumericKeypad } from './NumericKeypad';
import { TypeToggle } from './TypeToggle';

interface MovementFormProps {
  categories: Category[];
  activeEvents: Array<{ id: string; name: string }>;
  suggestedCategoryId?: string | null;
  isSaving?: boolean;
  // Error que devolvió el servidor al guardar (ej. evento ya cerrado).
  submitError?: string | null;
  onSubmit: (draft: MovementDraft, secondsToComplete: number) => void;
  onClose: () => void;
}

export function MovementForm(props: MovementFormProps) {
  const form = useMovementDraft();
  const [error, setError] = useState<string | null>(null);
  const isIncome = form.type === 'ingreso';

  const handleSave = () => {
    const result = form.buildDraft();
    if (!result.ok) return setError(result.error);
    setError(null);
    props.onSubmit(result.draft, result.secondsToComplete);
  };

  return (
    <div className="flex h-dvh flex-col bg-light">
      <FormHeader onClose={props.onClose} />
      <div className="px-5 pt-3.5">
        <TypeToggle value={form.type} onChange={form.setType} />
      </div>
      <AmountDisplay label={isIncome ? 'Monto del ingreso' : 'Monto del gasto'} text={form.amount.display}
        isEmpty={form.amount.isEmpty} isIncome={isIncome} />
      <div className="flex flex-col gap-2 px-5">
        <CategoryPicker categories={props.categories.filter((c) => c.kind === form.type)}
          selectedId={form.categoryId} suggestedId={props.suggestedCategoryId} onSelect={form.setCategoryId} />
        <NoteField value={form.note} onChange={form.setNote} />
        {!isIncome && <EventPicker events={props.activeEvents} selectedId={form.eventId} onSelect={form.setEventId} />}
        {(error ?? props.submitError) && (
          <p role="alert" className="text-xs font-bold text-gold-dark">{error ?? props.submitError}</p>
        )}
      </div>
      <div className="mt-auto px-4 pt-3">
        <NumericKeypad onKey={form.amount.pressKey} />
      </div>
      <div className="px-4 pb-6 pt-3.5">
        <Button variant="mint" size="lg" fullWidth icon={<Check size={21} strokeWidth={2.6} />}
          disabled={form.amount.isEmpty || props.isSaving} onClick={handleSave}>
          {props.isSaving ? 'Guardando…' : 'Guardar'}
        </Button>
      </div>
    </div>
  );
}

function FormHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex items-center gap-3 px-5 pt-4">
      <button type="button" onClick={onClose} aria-label="Cerrar"
        className="grid h-10 w-10 place-items-center rounded-[14px] bg-white hover:bg-primary-soft">
        <X size={20} strokeWidth={2.1} />
      </button>
      <h2 className="text-base font-extrabold tracking-tight">Nuevo movimiento</h2>
    </div>
  );
}

interface AmountDisplayProps {
  label: string;
  text: string;
  isEmpty: boolean;
  isIncome: boolean;
}

function AmountDisplay({ label, text, isEmpty, isIncome }: AmountDisplayProps) {
  return (
    <div className="flex flex-col items-center gap-1.5 px-5 pb-5 pt-6">
      <span className="text-[12.5px] font-extrabold uppercase tracking-widest text-muted-soft">{label}</span>
      <output aria-live="polite" className={cn('tabular text-[56px] font-black leading-none tracking-tighter',
        isEmpty ? 'text-line' : isIncome ? 'text-mint-dark' : 'text-dark')}>
        {text}
      </output>
    </div>
  );
}

function NoteField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <label className="flex items-center gap-2 rounded-tile bg-white px-3.5 py-3">
      <NotebookPen size={17} className="flex-none text-muted-faint" aria-hidden />
      <span className="sr-only">Nota</span>
      <input type="text" value={value} maxLength={140} placeholder="Nota (opcional)"
        onChange={(e) => onChange(e.target.value)}
        className="min-w-0 flex-1 bg-transparent text-[13.5px] font-bold text-dark outline-none placeholder:text-muted-faint" />
    </label>
  );
}
