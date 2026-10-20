/**
 * page.tsx (raíz)
 * ---------------------------------------------------------------
 * TEMPORAL: mientras no exista la landing (app/(marketing)/page.tsx),
 *           la raíz manda a la vitrina de componentes. Borrar este
 *           archivo cuando se cree la landing: ambos usan la ruta "/".
 * ---------------------------------------------------------------
 */
import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/demo');
}
