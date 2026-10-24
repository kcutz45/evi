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
  Car,
  Circle,
  Coffee,
  Dumbbell,
  Ellipsis,
  Film,
  Fuel,
  Gamepad2,
  Gift,
  Globe,
  GraduationCap,
  HeartPulse,
  House,
  Laptop,
  PartyPopper,
  PawPrint,
  Plane,
  Shirt,
  ShoppingBasket,
  Smartphone,
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
  car: Car,
  coffee: Coffee,
  dumbbell: Dumbbell,
  ellipsis: Ellipsis,
  film: Film,
  fuel: Fuel,
  'gamepad-2': Gamepad2,
  gift: Gift,
  globe: Globe,
  'graduation-cap': GraduationCap,
  'heart-pulse': HeartPulse,
  house: House,
  laptop: Laptop,
  'party-popper': PartyPopper,
  'paw-print': PawPrint,
  plane: Plane,
  shirt: Shirt,
  'shopping-basket': ShoppingBasket,
  smartphone: Smartphone,
  tag: Tag,
  'tree-palm': TreePalm,
  trophy: Trophy,
  tv: Tv,
  utensils: Utensils,
  wallet: Wallet,
};

// Íconos que se ofrecen al crear una categoría propia (orden de la cuadrícula).
export const ICONOS_CATEGORIA = [
  'utensils', 'coffee', 'shopping-basket', 'bus', 'car', 'fuel', 'house', 'graduation-cap',
  'heart-pulse', 'dumbbell', 'party-popper', 'film', 'gamepad-2', 'tv', 'smartphone', 'shirt',
  'gift', 'paw-print', 'plane', 'briefcase', 'laptop', 'tag', 'globe', 'wallet', 'banknote', 'ellipsis',
];

// Nombres disponibles para el selector de ícono al crear un evento.
export const EVENT_ICON_NAMES = [
  'party-popper', 'cake', 'utensils', 'tree-palm', 'plane', 'trophy', 'film', 'gift', 'graduation-cap', 'house',
];

interface AppIconProps extends LucideProps {
  name: string;
}

export function AppIcon({ name, ...props }: AppIconProps) {
  // Un nombre desconocido (dato viejo o mal escrito) muestra un círculo
  // en vez de romper la pantalla.
  const Icon = ICONS[name] ?? Circle;
  return <Icon aria-hidden {...props} />;
}
