-- =====================================================================
-- 20261024c_cuentas_y_metas.sql — EVI
-- ---------------------------------------------------------------------
-- PROPÓSITO: "Mis cuentas" (Efectivo, bancos, billeteras) y abonos a las
--            metas de ahorro desde una cuenta.
--
-- POR QUÉ EXISTE: Propuesta aprobada el 24/10/2026 (EVI_SPEC.md §0). La
--            gente tiene su dinero en varios lados y quiere saber cuánto
--            hay en cada uno. Aparece un segundo número, distinto del
--            balance del mes:
--
--   * BALANCE DEL MES = ingresos − gastos confirmados (no cambia).
--   * SALDO DE UNA CUENTA = saldo inicial + ingresos − lo que pagaste
--     desde ella (la cuenta COMPLETA, aunque la hayás dividido) + cobros
--     que entraron + transferencias recibidas − enviadas − abonos a metas.
--
-- REGLAS:
--   * La cuenta de un movimiento es opcional (account_id NULL = sin
--     cuenta): los movimientos viejos siguen valiendo.
--   * Un gasto de evento ACTIVO ya salió de tu bolsa: baja el saldo de
--     la cuenta aunque todavía no cuente en el balance del mes (§4d).
--   * Cobrar sigue sin ser ingreso: sube el saldo de la cuenta donde te
--     pagaron (collected_account_id), no el balance.
--   * Abonar a una meta aparta dinero: baja el saldo disponible de la
--     cuenta y sube lo ahorrado en la meta. Un abono negativo es un retiro.
--   * Nadie puede usar una cuenta o meta ajena (RLS + triggers).
--
-- SEGURO DE CORRER: no borra ni cambia datos existentes; crea "Efectivo"
-- (saldo inicial Q0) a cada usuario. Idempotente.
-- CÓMO SE USA: SQL Editor de Supabase → pegar → Run.
-- schema.sql (§12) ya incluye todo esto para bases nuevas.
-- =====================================================================

-- --------------------------------------------------------------------
-- 1. Cuentas
-- --------------------------------------------------------------------
create table if not exists public.accounts (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null default auth.uid()
                   references auth.users(id) on delete cascade,
  name             text not null check (char_length(trim(name)) between 1 and 40),
  kind             text not null default 'efectivo'
                   check (kind in ('efectivo', 'banco', 'digital', 'otro')),
  icon             text not null default 'wallet',
  -- Lo que había al empezar a usar EVI. No es un ingreso.
  opening_balance  numeric(12,2) not null default 0,
  archived         boolean not null default false,
  metadata         jsonb not null default '{}'::jsonb,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create unique index if not exists accounts_user_name_uidx on public.accounts (user_id, lower(trim(name)));

drop trigger if exists accounts_updated_at on public.accounts;
create trigger accounts_updated_at before update on public.accounts
  for each row execute function public.set_updated_at();

alter table public.accounts enable row level security;
drop policy if exists accounts_all_own on public.accounts;
create policy accounts_all_own on public.accounts
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

revoke all on public.accounts from anon, authenticated;
grant select, delete on public.accounts to authenticated;
grant insert (name, kind, icon, opening_balance, metadata) on public.accounts to authenticated;
grant update (name, kind, icon, opening_balance, archived, metadata) on public.accounts to authenticated;

-- --------------------------------------------------------------------
-- 2. Validación de propietario para columnas que apuntan a una cuenta
--    (regla 8). SECURITY INVOKER: la consulta pasa por RLS, así una
--    cuenta ajena simplemente "no existe".
-- --------------------------------------------------------------------
create or replace function public.assert_own_account(p_account uuid)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if p_account is not null
     and not exists (select 1 from public.accounts a where a.id = p_account and a.user_id = auth.uid()) then
    raise exception 'Cuenta no encontrada';
  end if;
end;
$$;

revoke execute on function public.assert_own_account(uuid) from public, anon;
grant execute on function public.assert_own_account(uuid) to authenticated;

-- --------------------------------------------------------------------
-- 3. Movimientos: de qué cuenta salió / a qué cuenta entró
-- --------------------------------------------------------------------
alter table public.movements
  add column if not exists account_id uuid references public.accounts(id) on delete set null;
create index if not exists movements_account_idx on public.movements (account_id);

create or replace function public.check_movement_account()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  perform public.assert_own_account(new.account_id);
  return new;
end;
$$;

drop trigger if exists movements_account_owner on public.movements;
create trigger movements_account_owner
  before insert or update of account_id on public.movements
  for each row execute function public.check_movement_account();

grant insert (account_id) on public.movements to authenticated;
grant update (account_id) on public.movements to authenticated;

-- --------------------------------------------------------------------
-- 4. Cobros: en qué cuenta te pagaron. Al deshacer el cobro se borra.
-- --------------------------------------------------------------------
alter table public.receivables
  add column if not exists collected_account_id uuid references public.accounts(id) on delete set null;

create or replace function public.set_receivable_collected_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status <> 'cobrado' then
    new.collected_at := null;
    new.collected_account_id := null;
  elsif tg_op = 'INSERT' or old.status <> 'cobrado' then
    new.collected_at := now();
  else
    new.collected_at := old.collected_at;
  end if;
  return new;
end;
$$;

create or replace function public.check_receivable_account()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  perform public.assert_own_account(new.collected_account_id);
  return new;
end;
$$;

drop trigger if exists receivables_account_owner on public.receivables;
create trigger receivables_account_owner
  before insert or update of collected_account_id on public.receivables
  for each row execute function public.check_receivable_account();

drop trigger if exists receivables_collected_at on public.receivables;
create trigger receivables_collected_at
  before insert or update of status, collected_account_id on public.receivables
  for each row execute function public.set_receivable_collected_at();

grant update (collected_account_id) on public.receivables to authenticated;

-- --------------------------------------------------------------------
-- 5. Transferencias entre tus cuentas (ej. retiro del cajero)
-- --------------------------------------------------------------------
create table if not exists public.account_transfers (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null default auth.uid()
                   references auth.users(id) on delete cascade,
  from_account_id  uuid not null references public.accounts(id) on delete cascade,
  to_account_id    uuid not null references public.accounts(id) on delete cascade,
  amount           numeric(12,2) not null check (amount > 0),
  occurred_on      date not null default public.gt_today(),
  note             text check (char_length(note) <= 140),
  created_at       timestamptz not null default now(),
  constraint account_transfers_distintas check (from_account_id <> to_account_id)
);

create index if not exists account_transfers_from_idx on public.account_transfers (from_account_id);
create index if not exists account_transfers_to_idx   on public.account_transfers (to_account_id);

alter table public.account_transfers enable row level security;
drop policy if exists account_transfers_all_own on public.account_transfers;
create policy account_transfers_all_own on public.account_transfers
  for all to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (select 1 from public.accounts a where a.id = from_account_id and a.user_id = auth.uid())
    and exists (select 1 from public.accounts a where a.id = to_account_id and a.user_id = auth.uid())
  );

