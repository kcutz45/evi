/**
 * Brillo.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Destellos de color difuminados detrás del contenido de las
 *            tarjetas moradas (balance, tu dinero, meta principal).
 *
 * POR QUÉ EXISTE: Efecto tomado de la referencia "Total balance": un
 *            resplandor menta y dorado le da profundidad a la tarjeta sin
 *            imágenes. Es solo decoración (aria-hidden); la tarjeta
 *            necesita "relative overflow-hidden" (Card variant="hero").
 * ---------------------------------------------------------------
 */
export function Brillo() {
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0">
      <span className="absolute -right-12 -top-16 h-44 w-44 rounded-full bg-mint/35 blur-3xl" />
      <span className="absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-gold/25 blur-3xl" />
      <span className="absolute -right-6 bottom-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
    </span>
  );
}
