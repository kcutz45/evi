/**
 * prueba/CategoryCheckList.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Pinta las categorías recibidas (nombre, ícono y nombre del
 *            ícono guardado en la base) y los estados de carga y error.
 *
 * POR QUÉ EXISTE: Aunque la página es temporal, respeta la regla
 *            central (§2.1): este componente recibe props y pinta; no
 *            sabe de dónde vienen los datos.
 *
 * TEMPORAL:  Vive dentro de app/prueba para borrarse junto con ella.
 *
 * DEPENDE DE: components/ui/AppIcon.tsx, components/ui/Card.tsx
 * USADO EN:   app/prueba/page.tsx
 * ---------------------------------------------------------------
 */
import { AppIcon } from '@/components/ui/AppIcon';
import { Card } from '@/components/ui/Card';
import type { Category } from '@/types/category';

interface CategoryCheckListProps {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
}

export function CategoryCheckList({ categories, isLoading, error }: CategoryCheckListProps) {
  if (isLoading) {
    return <p className="font-semibold text-muted-soft">Consultando Supabase…</p>;
  }

  if (error) {
    return (
      <Card className="border-2 border-gold">
        <p className="font-extrabold">❌ La conexión falló</p>
        <p className="mt-1 text-sm font-semibold">{error}</p>
      </Card>
    );
  }

  return (
    <>
      <p className="mb-3 font-extrabold text-mint-dark">
        ✅ Conexión correcta: {categories.length} categorías del sistema
      </p>
      <ul className="flex flex-col gap-2">
        {categories.map((category) => (
          <li key={category.id}>
            <Card className="flex items-center gap-3 p-3">
              <span className="grid h-10 w-10 flex-none place-items-center rounded-tile bg-primary-soft text-primary">
                <AppIcon name={category.icon} size={20} strokeWidth={1.9} />
              </span>
              <span className="flex-1 font-extrabold">{category.name}</span>
              <code className="text-xs text-muted-soft">{category.icon}</code>
            </Card>
          </li>
        ))}
      </ul>
    </>
  );
}
