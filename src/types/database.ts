/**
 * database.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Forma exacta de las filas de las seis tablas de la app,
 *            tal como las devuelve Supabase (snake_case), y de lo que
 *            la API tiene permitido escribir en cada una.
 *
 * POR QUÉ EXISTE: Los servicios necesitan saber qué columnas existen
 *            para que un nombre mal escrito ('categoryId' en vez de
 *            'category_id') sea un error de compilación. Los componentes
 *            NO usan estos tipos: usan los de dominio (category.ts,
 *            event.ts, movement.ts), que los servicios arman a partir
 *            de estas filas.
 *
 * FUENTE:    supabase/schema.sql v1.2 — sección 2 (tablas) para las
 *            filas y sección 5 (privilegios por columna) para Insert y
 *            Update. Si cambia el schema, este archivo se actualiza a
 *            mano en el mismo pull request.
 *
 * DEPENDE DE: types/event.ts, types/movement.ts
 * USADO EN:   types/supabase.ts, services/*
 * ---------------------------------------------------------------
 */
import type { EventStatus } from './event';
import type { MovementStatus, MovementType } from './movement';
import type { DeviceType } from './telemetry';

// Convenciones de mapeo PostgreSQL → TypeScript:
//   uuid, text            → string
//   date, timestamptz     → string ISO ('2026-09-14', '2026-09-14T18:00:00Z')
//   numeric(12,2)         → number (PostgREST lo envía como número JSON)
// Son `type` y no `interface` a propósito: supabase-js exige que cada
// fila sea asignable a Record<string, unknown>, y una interface no lo es.

export type PlanName = 'gratis' | 'personal' | 'organizador';

// Atajo: columnas opcionales al escribir (tienen DEFAULT o aceptan NULL).
type Optional<T, K extends keyof T> = Partial<Pick<T, K>>;

// ---------------------------------------------------------------
// Filas (SELECT)
// ---------------------------------------------------------------

export type ProfileRow = {
  id: string;
  full_name: string;
  plan: PlanName;
  created_at: string;
};

// user_id NULL = categoría del sistema, visible para todos.
export type CategoryRow = {
  id: string;
  user_id: string | null;
  name: string;
  icon: string;
  kind: MovementType;
  created_at: string;
};

export type EventRow = {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  event_date: string;
  location: string | null;
  planned_budget: number;
  status: EventStatus;
  closed_at: string | null;
  created_at: string;
};

// Sin user_id: la pertenencia se hereda del evento (RLS con EXISTS).
export type EventTaskRow = {
  id: string;
  event_id: string;
  title: string;
  is_done: boolean;
  position: number;
  created_at: string;
};

// accounting_date es NULL mientras el movimiento está 'pendiente'.
export type MovementRow = {
  id: string;
  user_id: string;
  type: MovementType;
  amount: number;
  category_id: string | null;
  event_id: string | null;
  note: string | null;
  occurred_on: string;
  status: MovementStatus;
  accounting_date: string | null;
  created_at: string;
};

export type SavingsGoalRow = {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  saved_amount: number;
  deadline: string | null;
  created_at: string;
};

// ---------------------------------------------------------------
// Escritura (INSERT / UPDATE)
// Regla 10: lo que decide el servidor (status, accounting_date,
// closed_at, plan, y user_id con DEFAULT auth.uid()) NO aparece aquí.
// Así el compilador impide intentarlo antes de que la base lo rechace.
// ---------------------------------------------------------------

// profiles no tiene Insert: lo crea el trigger handle_new_user.
export type ProfileUpdate = Optional<ProfileRow, 'full_name'>;

// categories.user_id NO tiene DEFAULT en la base: hay que enviarlo y
// la política RLS exige que sea el de la sesión.
export type CategoryInsert = Pick<CategoryRow, 'user_id' | 'name' | 'kind'> &
  Optional<CategoryRow, 'icon'>;
export type CategoryUpdate = Optional<CategoryRow, 'name' | 'icon' | 'kind'>;

type EventWritable = 'name' | 'icon' | 'event_date' | 'location' | 'planned_budget';
export type EventInsert = Pick<EventRow, 'name' | 'event_date' | 'planned_budget'> &
  Optional<EventRow, 'icon' | 'location'>;
export type EventUpdate = Optional<EventRow, EventWritable>;

export type EventTaskInsert = Pick<EventTaskRow, 'event_id' | 'title'> &
  Optional<EventTaskRow, 'is_done' | 'position'>;
export type EventTaskUpdate = Optional<EventTaskRow, 'title' | 'is_done' | 'position'>;

type MovementWritable = 'type' | 'amount' | 'category_id' | 'event_id' | 'note' | 'occurred_on';
export type MovementInsert = Pick<MovementRow, 'type' | 'amount'> &
  Optional<MovementRow, 'category_id' | 'event_id' | 'note' | 'occurred_on'>;
export type MovementUpdate = Optional<MovementRow, MovementWritable>;

type SavingsGoalWritable = 'name' | 'target_amount' | 'saved_amount' | 'deadline';
export type SavingsGoalInsert = Pick<SavingsGoalRow, 'name' | 'target_amount'> &
  Optional<SavingsGoalRow, 'saved_amount' | 'deadline'>;
export type SavingsGoalUpdate = Optional<SavingsGoalRow, SavingsGoalWritable>;

// ---------------------------------------------------------------
// analytics_events: no es una tabla de la app sino de telemetría, pero
// services/telemetryService.ts inserta en ella con el cliente tipado.
// Solo INSERT: la API no puede leerla, actualizarla ni borrarla (§4).
// event_name es string y no AnalyticsEvent: el catálogo cerrado lo
// impone track(), no la tabla.
// ---------------------------------------------------------------
export type AnalyticsEventInsert = {
  session_id: string;
  event_name: string;
  device_type?: DeviceType | null;
  properties?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
};
