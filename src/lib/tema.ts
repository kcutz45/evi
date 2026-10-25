/**
 * tema.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Modo claro / oscuro de EVI: claro, oscuro de una vez, o
 *            programado por horario (ej. oscuro de 18:00 a 06:00).
 *
 * POR QUÉ EXISTE: Es una preferencia de cada celular (como el brillo),
 *            por eso se guarda en localStorage y no en la base. Las
 *            reglas son funciones puras (se prueban sin navegador).
 *            SCRIPT_TEMA corre en <head> ANTES de pintar la página: sin
 *            él, la app aparecería clara un instante y luego oscura.
 *
 * USADO EN:   hooks/useTema.ts, app/layout.tsx
 * ---------------------------------------------------------------
 */

export type ModoTema = 'claro' | 'oscuro' | 'programado';

export interface PreferenciaTema {
  modo: ModoTema;
  // "HH:MM" en la hora del celular.
  desde: string;
  hasta: string;
}

export const TEMA_POR_DEFECTO: PreferenciaTema = { modo: 'claro', desde: '18:00', hasta: '06:00' };

const CLAVE = 'evi.tema';
// Avisa a todos los useTema abiertos que la preferencia cambió.
export const EVENTO_TEMA = 'evi-tema';
const HORA = /^([01]\d|2[0-3]):[0-5]\d$/;

const minutos = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));

// Programado: si "desde" es mayor que "hasta", el horario cruza la
// medianoche (18:00 → 06:00 = oscuro de noche).
export function debeSerOscuro(pref: PreferenciaTema, ahora: Date = new Date()): boolean {
  if (pref.modo !== 'programado') return pref.modo === 'oscuro';
  const actual = ahora.getHours() * 60 + ahora.getMinutes();
  const inicio = minutos(pref.desde);
  const fin = minutos(pref.hasta);
  if (inicio === fin) return false;
  return inicio < fin ? actual >= inicio && actual < fin : actual >= inicio || actual < fin;
}

// Lo guardado puede venir viejo o roto: se valida campo por campo.
export function leerPreferencia(): PreferenciaTema {
  try {
    const crudo = JSON.parse(window.localStorage.getItem(CLAVE) ?? 'null') as Partial<PreferenciaTema> | null;
    return {
      modo: crudo?.modo === 'oscuro' || crudo?.modo === 'programado' ? crudo.modo : 'claro',
      desde: crudo?.desde && HORA.test(crudo.desde) ? crudo.desde : TEMA_POR_DEFECTO.desde,
      hasta: crudo?.hasta && HORA.test(crudo.hasta) ? crudo.hasta : TEMA_POR_DEFECTO.hasta,
    };
  } catch {
    return TEMA_POR_DEFECTO;
  }
}

export function guardarPreferencia(pref: PreferenciaTema): void {
  try {
    window.localStorage.setItem(CLAVE, JSON.stringify(pref));
    window.dispatchEvent(new Event(EVENTO_TEMA));
  } catch {
    // Sin almacenamiento (modo privado): el tema dura hasta recargar.
  }
}

export function aplicarTema(oscuro: boolean): void {
  document.documentElement.classList.toggle('dark', oscuro);
}

// Versión mínima de debeSerOscuro para <head>: no puede importar nada.
export const SCRIPT_TEMA = `(function(){try{var p=JSON.parse(localStorage.getItem('${CLAVE}')||'null');if(!p)return;
var o=p.modo==='oscuro';if(p.modo==='programado'&&p.desde&&p.hasta){var d=new Date(),a=d.getHours()*60+d.getMinutes(),
m=function(h){return +h.slice(0,2)*60+ +h.slice(3,5)},i=m(p.desde),f=m(p.hasta);o=i<f?a>=i&&a<f:i>f&&(a>=i||a<f);}
if(o)document.documentElement.classList.add('dark');}catch(e){}})();`;
