/**
 * tailwind.config.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Sistema de diseño de EVI expresado como clases.
 *
 * POR QUÉ EXISTE: Los componentes solo usan clases (bg-primary,
 *            rounded-card...). Los valores viven aquí y en
 *            src/styles/tokens.ts, nunca sueltos en el JSX.
 * ---------------------------------------------------------------
 */
import type { Config } from 'tailwindcss';
import { colors } from './src/styles/tokens';

const config: Config = {
  // Modo oscuro por clase: lib/tema.ts pone .dark en <html>.
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors,
      // Outfit es más ancha que la anterior: la guía de marca usa peso 800
      // como máximo y un espaciado de -0.02em. Así font-black y
      // tracking-tight(er) se ven como en la guía en toda la app.
      // bajo: celular acostado. Con tan poca altura, teclado y monto no caben
      // uno sobre otro y se ponen lado a lado.
      // mouse: PC con teclado; ahí se muestran las ayudas de teclado.
      screens: { bajo: { raw: '(max-height: 520px)' }, mouse: { raw: '(hover: hover) and (pointer: fine)' } },
      fontWeight: { black: '800' },
      letterSpacing: { tighter: '-0.03em', tight: '-0.015em' },
      fontFamily: {
        sans: ['var(--font-outfit)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '20px',
        tile: '16px',
        sheet: '28px',
      },
      boxShadow: {
        card: '0 6px 18px rgba(26,16,53,0.05)',
        float: '0 14px 34px rgba(26,16,53,0.18)',
        'glow-primary': '0 8px 20px rgba(108,59,244,0.32)',
        'glow-mint': '0 10px 26px rgba(46,230,168,0.45)',
      },
      backgroundImage: {
        hero: `linear-gradient(160deg, ${colors.primary.DEFAULT} 0%, ${colors.primary.deep} 100%)`,
      },
      keyframes: {
        'sheet-in': {
          from: { transform: 'translateY(46px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        // Las monedas "Q" viajan del evento a las finanzas (modal de cierre).
        travel: {
          '0%': { left: '0%', opacity: '0', transform: 'scale(0.94)' },
          '12%': { left: '0%', opacity: '1', transform: 'scale(1)' },
          '62%': { left: 'calc(100% - 2rem)', opacity: '1', transform: 'scale(1)' },
          '76%, 100%': { left: 'calc(100% - 2rem)', opacity: '0', transform: 'scale(0.9)' },
        },
        'pulse-mint': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(46,230,168,0.5)' },
          '55%': { boxShadow: '0 0 0 12px rgba(46,230,168,0)' },
        },
        dash: { to: { strokeDashoffset: '-28' } },
        // El ✓ de "¡Listo!" aparece con un pequeño rebote.
        pop: {
          '0%': { transform: 'scale(0.6)', opacity: '0' },
          '70%': { transform: 'scale(1.08)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        // El celular de la landing flota suavemente.
        flota: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        // Cada paso del registro entra deslizándose desde la derecha.
        'step-in': {
          from: { transform: 'translateX(24px)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
      },
      animation: {
        'sheet-in': 'sheet-in 0.45s cubic-bezier(0.22,1,0.36,1) both',
        travel: 'travel 2.4s cubic-bezier(0.5,0,0.5,1) infinite',
        'pulse-mint': 'pulse-mint 2.4s ease-out infinite',
        dash: 'dash 1.4s linear infinite',
        pop: 'pop 0.45s cubic-bezier(0.22,1,0.36,1) both',
        'step-in': 'step-in 0.28s cubic-bezier(0.22,1,0.36,1) both',
        flota: 'flota 5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
