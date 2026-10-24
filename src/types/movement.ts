/**
 * movement.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Tipos y esquema de validación de los movimientos de dinero.
 *
 * POR QUÉ EXISTE: El mismo esquema Zod valida el formulario y la
 *            respuesta de la base; las reglas no se duplican (§1.3).
 *
 * DEPENDE DE: zod
 * USADO EN:   components/finance/*, hooks/useMovements.ts
 * ---------------------------------------------------------------
 */
import { z } from 'zod';

export type MovementType = 'ingreso' | 'egreso';

// 'pendiente' = gasto de un evento activo, aún no suma al mes.
// 'confirmado' = cuenta en las finanzas personales (regla contable §3).
export type MovementStatus = 'pendiente' | 'confirmado';

export interface Movement {
  id: string;
  type: MovementType;
  amount: number;
  categoryId: string | null;
  eventId: string | null;
  note: string | null;
  occurredOn: string;
  accountingDate: string | null;
  status: MovementStatus;
}

// Lo que el usuario llena en el formulario. status y accountingDate no
// aparecen: los decide el servidor.
export const movementDraftSchema = z.object({
  type: z.enum(['ingreso', 'egreso']),
  amount: z.number().positive('Ingresá un monto mayor a cero'),
  categoryId: z.string().uuid().nullable(),
  eventId: z.string().uuid().nullable(),
  note: z.string().max(140, 'Máximo 140 caracteres').nullable(),
});

export type MovementDraft = z.infer<typeof movementDraftSchema>;

// Lo que necesita una fila de "Últimos movimientos" ya lista para pintar.
export interface MovementView {
  id: string;
  title: string;
  categoryName: string;
  categoryIcon: string;
  dateLabel: string;
  type: MovementType;
  amount: number;
  eventName: string | null;
  isPending: boolean;
}

// Fila de la pantalla Dinero: lo que se pinta más lo necesario para
// editarla (ids crudos y la fecha ISO para agrupar por día).
export interface MovementDetalle extends MovementView {
  categoryId: string | null;
  eventId: string | null;
  note: string | null;
  occurredOn: string;
  // Si se dividió la cuenta: quién te debe su parte (vacío si no).
  porCobrar: Array<{ nombre: string; monto: number; cobrado: boolean }>;
}
