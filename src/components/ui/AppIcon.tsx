/**
 * AppIcon.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Pinta un ícono de Lucide a partir de su nombre guardado
 *            en la base (categories.icon, events.icon).
 *
 * POR QUÉ EXISTE: Importar TODO Lucide para buscar por nombre pesaría
 *            cientos de KB. Este registro solo incluye los íconos que
 *            EVI ofrece; agregar uno nuevo es agregar una línea aquí.
 * ---------------------------------------------------------------
 */
import {
  Banknote,
  Bus,
  Cake,
  Circle,
  Ellipsis,
  Film,
  GraduationCap,
  HeartPulse,
  House,
  PartyPopper,
  ShoppingBasket,
  TreePalm,
  Trophy,
  Utensils,
  type LucideIcon,
  type LucideProps,
} from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
  banknote: Banknote,
  bus: Bus,
  cake: Cake,
  ellipsis: Ellipsis,
  film: Film,
  'graduation-cap': GraduationCap,
  'heart-pulse': HeartPulse,
  house: House,
  'party-popper': PartyPopper,
  'shopping-basket': ShoppingBasket,
  'tree-palm': TreePalm,
  trophy: Trophy,
  utensils: Utensils,
};

// Nombres disponibles para el selector de ícono al crear un evento.
export const EVENT_ICON_NAMES = ['party-popper', 'cake', 'utensils', 'tree-palm', 'trophy', 'film'];

interface AppIconProps extends LucideProps {
  name: string;
}

export function AppIcon({ name, ...props }: AppIconProps) {
  // Un nombre desconocido (dato viejo o mal escrito) muestra un círculo
  // en vez de romper la pantalla.
  const Icon = ICONS[name] ?? Circle;
  return <Icon aria-hidden {...props} />;
}
