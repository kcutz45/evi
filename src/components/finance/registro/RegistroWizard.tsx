/**
 * RegistroWizard.tsx
 * ---------------------------------------------------------------
 * PROPÓSITO: Registro de un movimiento paso a paso, a pantalla completa:
 *            1 ¿Gasto o ingreso? → 2 ¿En qué? → 3 ¿Cuánto? → ¡Listo!
 *            Desde el paso 3, un gasto se puede dividir con otras
 *            personas ("¿Con quién dividís?").
 *
 * POR QUÉ EXISTE: Reemplaza al formulario de una sola pantalla, que a
 *            varios usuarios se les complicó (24/10/2026). Une los pasos;
 *            el estado vive en useRegistroWizard y useDivision, y guardar
 *            es trabajo de la página (onGuardar). En escritorio se ve como
 *            columna de celular centrada (max-w-md): MVP móvil primero.
 *
 * DEPENDE DE: hooks/useRegistroWizard.ts, hooks/useDivision.ts y los
 *            Paso*.tsx de esta carpeta
 * USADO EN:   app/(dashboard)/inicio, app/(dashboard)/dinero, app/demo
 * ---------------------------------------------------------------
 */
'use client';

import { useState } from 'react';
import { useDivision, type Division } from '@/hooks/useDivision';
import {
  PASOS_NUMERADOS, useRegistroWizard, type PasoRegistro, type ValoresIniciales,
} from '@/hooks/useRegistroWizard';
import { formatCurrency } from '@/lib/formatCurrency';
import type { Category, NuevaCategoria } from '@/types/category';
import type { MovementDraft } from '@/types/movement';
import type { Deudor } from '@/types/receivable';
import { PasoCalculadora } from './PasoCalculadora';
import { PasoCategoria } from './PasoCategoria';
import { PasoDividir } from './PasoDividir';
import { PasoListo } from './PasoListo';
import { PasoMonto } from './PasoMonto';
import { PasoNuevaCategoria } from './PasoNuevaCategoria';
import { PasoTipo } from './PasoTipo';
import { WizardHeader } from './WizardHeader';

interface RegistroWizardProps {
  categorias: Category[];
  usos: string[];
  eventosActivos: Array<{ id: string; name: string }>;
  guardando: boolean;
  errorGuardado: string | null;
  // Devuelve true si se guardó. deudores vacío = gasto normal.
  onGuardar: (draft: MovementDraft, segundos: number, deudores: Deudor[]) => Promise<boolean>;
  onCerrar: () => void;
  // Crear una categoría propia desde el registro. Devuelve la creada o null.
  onCrearCategoria: (datos: NuevaCategoria) => Promise<Category | null>;
  creandoCategoria: boolean;
  errorCategoria: string | null;
  // Si viene, es una EDICIÓN: arranca en el monto con todo cargado.
  inicial?: ValoresIniciales;
  // Si viene, es un gasto de ESTE evento (desde su detalle).
  eventoFijo?: { id: string; name: string };
}

type Wizard = ReturnType<typeof useRegistroWizard>;
type Guardado = ReturnType<typeof useGuardado>;

export function RegistroWizard(props: RegistroWizardProps) {
  const w = useRegistroWizard(props.inicial, props.eventoFijo?.id);
  const division = useDivision(w.calc.valor ?? 0);
  const g = useGuardado(w, division, props.onGuardar);
  const esEdicion = props.inicial !== undefined;
  // El primer paso no tiene "volver": es 'tipo', o 'categoria' si viene de un evento.
  const esPrimero = w.paso === (props.eventoFijo ? 'categoria' : 'tipo');

  return (
    <div className="fixed inset-0 z-50 bg-light">
      <div className="mx-auto flex h-dvh max-w-md flex-col">
        {w.paso === 'listo' ? (
          <Exito w={w} g={g} division={division} props={props} esEdicion={esEdicion} />
        ) : (
          <>
            <WizardHeader numeroDePaso={w.numeroDePaso} totalDePasos={PASOS_NUMERADOS.length}
              {...textosDelPaso(w.paso, w.tipo, esEdicion)} onVolver={esPrimero ? null : w.volver}
              onCerrar={props.onCerrar} />
            <CuerpoDelPaso w={w} g={g} division={division} props={props} esEdicion={esEdicion} />
          </>
        )}
      </div>
    </div>
  );
}

