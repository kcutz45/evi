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
 * DEPENDE DE: nada.
 * USADO EN:   tailwind.config.ts, lib/chartColors.ts
 * ---------------------------------------------------------------
 */

export const colors = {
  primary: { DEFAULT: '#6C3BF4', dark: '#5528DC', deep: '#4A21C4', soft: '#EFE9FF' },
  mint: { DEFAULT: '#2EE6A8', dark: '#0E8F63', ink: '#08301F', soft: '#E1FBF1' },
  gold: { DEFAULT: '#FFD166', dark: '#8A6207', ink: '#5B4712', soft: '#FFF3D8' },
  dark: '#1A1035',
  light: '#F5F2FF',
  muted: { DEFAULT: '#6F669B', soft: '#8B83AD', faint: '#A49CC4' },
  line: '#EBE5FC',
  track: '#F2EEFF',
  closed: { DEFAULT: '#EFEBFA', ink: '#4B4370', badge: '#DCD5F0' },
} as const;

// Paleta categórica para la dona del reporte mensual. El orden importa:
// la categoría con más gasto siempre toma el primer color (la marca).
export const chartPalette = [
  colors.primary.DEFAULT,
  colors.mint.DEFAULT,
  colors.gold.DEFAULT,
  colors.primary.deep,
  colors.mint.dark,
  colors.muted.faint,
] as const;
