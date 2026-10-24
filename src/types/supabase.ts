/**
 * supabase.ts (tipos)
 * ---------------------------------------------------------------
 * PROPÓSITO: Tipo `Database` que se le pasa a los clientes de Supabase
 *            (createBrowserClient<Database>, createServerClient<Database>).
 *
 * POR QUÉ EXISTE: Con este tipo, supabase.from('movements').select()
 *            devuelve MovementRow[] en vez de `any`, e insertar una
 *            columna que el servidor decide (status) no compila
 *            (regla 6: prohibido `any`).
 *
 *            Tiene la misma forma que genera `supabase gen types`; si el
 *            equipo llega a usar la CLI, este archivo se reemplaza por
 *            el generado sin tocar el resto del código.
 *
 * PENDIENTE: Views (vw_monthly_summary, vw_event_budget) y Functions
 *            (close_event_and_transfer) se agregan cuando se construyan
 *            el dashboard y el cierre de eventos.
 *
 * DEPENDE DE: types/database.ts
 * USADO EN:   lib/supabase.ts, lib/supabaseServer.ts
 * ---------------------------------------------------------------
 */
import type {
  AnalyticsEventInsert,
  CategoryInsert,
  CategoryRow,
  CategoryUpdate,
  EventInsert,
  EventRow,
  EventTaskInsert,
  EventTaskRow,
  EventTaskUpdate,
  EventUpdate,
  MonthlySummaryRow,
  MovementInsert,
  MovementRow,
  MovementUpdate,
  ProfileRow,
  ProfileUpdate,
  SavingsGoalInsert,
  SavingsGoalRow,
  SavingsGoalUpdate,
} from './database';
import type {
  ReceivableInsert,
  ReceivableRow,
  ReceivableUpdate,
  ReceivablesSummaryRow,
} from './receivable';
import type { EventBudgetRow } from './event';

// Solo las llaves foráneas entre tablas de `public`: supabase-js las usa
// para tipar selects anidados como select('*, categories(name, icon)').
// Los nombres son los que Postgres pone por defecto: <tabla>_<columna>_fkey.
export type Database = {
  public: {
    Tables: {
      profiles: { Row: ProfileRow; Insert: never; Update: ProfileUpdate; Relationships: [] };
      categories: {
        Row: CategoryRow;
        Insert: CategoryInsert;
        Update: CategoryUpdate;
        Relationships: [];
      };
      events: { Row: EventRow; Insert: EventInsert; Update: EventUpdate; Relationships: [] };
      event_tasks: {
        Row: EventTaskRow;
        Insert: EventTaskInsert;
        Update: EventTaskUpdate;
        Relationships: [
          {
            foreignKeyName: 'event_tasks_event_id_fkey';
            columns: ['event_id'];
            isOneToOne: false;
            referencedRelation: 'events';
            referencedColumns: ['id'];
          },
        ];
      };
      movements: {
        Row: MovementRow;
        Insert: MovementInsert;
        Update: MovementUpdate;
        Relationships: [
          {
            foreignKeyName: 'movements_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'categories';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'movements_event_id_fkey';
            columns: ['event_id'];
            isOneToOne: false;
            referencedRelation: 'events';
            referencedColumns: ['id'];
          },
        ];
      };
      savings_goals: {
        Row: SavingsGoalRow;
        Insert: SavingsGoalInsert;
        Update: SavingsGoalUpdate;
        Relationships: [];
      };
      receivables: {
        Row: ReceivableRow;
        Insert: ReceivableInsert;
        Update: ReceivableUpdate;
        Relationships: [
          {
            foreignKeyName: 'receivables_movement_id_fkey';
            columns: ['movement_id'];
            isOneToOne: false;
            referencedRelation: 'movements';
            referencedColumns: ['id'];
          },
        ];
      };
      // Sin SELECT por API: Row vacía para que nadie intente leerla.
      analytics_events: {
        Row: Record<string, never>;
        Insert: AnalyticsEventInsert;
        Update: never;
        Relationships: [];
      };
    };
    Views: {
      vw_monthly_summary: { Row: MonthlySummaryRow; Relationships: [] };
      vw_receivables_summary: { Row: ReceivablesSummaryRow; Relationships: [] };
      vw_event_budget: { Row: EventBudgetRow; Relationships: [] };
    };
    Functions: {
      // schema.sql sección 6: cierra el evento y transfiere sus gastos (atómico).
      close_event_and_transfer: {
        Args: { p_event_id: string };
        Returns: {
          planned: number;
          actual: number;
          variance: number;
          expenses_count: number;
          total_amount: number;
          target_month: string;
        };
      };
      // schema.sql sección 11: gasto (tu parte) + deudas en una transacción.
      create_split_expense: {
        Args: {
          p_amount: number;
          p_category_id: string | null;
          p_event_id: string | null;
          p_note: string | null;
          p_debtors: Array<{ name: string; amount: number }>;
        };
        Returns: string;
      };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
