/**
 * auth.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Esquemas Zod de los formularios de registro e inicio de
 *            sesión, y el tipo de resultado de las acciones de auth.
 *
 * POR QUÉ EXISTE: Las reglas ("mínimo 8 caracteres") se escriben UNA
 *            vez y las usa el formulario para mostrar errores en vivo.
 *            Los mensajes ya están en español de Guatemala porque se
 *            muestran tal cual debajo de cada campo.
 *
 * DEPENDE DE: zod
 * USADO EN:   hooks/useZodForm.ts, components/auth/*
 * ---------------------------------------------------------------
 */
import { z } from 'zod';

// Supabase exige 6 como mínimo; el producto pide 8 (§3, pantalla 2).
export const PASSWORD_MIN_LENGTH = 8;
const NAME_MAX_LENGTH = 60;

const correo = z
  .string()
  .trim()
  .min(1, 'Escribí tu correo')
  .email('Ese correo no parece válido')
  .transform((value) => value.toLowerCase());

export const registroSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, 'Escribí tu nombre')
    .max(NAME_MAX_LENGTH, `Máximo ${NAME_MAX_LENGTH} caracteres`),
  correo,
  contrasena: z.string().min(PASSWORD_MIN_LENGTH, `Mínimo ${PASSWORD_MIN_LENGTH} caracteres`),
});

// En el login no se valida el largo de la contraseña: si una cuenta
// vieja tuviera otra regla, el usuario igual debe poder entrar.
export const loginSchema = z.object({
  correo,
  contrasena: z.string().min(1, 'Escribí tu contraseña'),
});

export type RegistroDatos = z.infer<typeof registroSchema>;
export type LoginDatos = z.infer<typeof loginSchema>;

// requiereConfirmacion: Supabase creó la cuenta pero no abrió sesión
// porque el proyecto exige confirmar el correo.
export type AuthResultado =
  | { ok: true; requiereConfirmacion: boolean }
  | { ok: false; error: string };