revoke all on public.account_transfers from anon, authenticated;
grant select, delete on public.account_transfers to authenticated;
grant insert (from_account_id, to_account_id, amount, occurred_on, note) on public.account_transfers to authenticated;

-- --------------------------------------------------------------------
-- 6. Metas: ícono, y saved_amount pasa a calcularlo el servidor
-- --------------------------------------------------------------------
alter table public.savings_goals add column if not exists icon text not null default 'piggy-bank';

revoke insert, update on public.savings_goals from authenticated;
grant insert (name, icon, target_amount, deadline, metadata) on public.savings_goals to authenticated;
grant update (name, icon, target_amount, deadline, status, metadata) on public.savings_goals to authenticated;

-- Abonos (positivos) y retiros (negativos) a una meta, desde una cuenta.
create table if not exists public.savings_contributions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid()
               references auth.users(id) on delete cascade,
  goal_id      uuid not null references public.savings_goals(id) on delete cascade,
  account_id   uuid references public.accounts(id) on delete set null,
  amount       numeric(12,2) not null check (amount <> 0),
  occurred_on  date not null default public.gt_today(),
  created_at   timestamptz not null default now()
);

create index if not exists savings_contributions_goal_idx    on public.savings_contributions (goal_id);
create index if not exists savings_contributions_account_idx on public.savings_contributions (account_id);

alter table public.savings_contributions enable row level security;
drop policy if exists savings_contributions_all_own on public.savings_contributions;
create policy savings_contributions_all_own on public.savings_contributions
  for all to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (select 1 from public.savings_goals g where g.id = goal_id and g.user_id = auth.uid())
    and (account_id is null
         or exists (select 1 from public.accounts a where a.id = account_id and a.user_id = auth.uid()))
  );

revoke all on public.savings_contributions from anon, authenticated;
grant select, delete on public.savings_contributions to authenticated;
grant insert (goal_id, account_id, amount, occurred_on) on public.savings_contributions to authenticated;

