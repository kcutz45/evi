-- =====================================================================
-- schema.sql — EVI
-- ---------------------------------------------------------------------
-- PROPÓSITO: Script COMPLETO para reconstruir la base de datos de EVI
--            desde cero en un proyecto nuevo de Supabase (PostgreSQL 15).
--
-- POR QUÉ EXISTE: El plan gratuito de Supabase no tiene respaldos
--            automáticos (§6 del spec). Este archivo, versionado en
--            GitHub, ES el respaldo de la estructura.
--
-- VERSIÓN:   1.2 (3 de octubre de 2026). Incluye las correcciones de
--            seguridad de la v1.2: vistas con security_invoker, vistas
--            de BI en un esquema no expuesto, user_id por defecto en la
--            telemetría y privilegios por columna.
--
-- CÓMO SE USA: Pegar completo en el SQL Editor de Supabase y ejecutar.
--            Si la base ya tiene la versión anterior y SOLO contiene
--            datos semilla, ejecutar antes la sección 0 (descomentada).
--
-- AJUSTE 23/10/2026: tras inventariar la base real ("Evi charger") se
--            conservan decisiones del diseño original que el spec no
--            documentaba: updated_at + trigger set_updated_at, metadata
--            jsonb, categories.color, event_tasks.completed_at,
--            profiles.onboarded_at, savings_goals.status y
--            waitlist.source/status. Ver §5.5 del spec.
--
-- ORDEN:     0 reset · 1 utilidades · 2 tablas · 3 triggers · 4 RLS
--            5 privilegios · 6 funciones RPC · 7 vistas de la app
--            8 esquema analytics (Looker) · 9 datos del sistema
--            10 respaldo de perfiles · 11 por cobrar (dividir cuenta)
-- =====================================================================


-- =====================================================================
-- 0. RESET (OPCIONAL — BORRA DATOS)
-- Solo para entornos con datos semilla. Está comentado a propósito:
-- descomentarlo debe ser una decisión consciente del equipo.
-- =====================================================================
-- drop schema if exists analytics cascade;
-- drop view if exists public.vw_monthly_summary, public.vw_event_budget,
--   public.vw_daily_activity, public.vw_event_lifecycle,
--   public.vw_category_distribution cascade;
-- drop trigger if exists on_auth_user_created on auth.users;
-- drop trigger if exists trg_on_auth_user_created on auth.users;  -- nombre de v1.1
-- drop view if exists public.vw_receivables_summary cascade;
-- drop table if exists public.receivables cascade;
-- drop table if exists public.analytics_events, public.waitlist,
--   public.savings_goals, public.movements, public.event_tasks,
--   public.events, public.categories, public.profiles cascade;
-- drop function if exists public.handle_new_user() cascade;
-- drop function if exists public.close_event_and_transfer(uuid) cascade;
-- drop function if exists public.set_movement_accounting() cascade;
-- drop function if exists public.set_task_completed_at() cascade;
-- drop function if exists public.set_updated_at() cascade;
-- drop function if exists public.create_split_expense(numeric, uuid, uuid, text, jsonb) cascade;
-- drop function if exists public.set_receivable_collected_at() cascade;
-- drop function if exists public.gt_today() cascade;
--
-- NO se borra public.rls_auto_enable(): es un event trigger que activa
-- RLS en cada tabla nueva. Es una red de seguridad extra y se conserva.
-- Las cuentas de auth.users tampoco se borran: la sección 10 les
-- recrea el perfil al final.


-- =====================================================================
-- 1. UTILIDADES
-- =====================================================================

-- "Hoy" en Guatemala. Todo el producto gira alrededor de "el mes
-- actual"; si usáramos la fecha UTC, un gasto de las 7 p.m. del día 30
-- caería en el mes siguiente (Guatemala es UTC-6).
create or replace function public.gt_today()
returns date
language sql
stable
set search_path = ''
as $$
  select (now() at time zone 'America/Guatemala')::date;
$$;

-- Mantiene updated_at al día en cada UPDATE. Lo hace la base y no el
-- cliente: así la fecha es confiable aunque el cliente la olvide o la
-- falsee (regla 10). Viene del diseño original de la base (v1.1).
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;


-- =====================================================================
-- 2. TABLAS
-- =====================================================================

