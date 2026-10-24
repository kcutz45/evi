/**
 * telemetry.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Catálogo cerrado de nombres de eventos analíticos (§4.3).
 *
 * POR QUÉ EXISTE: Un nombre mal escrito ('movementCreated') es un
 *            error de compilación, no un dato corrupto descubierto
 *            tres semanas después en Looker Studio.
 *
 * USADO EN:   services/telemetryService.ts
 * ---------------------------------------------------------------
 */

export type AnalyticsEvent =
  // Adquisición
  | 'landing_viewed'
  | 'landing_section_viewed'
  | 'waitlist_submitted'
  | 'pricing_plan_viewed'
  // Activación
  | 'signup_started'
  | 'signup_completed'
  | 'signup_failed'
  | 'onboarding_completed'
  | 'login_succeeded'
  // Uso central — finanzas
  | 'movement_created'
  | 'movement_deleted'
  | 'category_suggested'
  | 'category_suggestion_accepted'
  | 'category_suggestion_rejected'
  | 'monthly_report_viewed'
  | 'savings_goal_created'
  | 'category_created'
  // Dividir cuenta / Por cobrar (aprobado 24/10/2026)
  | 'expense_split_created'
  | 'receivable_collected'
  // Uso central — eventos
  | 'event_created'
  | 'event_task_completed'
  | 'event_expense_added'
  | 'budget_alert_shown'
  | 'budget_exceeded'
  | 'event_closed'
  | 'expenses_transferred'
  // Retención y monetización
  | 'session_started'
  | 'pwa_installed'
  | 'upgrade_clicked'
  | 'payment_confirmed'
  | 'limit_reached';

export type DeviceType = 'mobile' | 'desktop' | 'tablet';
