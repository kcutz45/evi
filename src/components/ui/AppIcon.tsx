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
  Briefcase,
  Bus,
  Cake,
  Circle,
  Ellipsis,
  Film,
  Gift,
  Globe,
  GraduationCap,
  HeartPulse,
  House,
  Laptop,
  PartyPopper,
  Shirt,
  ShoppingBasket,
  Tag,
  TreePalm,
  Trophy,
  Tv,
  Utensils,
  Wallet,
  type LucideIcon,
  type LucideProps,
} from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
  banknote: Banknote,
  briefcase: Briefcase,
  bus: Bus,
  cake: Cake,
  ellipsis: Ellipsis,
  film: Film,
  gift: Gift,
  globe: Globe,
  'graduation-cap': GraduationCap,
  'heart-pulse': HeartPulse,
  house: House,
  laptop: Laptop,
  'party-popper': PartyPopper,
  shirt: Shirt,
  'shopping-basket': ShoppingBasket,
  tag: Tag,
  'tree-palm': TreePalm,
  trophy: Trophy,
  tv: Tv,
  utensils: Utensils,
  wallet: Wallet,
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