-- ---------------------------------------------------------------------
-- profiles: extiende auth.users. La crea el trigger handle_new_user;
-- el frontend NUNCA inserta aquí.
-- ---------------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null default '',
  plan        text not null default 'gratis'
              check (plan in ('gratis', 'personal', 'organizador')),
  -- Momento del primer movimiento (evento onboarding_completed, §4.3).
  -- Lo escribe el servidor, nunca el cliente.
  onboarded_at  timestamptz,
  metadata      jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- categories: user_id NULL = categoría del sistema (visible para todos).
-- `icon` guarda el nombre del ícono de Lucide (ej. 'utensils').
-- ---------------------------------------------------------------------
create table public.categories (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 40),
  icon        text not null default 'circle',
  -- Color de la categoría en gráficas y chips. Por defecto, el primario.
  color       text not null default '#6C3BF4'
              check (color ~ '^#[0-9A-Fa-f]{6}$'),
  kind        text not null check (kind in ('ingreso', 'egreso')),
  metadata    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- events: eventos del usuario. status controla si acepta gastos.
-- ---------------------------------------------------------------------
create table public.events (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null default auth.uid()
                  references auth.users(id) on delete cascade,
  name            text not null check (char_length(name) between 1 and 80),
  icon            text not null default 'party-popper',
  event_date      date not null,
  location        text,
  planned_budget  numeric(12,2) not null check (planned_budget > 0),
  status          text not null default 'activo'
                  check (status in ('activo', 'cerrado')),
  -- closed_at reemplaza al transferred_at de v1.1: cerrar y transferir
  -- ocurren en la MISMA transacción, así que son un solo momento.
  closed_at       timestamptz,
  metadata        jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  -- Un evento cerrado siempre sabe cuándo se cerró, y uno activo no.
  constraint events_closed_consistency
    check ((status = 'cerrado') = (closed_at is not null))
);

