/**
 * calculator.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Reglas de la calculadora del paso "¿Cuánto?" del registro:
 *            "3 almuerzos × Q35" o "Q143 × 2" → resultado.
 *
 * POR QUÉ EXISTE: La gente piensa los gastos como cuentas ("éramos 4,
 *            pagué la mitad"). La expresión se guarda como lista de
 *            piezas: ['143', '×', '2']. Funciones puras: el hook
 *            useCalculator solo las orquesta.
 *
 * REGLA:     × y ÷ se resuelven antes que + y −, como en cualquier
 *            calculadora. El resultado se redondea a 2 decimales.
 *
 * DEPENDE DE: lib/constants.ts
 * USADO EN:   hooks/useCalculator.ts
 * ---------------------------------------------------------------
 */
import { AMOUNT_DECIMALS, MAX_AMOUNT_DIGITS } from './constants';

export type Operador = '+' | '−' | '×' | '÷';
export type Digito = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
export type TeclaCalc = Digito | Operador | '.' | 'del';
export type Expresion = string[];

export const OPERADORES: Operador[] = ['+', '−', '×', '÷'];
const FACTOR = 10 ** AMOUNT_DECIMALS;

const esOperador = (pieza: string | undefined): pieza is Operador =>
  OPERADORES.includes(pieza as Operador);

function agregarDigito(numero: string, digito: Digito): string {
  const decimales = numero.split('.')[1];
  if (decimales !== undefined && decimales.length >= AMOUNT_DECIMALS) return numero;
  if (numero.replace('.', '').length >= MAX_AMOUNT_DIGITS) return numero;
  // Evita "007": un cero inicial se reemplaza por el dígito.
  return numero === '0' ? digito : numero + digito;
}

function aplicarOperador(expr: Expresion, op: Operador): Expresion {
  if (expr.length === 0) return expr;
  const ultima = expr[expr.length - 1];
  if (esOperador(ultima)) return [...expr.slice(0, -1), op];
  return [...expr, op];
}

function borrar(expr: Expresion): Expresion {
  const ultima = expr[expr.length - 1];
  if (ultima === undefined) return expr;
  if (esOperador(ultima) || ultima.length === 1) return expr.slice(0, -1);
  return [...expr.slice(0, -1), ultima.slice(0, -1)];
}

export function aplicarTecla(expr: Expresion, tecla: TeclaCalc): Expresion {
  if (tecla === 'del') return borrar(expr);
  if (esOperador(tecla)) return aplicarOperador(expr, tecla);
  const ultima = expr[expr.length - 1];
  const empiezaNumero = ultima === undefined || esOperador(ultima);
  if (tecla === '.') {
    if (empiezaNumero) return [...expr, '0.'];
    return ultima.includes('.') ? expr : [...expr.slice(0, -1), `${ultima}.`];
  }
  if (empiezaNumero) return [...expr, tecla];
  return [...expr.slice(0, -1), agregarDigito(ultima, tecla)];
}

// Resuelve × y ÷ primero; devuelve la lista solo con sumas y restas.
function resolverMultiplicaciones(piezas: Expresion): Array<number | Operador> | null {
  const salida: Array<number | Operador> = [Number.parseFloat(piezas[0] ?? '0')];
  for (let i = 1; i < piezas.length; i += 2) {
    const op = piezas[i] as Operador;
    const valor = Number.parseFloat(piezas[i + 1] ?? '0');
    if (op === '×' || op === '÷') {
      if (op === '÷' && valor === 0) return null;
      const previo = salida.pop() as number;
      salida.push(op === '×' ? previo * valor : previo / valor);
    } else {
      salida.push(op, valor);
    }
  }
  return salida;
}

// null = la cuenta no tiene sentido (vacía o división entre cero).
export function evaluar(expr: Expresion): number | null {
  const piezas = esOperador(expr[expr.length - 1]) ? expr.slice(0, -1) : expr;
  if (piezas.length === 0) return null;
  const sumas = resolverMultiplicaciones(piezas);
  if (!sumas) return null;
  let total = sumas[0] as number;
  for (let i = 1; i < sumas.length; i += 2) {
    total = sumas[i] === '+' ? total + (sumas[i + 1] as number) : total - (sumas[i + 1] as number);
  }
  return Math.round(total * FACTOR) / FACTOR;
}

export function tieneOperacion(expr: Expresion): boolean {
  return expr.some(esOperador);
}

// ['1500', '×', '2.5'] → 'Q1,500 × 2.5' (los decimales se muestran tal cual se escriben).
export function formatearExpresion(expr: Expresion): string {
  const texto = expr
    .map((pieza) => {
      if (esOperador(pieza)) return pieza;
      const [entero = '', decimales] = pieza.split('.');
      const conMiles = Number(entero || 0).toLocaleString('en-US');
      return decimales === undefined ? conMiles : `${conMiles}.${decimales}`;
    })
    .join(' ');
  return texto ? `Q${texto}` : '';
}
