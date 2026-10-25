/**
 * tokens.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Única fuente de verdad de los colores de EVI.
 *
 * POR QUÉ EXISTE: La regla anti-spaghetti #2 prohíbe escribir colores
 *            como '#6C3BF4' en los componentes. Tailwind lee estos
 *            valores (tailwind.config.ts) y las gráficas de Recharts,
 *            que necesitan el color como texto, también los importan
 *            de aquí. Así un cambio de marca se hace en UN archivo.
 *
 * MODO OSCURO: los colores que cambian entre claro y oscuro (fondo,
 *            superficies, texto, líneas, tonos suaves) son variables
 *            CSS definidas en styles/globals.css (:root y .dark). Los
 *            de marca (morado, menta, dorado) son fijos en ambos modos.
 *
 * DEPENDE DE: styles/globals.css (variables --c-*).
 * USADO EN:   tailwind.config.ts, lib/report.ts, app/layout.tsx
 * ---------------------------------------------------------------
 */

// Color que cambia con el tema: Tailwind le agrega la opacidad (bg-surface/70).
const tema = (variable: string) => `rgb(var(--c-${variable}) / <alpha-value>)`;

// Colores de marca en hex: iguales en claro y oscuro.
export const marca = {
  primary: '#6C3BF4',
  primaryDark: '#5528DC',
  primaryDeep: '#4A21C4',
  mint: '#2EE6A8',
  mintInk: '#08301F',
  gold: '#FFD166',
  noche: '#1A1035',
  mutedFaint: '#A49CC4',
} as const;

export const colors = {
  primary: { DEFAULT: marca.primary, dark: marca.primaryDark, deep: marca.primaryDeep, soft: tema('primary-soft') },
  mint: { DEFAULT: marca.mint, dark: tema('mint-dark'), ink: marca.mintInk, soft: tema('mint-soft') },
  gold: { DEFAULT: marca.gold, dark: tema('gold-dark'), ink: tema('gold-ink'), soft: tema('gold-soft') },
  // Texto principal ("tinta"): casi negro en claro, casi blanco en oscuro.
  dark: tema('ink'),
  // Fondo de la app.
  light: tema('fondo'),
  // Tarjetas, hojas y campos (antes bg-white).
  surface: tema('superficie'),
  // Siempre oscuro, en ambos modos (pantalla de la calculadora).
  noche: marca.noche,
  muted: { DEFAULT: tema('muted'), soft: tema('muted-soft'), faint: tema('muted-faint') },
  line: tema('line'),
  track: tema('track'),
  closed: { DEFAULT: tema('closed'), ink: tema('closed-ink'), badge: tema('closed-badge') },
} as const;

// Paleta categórica para la dona del reporte mensual. El orden importa:
// la categoría con más gasto siempre toma el primer color (la marca).
export const chartPalette = [
  marca.primary,
  marca.mint,
  marca.gold,
  marca.primaryDeep,
  '#0E8F63',
  marca.mutedFaint,
] as const;