-- ---------------------------------------------------------------------
-- event_tasks: checklist. No tiene user_id: la pertenencia se hereda
-- del evento (ver políticas RLS con EXISTS).
-- ---------------------------------------------------------------------
create table public.event_tasks (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid not null references public.events(id) on delete cascade,
  title       text not null check (char_length(title) between 1 and 120),
  is_done     boolean not null default false,
  -- Lo llena el trigger event_tasks_completed_at al marcar la tarea.
  completed_at  timestamptz,
  position      integer not null default 0,
  metadata      jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- movements: ingresos y egresos.
--
-- REGLA CONTABLE (v1.2, §3 del spec):
--   * status 'pendiente'  → pertenece a un evento ACTIVO. Se ve en el
--     evento, pero NO suma al balance personal del mes.
--   * status 'confirmado' → cuenta en las finanzas personales, en el mes
--     de accounting_date.
--   * Al cerrar el evento, close_event_and_transfer pasa sus movimientos
--     a 'confirmado' con accounting_date = día del cierre.
--
-- status y accounting_date los decide el SERVIDOR (trigger y RPC); la
-- API no puede escribirlos (ver privilegios por columna, sección 5).
-- ---------------------------------------------------------------------
create table public.movements (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null default auth.uid()
                   references auth.users(id) on delete cascade,
  type             text not null check (type in ('ingreso', 'egreso')),
  amount           numeric(12,2) not null check (amount > 0),
  category_id      uuid references public.categories(id) on delete set null,
  event_id         uuid references public.events(id) on delete set null,
  note             text check (char_length(note) <= 140),
  occurred_on      date not null default public.gt_today(),
  status           text not null default 'confirmado'
                   check (status in ('pendiente', 'confirmado')),
  accounting_date  date,
  metadata         jsonb not null default '{}'::jsonb,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint movements_accounting_consistency
    check ((status = 'confirmado') = (accounting_date is not null))
);

-- ---------------------------------------------------------------------
-- savings_goals: metas de ahorro.
-- ---------------------------------------------------------------------
create table public.savings_goals (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null default auth.uid()
                 references auth.users(id) on delete cascade,
  name           text not null check (char_length(name) between 1 and 60),
  target_amount  numeric(12,2) not null check (target_amount > 0),
  saved_amount   numeric(12,2) not null default 0 check (saved_amount >= 0),
  deadline       date,
  status         text not null default 'activa'
                 check (status in ('activa', 'completada', 'archivada')),
  metadata       jsonb not null default '{}'::jsonb,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- waitlist: captura pública del smoke test. Solo INSERT, nunca SELECT.
-- ---------------------------------------------------------------------
create table public.waitlist (
  id             uuid primary key default gen_random_uuid(),
  email          text not null unique
                 check (email = lower(email) and email like '%_@_%._%'),
  plan_interest  text check (plan_interest in ('gratis', 'personal', 'organizador')),
  -- De dónde llegó el correo (utm_source o referrer): mide el smoke test.
  source         text check (char_length(source) <= 100),
  -- Seguimiento de la beta. Solo lo cambia el equipo desde el panel.
  status         text not null default 'pendiente'
                 check (status in ('pendiente', 'invitado', 'registrado')),
  metadata       jsonb not null default '{}'::jsonb,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- analytics_events: telemetría append-only (§4).
-- v1.2: sin updated_at (una fila nunca se actualiza) y user_id se llena
-- solo con auth.uid(), así el cliente no puede olvidarlo ni falsearlo.
-- ---------------------------------------------------------------------
create table public.analytics_events (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid default auth.uid()
               references auth.users(id) on delete set null,
  session_id   text not null,
  event_name   text not null check (event_name ~ '^[a-z]+(_[a-z]+)+$'),
  device_type  text check (device_type in ('mobile', 'desktop', 'tablet')),
  properties   jsonb not null default '{}'::jsonb,
  metadata     jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default timezone('utc'::text, now())
);

-- Índices: cubren las consultas de "mi mes", "mis eventos" y los
-- tableros de Looker (filtros por fecha y por nombre de evento).
create index movements_user_month_idx on public.movements (user_id, accounting_date);
create index movements_event_idx      on public.movements (event_id);
create index events_user_status_idx   on public.events (user_id, status);
create index event_tasks_event_idx    on public.event_tasks (event_id);
create index categories_user_idx      on public.categories (user_id);
create index savings_goals_user_idx   on public.savings_goals (user_id);
create index analytics_created_idx    on public.analytics_events (created_at);
create index analytics_name_idx       on public.analytics_events (event_name);


-- =====================================================================
-- 3. TRIGGERS
-- =====================================================================

-- ---------------------------------------------------------------------
-- handle_new_user: crea el perfil al registrarse (verificado en v1.1).
--
-- Excepción documentada a la regla 8: corre durante el registro, cuando
-- todavía NO hay sesión, así que no puede exigir auth.uid(). Es seguro
-- porque una función que devuelve `trigger` no se puede invocar por RPC
-- y además se le revoca EXECUTE.
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- set_movement_accounting: aplica la REGLA CONTABLE en cada inserción
-- o cambio de evento/fecha. Es SECURITY INVOKER (por defecto): la
-- búsqueda del evento pasa por RLS, así que nadie puede colgar un gasto
-- en el evento de otro usuario — simplemente "no lo encuentra".
--
-- También se dispara cuando Postgres pone event_id en NULL al borrar un
-- evento (ON DELETE SET NULL): los gastos pendientes pasan a confirmados
-- porque siguen siendo dinero real que el usuario gastó.
-- ---------------------------------------------------------------------
create or replace function public.set_movement_accounting()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_event_status text;
begin
  if new.event_id is null then
    -- Un gasto ya transferido conserva el mes en que se transfirió.
    if tg_op = 'UPDATE' and old.event_id is not null and old.status = 'confirmado' then
      return new;
    end if;
    new.status := 'confirmado';
    new.accounting_date := new.occurred_on;
    return new;
  end if;

  select e.status into v_event_status
  from public.events e
  where e.id = new.event_id;

  if not found then
    raise exception 'Evento no encontrado';
  end if;

  if v_event_status = 'activo' then
    new.status := 'pendiente';
    new.accounting_date := null;
    return new;
  end if;

  -- Evento cerrado: se permite editar un gasto que ya era suyo
  -- (nota, fecha), pero no agregarle gastos nuevos.
  if tg_op = 'UPDATE' and old.event_id = new.event_id then
    return new;
  end if;
  raise exception 'El evento está cerrado';
end;
$$;

create trigger movements_accounting
  before insert or update of event_id, occurred_on on public.movements
  for each row execute function public.set_movement_accounting();

-- ---------------------------------------------------------------------
-- set_task_completed_at: marca CUÁNDO se completó una tarea. Si se
-- desmarca, la fecha se borra. Así la columna nunca contradice a is_done.
-- ---------------------------------------------------------------------
create or replace function public.set_task_completed_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not new.is_done then
    new.completed_at := null;
  elsif tg_op = 'INSERT' or not old.is_done then
    new.completed_at := now();
  else
    -- Seguía completada: se conserva la fecha original.
    new.completed_at := old.completed_at;
  end if;
  return new;
end;
$$;

create trigger event_tasks_completed_at
  before insert or update of is_done on public.event_tasks
  for each row execute function public.set_task_completed_at();

-- updated_at en todas las tablas que cambian. analytics_events no lo
-- lleva: es append-only y una fila nunca se actualiza (§4.2).
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger categories_updated_at before update on public.categories
  for each row execute function public.set_updated_at();
create trigger events_updated_at before update on public.events
  for each row execute function public.set_updated_at();
create trigger event_tasks_updated_at before update on public.event_tasks
  for each row execute function public.set_updated_at();
create trigger movements_updated_at before update on public.movements
  for each row execute function public.set_updated_at();
create trigger savings_goals_updated_at before update on public.savings_goals
  for each row execute function public.set_updated_at();
create trigger waitlist_updated_at before update on public.waitlist
  for each row execute function public.set_updated_at();


-- =====================================================================
-- 4. ROW LEVEL SECURITY — toda tabla, sin excepción (regla 7)
-- =====================================================================
alter table public.profiles         enable row level security;
alter table public.categories       enable row level security;
alter table public.events           enable row level security;
alter table public.event_tasks      enable row level security;
alter table public.movements        enable row level security;
alter table public.savings_goals    enable row level security;
alter table public.waitlist         enable row level security;
alter table public.analytics_events enable row level security;

-- profiles: cada quien ve y edita solo su perfil.
create policy profiles_select_own on public.profiles
  for select to authenticated using (id = auth.uid());
create policy profiles_update_own on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- categories: las del sistema (user_id NULL) son de lectura para todos;
-- las propias se administran libremente.
create policy categories_select on public.categories
  for select to authenticated using (user_id is null or user_id = auth.uid());
create policy categories_insert_own on public.categories
  for insert to authenticated with check (user_id = auth.uid());
create policy categories_update_own on public.categories
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy categories_delete_own on public.categories
  for delete to authenticated using (user_id = auth.uid());

-- events, movements, savings_goals: patrón "solo lo mío".
create policy events_all_own on public.events
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy movements_all_own on public.movements
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy savings_goals_all_own on public.savings_goals
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- event_tasks: pertenencia heredada del evento.
create policy event_tasks_all_own on public.event_tasks
  for all to authenticated
  using (exists (select 1 from public.events e
                 where e.id = event_tasks.event_id and e.user_id = auth.uid()))
  with check (exists (select 1 from public.events e
                      where e.id = event_tasks.event_id and e.user_id = auth.uid()));

-- waitlist: cualquiera puede anotarse; nadie puede leer la lista por API.
create policy waitlist_insert_public on public.waitlist
  for insert to anon, authenticated with check (true);

-- analytics_events: solo INSERT. IS NOT DISTINCT FROM obliga a que el
-- user_id sea exactamente la sesión actual (NULL para visitantes
-- anónimos de la landing). Nadie puede firmar eventos a nombre de otro.
create policy analytics_insert_self on public.analytics_events
  for insert to anon, authenticated
  with check (user_id is not distinct from auth.uid());


-- =====================================================================
-- 5. PRIVILEGIOS
-- Supabase concede ALL a anon/authenticated en tablas nuevas. Lo
-- revocamos y concedemos solo lo necesario. RLS decide QUÉ FILAS; los
-- privilegios deciden QUÉ OPERACIONES y QUÉ COLUMNAS (regla 10).
-- =====================================================================
revoke all on all tables in schema public from anon, authenticated;

-- Patrón: SELECT y DELETE completos; INSERT y UPDATE solo en las
-- columnas que el usuario decide. Nunca id, user_id (DEFAULT
-- auth.uid()), created_at, updated_at ni las que decide el servidor.

-- profiles: plan y onboarded_at los decide el servidor.
grant select on public.profiles to authenticated;
grant update (full_name, metadata) on public.profiles to authenticated;

-- categories: user_id sí se envía (no tiene DEFAULT; RLS exige que sea
-- el de la sesión).
grant select, delete on public.categories to authenticated;
grant insert (user_id, name, icon, color, kind, metadata) on public.categories to authenticated;
grant update (name, icon, color, kind, metadata) on public.categories to authenticated;

-- events: status y closed_at solo los cambia la RPC de cierre. En v1.2
-- inicial el INSERT era completo y permitía crear un evento ya
-- "cerrado"; ahora tampoco se puede.
grant select, delete on public.events to authenticated;
grant insert (name, icon, event_date, location, planned_budget, metadata)
  on public.events to authenticated;
grant update (name, icon, event_date, location, planned_budget, metadata)
  on public.events to authenticated;

-- event_tasks: completed_at lo llena el trigger.
grant select, delete on public.event_tasks to authenticated;
grant insert (event_id, title, is_done, position, metadata) on public.event_tasks to authenticated;
grant update (title, is_done, position, metadata) on public.event_tasks to authenticated;

-- movements: status y accounting_date nunca vienen del cliente.
grant select, delete on public.movements to authenticated;
grant insert (type, amount, category_id, event_id, note, occurred_on, metadata)
  on public.movements to authenticated;
grant update (type, amount, category_id, event_id, note, occurred_on, metadata)
  on public.movements to authenticated;

grant select, delete on public.savings_goals to authenticated;
grant insert (name, target_amount, saved_amount, deadline, status, metadata)
  on public.savings_goals to authenticated;
grant update (name, target_amount, saved_amount, deadline, status, metadata)
  on public.savings_goals to authenticated;

-- waitlist: status lo cambia el equipo desde el panel, no el visitante.
grant insert (email, plan_interest, source) on public.waitlist to anon, authenticated;
grant insert (session_id, event_name, device_type, properties, metadata)
  on public.analytics_events to anon, authenticated;

-- Las funciones trigger no deben poder ejecutarse por RPC.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.set_movement_accounting() from public, anon, authenticated;
revoke execute on function public.set_task_completed_at() from public, anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;


-- =====================================================================
-- 6. FUNCIONES RPC
-- =====================================================================

-- ---------------------------------------------------------------------
-- close_event_and_transfer: EL DIFERENCIADOR DEL PRODUCTO.
-- Cierra el evento y pasa sus movimientos a las finanzas personales en
-- UNA transacción: o pasa todo, o no pasa nada.
--
-- SECURITY DEFINER porque debe escribir status/accounting_date, que la
-- API tiene bloqueados. Por eso valida al dueño ella misma (regla 8,
-- hallazgo del 17/09/2026, §5.3).
-- ---------------------------------------------------------------------
create or replace function public.close_event_and_transfer(p_event_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_caller   uuid := auth.uid();
  v_event    public.events%rowtype;
  v_today    date := public.gt_today();
  v_count    integer;
  v_spent    numeric(12,2);
begin
  -- 1. Rechazo explícito de quien no tiene sesión.
  if v_caller is null then
    raise exception 'Sesión requerida';
  end if;

  -- FOR UPDATE bloquea la fila: si el usuario toca "cerrar" dos veces
  -- seguidas, la segunda llamada espera y luego ve status = 'cerrado'.
  select * into v_event from public.events where id = p_event_id for update;
  if not found then
    raise exception 'Evento no encontrado';
  end if;

  -- 2. IS DISTINCT FROM en lugar de <>: seguro ante NULL.
  if v_event.user_id is distinct from v_caller then
    raise exception 'No autorizado';
  end if;

  if v_event.status = 'cerrado' then
    raise exception 'El evento ya está cerrado';
  end if;

  update public.movements
     set status = 'confirmado', accounting_date = v_today
   where event_id = p_event_id and status = 'pendiente';

  select count(*) filter (where type = 'egreso'),
         coalesce(sum(amount) filter (where type = 'egreso'), 0)
    into v_count, v_spent
    from public.movements
   where event_id = p_event_id;

  update public.events
     set status = 'cerrado', closed_at = now()
   where id = p_event_id;

  -- La respuesta trae justo lo que piden los eventos de telemetría
  -- event_closed y expenses_transferred (§4.3).
  return jsonb_build_object(
    'planned',        v_event.planned_budget,
    'actual',         v_spent,
    'variance',       v_event.planned_budget - v_spent,
    'expenses_count', v_count,
    'total_amount',   v_spent,
    'target_month',   to_char(v_today, 'YYYY-MM')
  );
end;
$$;

revoke execute on function public.close_event_and_transfer(uuid) from public, anon;
grant execute on function public.close_event_and_transfer(uuid) to authenticated;


-- =====================================================================
-- 7. VISTAS DE LA APP (expuestas por la API)
--
-- CORRECCIÓN v1.2 (regla 9): por defecto una vista corre con los
-- permisos de su CREADOR y se salta el RLS. Sin security_invoker,
-- cualquiera con la clave anónima leería el balance de todos.
-- =====================================================================

-- Balance del mes para el Dashboard (§3, pantalla 3). Solo cuenta
-- movimientos confirmados, según la regla contable.
create view public.vw_monthly_summary
with (security_invoker = true) as
select
  m.user_id,
  date_trunc('month', m.accounting_date)::date               as month,
  coalesce(sum(m.amount) filter (where m.type = 'ingreso'), 0) as income,
  coalesce(sum(m.amount) filter (where m.type = 'egreso'), 0)  as expense,
  coalesce(sum(case when m.type = 'ingreso' then m.amount else -m.amount end), 0) as balance
from public.movements m
where m.status = 'confirmado'
group by m.user_id, date_trunc('month', m.accounting_date);

-- Presupuesto y avance de cada evento (EventCard, detalle, cierre).
create view public.vw_event_budget
with (security_invoker = true) as
select
  e.id as event_id, e.user_id, e.name, e.icon, e.event_date, e.location,
  e.status, e.planned_budget, e.closed_at,
  coalesce(m.spent, 0)          as spent_amount,
  coalesce(m.expenses_count, 0) as expenses_count,
  coalesce(t.done, 0)           as tasks_done,
  coalesce(t.total, 0)          as tasks_total
from public.events e
left join lateral (
  select sum(amount) as spent, count(*) as expenses_count
  from public.movements where event_id = e.id and type = 'egreso'
) m on true
left join lateral (
  select count(*) filter (where is_done) as done, count(*) as total
  from public.event_tasks where event_id = e.id
) t on true;

revoke all on public.vw_monthly_summary, public.vw_event_budget from anon;
grant select on public.vw_monthly_summary, public.vw_event_budget to authenticated;


-- =====================================================================
-- 8. ESQUEMA analytics (solo Looker Studio)
--
-- CORRECCIÓN v1.2: las vistas de BI agregan datos de TODOS los usuarios,
-- así que NO pueden vivir en `public` (que la API expone). El esquema
-- `analytics` no está en "Exposed schemas" de Supabase, y además se
-- revoca todo a anon/authenticated como segunda barrera.
-- Estas vistas sí corren con los permisos del creador (a propósito):
-- Looker necesita ver el agregado, nunca filas identificables.
-- =====================================================================
create schema if not exists analytics;
revoke all on schema analytics from public, anon, authenticated;

-- Usuarios activos diarios (DAU). Las semanales se agregan en Looker.
create view analytics.vw_daily_activity as
select
  (a.created_at at time zone 'America/Guatemala')::date as day,
  count(distinct a.user_id)                             as active_users,
  count(distinct a.session_id)                          as sessions,
  count(*)                                              as events
from public.analytics_events a
group by 1;

-- Eventos creados vs. cerrados por semana: mide el diferenciador.
create view analytics.vw_event_lifecycle as
select
  date_trunc('week', a.created_at at time zone 'America/Guatemala')::date as week,
  count(*) filter (where a.event_name = 'event_created')        as events_created,
  count(*) filter (where a.event_name = 'event_closed')         as events_closed,
  count(*) filter (where a.event_name = 'expenses_transferred') as transfers_completed
from public.analytics_events a
where a.event_name in ('event_created', 'event_closed', 'expenses_transferred')
group by 1;

-- En qué gastan los usuarios (sin identificar a nadie).
create view analytics.vw_category_distribution as
select
  date_trunc('month', m.accounting_date)::date as month,
  coalesce(c.name, 'Sin categoría')            as category,
  count(distinct m.user_id)                    as users,
  count(*)                                     as movements,
  sum(m.amount)                                as total_amount
from public.movements m
left join public.categories c on c.id = m.category_id
where m.type = 'egreso' and m.status = 'confirmado'
group by 1, 2;

revoke all on all tables in schema analytics from public, anon, authenticated;

-- Rol de solo lectura para Looker. Se crea SIN contraseña: asignarla a
-- mano en el SQL Editor y nunca guardarla en el repositorio (regla 1):
--   alter role looker_readonly with password '...';
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'looker_readonly') then
    create role looker_readonly login;
  end if;
end;
$$;
grant usage on schema analytics to looker_readonly;
grant select on all tables in schema analytics to looker_readonly;


-- =====================================================================
-- 9. DATOS DEL SISTEMA
-- Solo las categorías base. Los datos de prueba no van aquí: este
-- archivo reconstruye PRODUCCIÓN.
-- =====================================================================
-- Ampliadas el 24/10/2026 (migrations/20261024_categorias_ampliadas.sql):
-- reflejan cómo gana y gasta el usuario tipo (§0). Los íconos deben
-- existir en components/ui/AppIcon.tsx.
insert into public.categories (user_id, name, icon, kind) values
  (null, 'Comida',         'utensils',        'egreso'),
  (null, 'Transporte',     'bus',             'egreso'),
  (null, 'Salidas',        'party-popper',    'egreso'),
  (null, 'Despensa',       'shopping-basket', 'egreso'),
  (null, 'Estudio',        'graduation-cap',  'egreso'),
  (null, 'Salud',          'heart-pulse',     'egreso'),
  (null, 'Vivienda',       'house',           'egreso'),
  (null, 'Suscripciones',  'tv',              'egreso'),
  (null, 'Ropa',           'shirt',           'egreso'),
  (null, 'Regalos',        'gift',            'egreso'),
  (null, 'Otros',          'ellipsis',        'egreso'),
  (null, 'Salario',        'briefcase',       'ingreso'),
  (null, 'Freelance',      'laptop',          'ingreso'),
  (null, 'Ventas',         'tag',             'ingreso'),
  (null, 'Remesas',        'globe',           'ingreso'),
  (null, 'Mesada',         'wallet',          'ingreso'),
  (null, 'Regalo',         'gift',            'ingreso'),
  (null, 'Otros ingresos', 'banknote',        'ingreso');


-- =====================================================================
-- 10. RESPALDO DE PERFILES
-- Si se recrea la base en un proyecto que YA tiene cuentas (sección 0),
-- auth.users conserva a los usuarios pero profiles quedó vacía: sin
-- esto, la app diría "no encontramos tu perfil". Recrea el perfil de
-- cada cuenta con el nombre que dio al registrarse.
-- En un proyecto nuevo no hace nada (no hay cuentas todavía).
-- =====================================================================
insert into public.profiles (id, full_name)
select u.id, coalesce(u.raw_user_meta_data ->> 'full_name', '')
from auth.users u
on conflict (id) do nothing;


-- =====================================================================
-- 11. POR COBRAR (dividir cuenta) — agregado el 24/10/2026
-- Mismo contenido que migrations/20261024b_por_cobrar.sql. Va al final
-- porque depende de movements, set_updated_at y las políticas previas.
-- =====================================================================
-- --------------------------------------------------------------------
-- Tabla: una fila por persona que te debe parte de un gasto.
-- Borrar el gasto borra sus deudas (ON DELETE CASCADE): sin el gasto,
-- la deuda pierde su razón de ser.
-- --------------------------------------------------------------------
create table if not exists public.receivables (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid()
                references auth.users(id) on delete cascade,
  movement_id   uuid not null references public.movements(id) on delete cascade,
  debtor_name   text not null check (char_length(trim(debtor_name)) between 1 and 60),
  amount        numeric(12,2) not null check (amount > 0),
  status        text not null default 'pendiente'
                check (status in ('pendiente', 'cobrado')),
  -- Lo llena el trigger receivables_collected_at al marcarla cobrada.
  collected_at  timestamptz,
  metadata      jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint receivables_collected_consistency
    check ((status = 'cobrado') = (collected_at is not null))
);

create index if not exists receivables_user_status_idx on public.receivables (user_id, status);
create index if not exists receivables_movement_idx    on public.receivables (movement_id);

-- --------------------------------------------------------------------
-- Trigger: collected_at nunca contradice a status.
-- --------------------------------------------------------------------
create or replace function public.set_receivable_collected_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status <> 'cobrado' then
    new.collected_at := null;
  elsif tg_op = 'INSERT' or old.status <> 'cobrado' then
    new.collected_at := now();
  else
    new.collected_at := old.collected_at;
  end if;
  return new;
end;
$$;

drop trigger if exists receivables_collected_at on public.receivables;
create trigger receivables_collected_at
  before insert or update of status on public.receivables
  for each row execute function public.set_receivable_collected_at();

drop trigger if exists receivables_updated_at on public.receivables;
create trigger receivables_updated_at before update on public.receivables
  for each row execute function public.set_updated_at();

-- --------------------------------------------------------------------
-- RLS: solo lo mío, y solo colgado de un gasto mío.
-- --------------------------------------------------------------------
alter table public.receivables enable row level security;

drop policy if exists receivables_all_own on public.receivables;
create policy receivables_all_own on public.receivables
  for all to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (select 1 from public.movements m
                where m.id = receivables.movement_id and m.user_id = auth.uid())
  );

-- --------------------------------------------------------------------
-- Privilegios por columna (regla 10): collected_at lo pone el trigger.
-- --------------------------------------------------------------------
revoke all on public.receivables from anon, authenticated;
grant select, delete on public.receivables to authenticated;
grant insert (movement_id, debtor_name, amount, metadata) on public.receivables to authenticated;
grant update (debtor_name, amount, status, metadata) on public.receivables to authenticated;
revoke execute on function public.set_receivable_collected_at() from public, anon, authenticated;

-- --------------------------------------------------------------------
-- RPC: crea el gasto (tu parte) y sus deudas en UNA transacción.
-- SECURITY INVOKER: corre como el usuario, así RLS y los privilegios por
-- columna se aplican igual que desde la app (no necesita regla 8).
-- p_debtors: [{"name": "Ana", "amount": 100}, ...]
-- --------------------------------------------------------------------
create or replace function public.create_split_expense(
  p_amount numeric,
  p_category_id uuid,
  p_event_id uuid,
  p_note text,
  p_debtors jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_movement uuid;
  v_item     jsonb;
begin
  if auth.uid() is null then
    raise exception 'Sesión requerida';
  end if;
  if jsonb_typeof(p_debtors) is distinct from 'array'
     or jsonb_array_length(p_debtors) not between 1 and 20 then
    raise exception 'Agregá entre 1 y 20 personas';
  end if;

  insert into public.movements (type, amount, category_id, event_id, note)
  values ('egreso', p_amount, p_category_id, p_event_id, p_note)
  returning id into v_movement;

  for v_item in select * from jsonb_array_elements(p_debtors) loop
    insert into public.receivables (movement_id, debtor_name, amount)
    values (v_movement, trim(v_item ->> 'name'), (v_item ->> 'amount')::numeric);
  end loop;

  return v_movement;
end;
$$;

revoke execute on function public.create_split_expense(numeric, uuid, uuid, text, jsonb) from public, anon;
grant execute on function public.create_split_expense(numeric, uuid, uuid, text, jsonb) to authenticated;

-- --------------------------------------------------------------------
-- Vista: cuánto te deben en total (tarjeta "Te deben" del Inicio).
-- security_invoker (regla 9): cada quien ve solo lo suyo.
-- --------------------------------------------------------------------
create or replace view public.vw_receivables_summary
with (security_invoker = true) as
select
  r.user_id,
  sum(r.amount)                                as pending_total,
  count(*)                                     as pending_count,
  count(distinct lower(trim(r.debtor_name)))   as debtors_count
from public.receivables r
where r.status = 'pendiente'
group by r.user_id;

revoke all on public.vw_receivables_summary from anon;
grant select on public.vw_receivables_summary to authenticated;
