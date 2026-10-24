/**
 * textosRegistro.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Pregunta y ayuda de cada pantalla del registro.
 *
 * POR QUÉ EXISTE: Los textos se ajustan con cada prueba de usuarios;
 *            tenerlos juntos y fuera de RegistroWizard permite cambiarlos
 *            sin tocar la lógica (y mantiene ese archivo bajo 200 líneas).
 * ---------------------------------------------------------------
 */
import type { PasoRegistro } from '@/hooks/useRegistroWizard';
import type { MovementType } from '@/types/movement';

type Texto = { titulo: string; sub: string };

const TEXTOS: Record<Exclude<PasoRegistro, 'listo'>, Texto | Record<MovementType, Texto>> = {
  tipo: { titulo: '¿Qué querés registrar?', sub: 'Tocá una opción para empezar.' },
  categoria: {
    egreso: { titulo: '¿En qué gastaste?', sub: 'Elegí la categoría que mejor lo describa.' },
    ingreso: { titulo: '¿De dónde vino el dinero?', sub: 'Elegí la categoría que mejor lo describa.' },
  },
  nuevaCategoria: {
    egreso: { titulo: 'Nueva categoría', sub: 'Para tus gastos. Elegí un nombre y un ícono.' },
    ingreso: { titulo: 'Nueva categoría', sub: 'Para tus ingresos. Elegí un nombre y un ícono.' },
  },
  monto: {
    egreso: { titulo: '¿Cuánto gastaste?', sub: 'Escribí el monto. Para hacer una cuenta, usá la Calculadora.' },
    ingreso: { titulo: '¿Cuánto recibiste?', sub: 'Escribí el monto. Para hacer una cuenta, usá la Calculadora.' },
  },
  calculadora: { titulo: 'Calculadora', sub: 'Hacé tu cuenta y tocá «Usar este resultado».' },
  dividir: { titulo: '¿Con quién dividís?', sub: 'Tu parte queda como gasto; lo demás, en «Te deben».' },
  cuenta: {
    egreso: { titulo: '¿De dónde salió?', sub: 'Elegí la cuenta con la que pagaste.' },
    ingreso: { titulo: '¿A dónde entró?', sub: 'Elegí la cuenta donde está ese dinero.' },
  },
};

export function textosDelPaso(paso: Exclude<PasoRegistro, 'listo'>, tipo: MovementType, esEdicion: boolean) {
  const entrada = TEXTOS[paso];
  const t = 'titulo' in entrada ? entrada : entrada[tipo];
  const subtitulo = esEdicion && paso === 'monto' ? 'Corregí lo que haga falta y tocá Guardar.' : t.sub;
  return { titulo: t.titulo, subtitulo };
}
