/**
 * Logo.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Logotipo de EVI (mayúsculas de trazo continuo) y su
 *            isotipo de flujo, en las variantes de la guía de marca
 *            "Mayúsculas con estilo" (31/10/2026).
 *
 * POR QUÉ EXISTE: Un solo lugar para la marca. Los trazos son los de la
 *            guía: grosor 52, altura de caja 180, esquinas de radio 50 y
 *            la V baja 8 bajo la línea base (corrección óptica). Es SVG:
 *            nítido en cualquier tamaño y sin pedir imágenes.
 *
 * VARIANTES: 'color'   violeta; en modo oscuro pasa a blanco con la V
 *                      menta (la V es la que "hace la transferencia").
 *            'blanco'  blanco sólido, sobre violeta (cabeceras, botones).
 *            'oscuro'  blanco con V menta, para fondos siempre oscuros.
 * ---------------------------------------------------------------
 */
import { cn } from '@/lib/cn';

type Variante = 'color' | 'blanco' | 'oscuro';

const TRAZO_LETRAS: Record<Variante, { base: string; v: string }> = {
  color: { base: 'stroke-primary dark:stroke-white', v: 'stroke-primary dark:stroke-mint' },
  blanco: { base: 'stroke-white', v: 'stroke-white' },
  oscuro: { base: 'stroke-white', v: 'stroke-mint' },
};

const E_CONTINUA = 'M 164 60 L 94 60 A 50 50 0 0 0 44 110 L 44 190 A 50 50 0 0 0 94 240 L 164 240';

interface LogoProps {
  variante?: Variante;
  // "EVENTOS Y DINERO" debajo, en peso ligero y muy espaciado.
  descriptor?: boolean;
  className?: string;
  titulo?: string;
}

export function LogoEvi({ variante = 'color', descriptor = false, className, titulo = 'EVI' }: LogoProps) {
  const trazo = TRAZO_LETRAS[variante];
  return (
    <svg viewBox={descriptor ? '0 0 440 360' : '0 0 440 300'} role="img" aria-label={titulo} className={cn('h-auto', className)}>
      <g strokeWidth="52" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d={E_CONTINUA} className={trazo.base} />
        <path d="M 44 150 L 132 150" className={trazo.base} />
        <path d="M 248 60 L 302 248 L 356 60" className={trazo.v} />
        <path d="M 374 60 L 374 240" className={trazo.base} />
      </g>
      {descriptor && (
        // textLength: el descriptor mide lo mismo que el logotipo (de la E a
        // la I), sea cual sea el ancho real de la fuente.
        <text x="20" y="330" fontSize="31" fontWeight="400" textLength="380" lengthAdjust="spacing"
          className={cn('font-sans', variante === 'color' ? 'fill-primary dark:fill-white' : 'fill-white')}>
          EVENTOS Y DINERO
        </text>
      )}
    </svg>
  );
}

// Isotipo de flujo: una barra y una flecha que baja (el dinero que pasa
// del evento a tus finanzas). Para la landing junto al logotipo y el ícono.
export function IsotipoEvi({ className, variante = 'color' }: { className?: string; variante?: Variante }) {
  return (
    <svg viewBox="0 0 240 240" aria-hidden className={className}>
      <g strokeWidth="44" strokeLinecap="round" strokeLinejoin="round" fill="none" className={TRAZO_LETRAS[variante].base}>
        <path d="M 60 56 L 180 56" />
        <path d="M 56 124 L 120 190 L 184 124" />
      </g>
    </svg>
  );
}