// Guarda normal o dividido. Al dividir, el monto del gasto es TU parte.
function useGuardado(w: Wizard, division: Division, onGuardar: RegistroWizardProps['onGuardar']) {
  const [errorLocal, setErrorLocal] = useState<string | null>(null);
  const [dividido, setDividido] = useState(false);

  const guardar = async (deudores: Deudor[] = []) => {
    const borrador = w.construirBorrador(deudores.length > 0 ? division.miParte : w.calc.valor);
    if (!borrador.ok) return setErrorLocal(borrador.error);
    setErrorLocal(null);
    if (await onGuardar(borrador.draft, borrador.segundos, deudores)) {
      setDividido(deudores.length > 0);
      w.terminar();
    }
  };
  return { errorLocal, dividido, guardar };
}

interface PiezaProps {
  w: Wizard;
  g: Guardado;
  division: Division;
  props: RegistroWizardProps;
  esEdicion: boolean;
}

function CuerpoDelPaso({ w, g, division, props, esEdicion }: PiezaProps) {
  if (w.paso === 'tipo') return <PasoTipo onElegir={w.elegirTipo} />;
  if (w.paso === 'categoria') {
    return (
      <PasoCategoria categorias={props.categorias.filter((c) => c.kind === w.tipo)} usos={props.usos}
        seleccionadaId={w.categoriaId} onElegir={w.elegirCategoria} onNueva={w.irANuevaCategoria} />
    );
  }
  if (w.paso === 'nuevaCategoria') {
    // Al crearla, queda elegida y se pasa directo al monto.
    const crear = async (nombre: string, icono: string) => {
      const nueva = await props.onCrearCategoria({ name: nombre, icon: icono, kind: w.tipo });
      if (nueva) w.elegirCategoria(nueva.id);
    };
    return (
      <PasoNuevaCategoria esIngreso={w.tipo === 'ingreso'} creando={props.creandoCategoria}
        error={props.errorCategoria} onCrear={crear} />
    );
  }
  if (w.paso === 'calculadora') return <PasoCalculadora montoInicial={w.calc.valor} onUsar={w.usarResultado} />;
  if (w.paso === 'dividir') {
    return (
      <PasoDividir total={w.calc.valor ?? 0} division={division} errorServidor={props.errorGuardado}
        guardando={props.guardando} onGuardar={() => g.guardar(division.deudores)} />
    );
  }
  return (
    <PasoMonto categoria={props.categorias.find((c) => c.id === w.categoriaId)} esIngreso={w.tipo === 'ingreso'}
      calc={w.calc} error={g.errorLocal ?? props.errorGuardado} guardando={props.guardando}
      detalles={{ nota: w.nota, onNota: w.setNota, eventoId: w.eventoId, onEvento: w.setEventoId,
        eventos: w.tipo === 'egreso' ? props.eventosActivos : null }}
      onCambiarCategoria={w.volver} onGuardar={() => g.guardar()}
      onCalculadora={w.irACalculadora} onDividir={esEdicion ? undefined : w.irADividir} />
  );
}

function Exito({ w, g, division, props, esEdicion }: PiezaProps) {
  const prestado = division.deudores.reduce((suma, d) => suma + d.monto, 0);
  return (
    <PasoListo esEdicion={esEdicion} esIngreso={w.tipo === 'ingreso'} onListo={props.onCerrar}
      monto={g.dividido ? formatCurrency(division.miParte) : w.calc.total}
      categoria={props.categorias.find((c) => c.id === w.categoriaId)?.name ?? 'Sin categoría'}
      evento={props.eventosActivos.find((e) => e.id === w.eventoId)?.name ?? null}
      teDeben={g.dividido ? {
        total: formatCurrency(prestado), nombres: division.deudores.map((d) => d.nombre.trim()).join(', '),
      } : null} />
  );
}

const TEXTOS = {
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
};

type PasoConTexto = Exclude<PasoRegistro, 'listo'>;

function textosDelPaso(paso: PasoConTexto, tipo: 'egreso' | 'ingreso', esEdicion: boolean) {
  const t = paso === 'categoria' || paso === 'monto' || paso === 'nuevaCategoria' ? TEXTOS[paso][tipo] : TEXTOS[paso];
  const subtitulo = esEdicion && paso === 'monto' ? 'Corregí lo que haga falta y tocá Guardar.' : t.sub;
  return { titulo: t.titulo, subtitulo };
}