-- saved_amount = suma de abonos. Si un retiro la dejaría negativa, el
-- CHECK (saved_amount >= 0) de la tabla rechaza toda la operación.
-- Al llegar al objetivo pasa a 'completada'; si se retira, vuelve a 'activa'.
-- SECURITY DEFINER: el usuario ya no tiene UPDATE sobre saved_amount.
-- Solo toca la meta del abono, que RLS ya validó como propia.
create or replace function public.sync_goal_saved_amount()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_goal uuid := coalesce(new.goal_id, old.goal_id);
begin
  update public.savings_goals g
     set saved_amount = s.total,
         status = case
           when g.status = 'archivada' then g.status
           when s.total >= g.target_amount then 'completada'
           else 'activa' end
    from (select coalesce(sum(c.amount), 0) as total
            from public.savings_contributions c where c.goal_id = v_goal) s
   where g.id = v_goal;
  return null;
end;
$$;

revoke execute on function public.sync_goal_saved_amount() from public, anon, authenticated;

drop trigger if exists savings_contributions_sync on public.savings_contributions;
create trigger savings_contributions_sync
  after insert or delete on public.savings_contributions
  for each row execute function public.sync_goal_saved_amount();

-- --------------------------------------------------------------------
-- 7. Dividir cuenta: ahora también recibe de qué cuenta pagaste.
--    Se reemplaza la versión de 5 parámetros (evita llamadas ambiguas).
-- --------------------------------------------------------------------
drop function if exists public.create_split_expense(numeric, uuid, uuid, text, jsonb);

create or replace function public.create_split_expense(
  p_amount numeric,
  p_category_id uuid,
  p_event_id uuid,
  p_note text,
  p_debtors jsonb,
  p_account_id uuid default null
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

  insert into public.movements (type, amount, category_id, event_id, note, account_id)
  values ('egreso', p_amount, p_category_id, p_event_id, p_note, p_account_id)
  returning id into v_movement;

  for v_item in select * from jsonb_array_elements(p_debtors) loop
    insert into public.receivables (movement_id, debtor_name, amount)
    values (v_movement, trim(v_item ->> 'name'), (v_item ->> 'amount')::numeric);
  end loop;

  return v_movement;
end;
$$;

revoke execute on function public.create_split_expense(numeric, uuid, uuid, text, jsonb, uuid) from public, anon;
grant execute on function public.create_split_expense(numeric, uuid, uuid, text, jsonb, uuid) to authenticated;

-- --------------------------------------------------------------------
-- 8. Vista: saldo de cada cuenta (security_invoker, regla 9)
-- --------------------------------------------------------------------
create or replace view public.vw_account_balances
with (security_invoker = true) as
select
  a.id as account_id,
  a.user_id,
  a.name,
  a.kind,
  a.icon,
  a.archived,
  a.opening_balance,
  a.created_at,
  a.opening_balance
  + coalesce((select sum(case when m.type = 'ingreso' then m.amount else -m.amount end)
                from public.movements m where m.account_id = a.id), 0)
  -- Lo que pagaste por otros también salió de esta cuenta.
  - coalesce((select sum(r.amount) from public.receivables r
                join public.movements m on m.id = r.movement_id
               where m.account_id = a.id), 0)
  + coalesce((select sum(r.amount) from public.receivables r
               where r.collected_account_id = a.id and r.status = 'cobrado'), 0)
  + coalesce((select sum(t.amount) from public.account_transfers t where t.to_account_id = a.id), 0)
  - coalesce((select sum(t.amount) from public.account_transfers t where t.from_account_id = a.id), 0)
  - coalesce((select sum(c.amount) from public.savings_contributions c where c.account_id = a.id), 0)
    as balance
from public.accounts a;

revoke all on public.vw_account_balances from anon;
grant select on public.vw_account_balances to authenticated;

-- --------------------------------------------------------------------
-- 9. "Efectivo" para todos: los usuarios de hoy y los que se registren.
-- --------------------------------------------------------------------
create or replace function public.create_default_account()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.accounts (user_id, name, kind, icon)
  values (new.id, 'Efectivo', 'efectivo', 'wallet')
  on conflict do nothing;
  return new;
end;
$$;

revoke execute on function public.create_default_account() from public, anon, authenticated;

drop trigger if exists profiles_default_account on public.profiles;
create trigger profiles_default_account
  after insert on public.profiles
  for each row execute function public.create_default_account();

insert into public.accounts (user_id, name, kind, icon)
select p.id, 'Efectivo', 'efectivo', 'wallet'
  from public.profiles p
 where not exists (select 1 from public.accounts a where a.user_id = p.id)
on conflict do nothing;
