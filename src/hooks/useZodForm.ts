/**
 * useZodForm.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Estado de un formulario chico (valores y error por campo)
 *            validado con un esquema Zod.
 *
 * POR QUÉ EXISTE: Registro y login tienen la misma mecánica; sin este
 *            hook cada formulario repetiría tres useState y el mapeo de
 *            errores de Zod. Cuando entre react-hook-form (§1.3,
 *            prioridad media) se reemplaza solo este archivo.
 *
 * VALIDACIÓN EN VIVO: un campo se valida al salir de él (onBlur) y,
 *            desde ahí, en cada tecla. Así no se le grita "correo
 *            inválido" a alguien que apenas escribió la primera letra.
 *
 * DEPENDE DE: zod
 * USADO EN:   components/auth/RegistroForm.tsx, LoginForm.tsx
 * ---------------------------------------------------------------
 */
'use client';

import { useState } from 'react';
import type { z } from 'zod';

type Errores<K extends string> = Partial<Record<K, string>>;

export function useZodForm<S extends z.ZodObject<z.ZodRawShape>>(
  schema: S,
  inicial: Record<keyof z.input<S> & string, string>,
) {
  type Campo = keyof z.input<S> & string;
  const [valores, setValores] = useState(inicial);
  const [errores, setErrores] = useState<Errores<Campo>>({});
  const [tocados, setTocados] = useState<Partial<Record<Campo, boolean>>>({});

  // Devuelve el primer mensaje de Zod de cada campo.
  const validar = (datos: Record<Campo, string>): Errores<Campo> => {
    const resultado = schema.safeParse(datos);
    if (resultado.success) return {};
    const fieldErrors = resultado.error.flatten().fieldErrors as Partial<Record<Campo, string[]>>;
    const salida: Errores<Campo> = {};
    (Object.keys(fieldErrors) as Campo[]).forEach((campo) => {
      salida[campo] = fieldErrors[campo]?.[0];
    });
    return salida;
  };

  const cambiar = (campo: Campo, valor: string) => {
    const nuevos = { ...valores, [campo]: valor };
    setValores(nuevos);
    if (tocados[campo]) setErrores((prev) => ({ ...prev, [campo]: validar(nuevos)[campo] }));
  };

  const salir = (campo: Campo) => {
    setTocados((prev) => ({ ...prev, [campo]: true }));
    setErrores((prev) => ({ ...prev, [campo]: validar(valores)[campo] }));
  };

  // Al enviar se validan TODOS los campos. Devuelve los datos ya
  // transformados por Zod (correo en minúsculas, nombre sin espacios).
  const enviar = (): z.output<S> | null => {
    const resultado = schema.safeParse(valores);
    if (resultado.success) return resultado.data;
    setErrores(validar(valores));
    return null;
  };

  return { valores, errores, cambiar, salir, enviar };
}
