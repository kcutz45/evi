-- =====================================================================
-- 20261024b_por_cobrar.sql — EVI
-- ---------------------------------------------------------------------
-- PROPÓSITO: "Dividir cuenta / Por cobrar". Pagás Q300 de una cena de 3:
--            se guarda como gasto solo TU parte (Q100) y los Q200 quedan
--            "por cobrar" a nombre de cada persona.
--
-- POR QUÉ EXISTE: Propuesta aprobada el 24/10/2026 (EVI_SPEC.md §0).
--
-- REGLA CONTABLE:
--   * El balance del mes cuenta solo tu parte (es lo que de verdad
--     gastaste). Lo prestado se ve aparte en vw_receivables_summary.
--   * Cobrar NO es un ingreso: solo marca la deuda como cobrada. Así los
--     reportes no muestran plata "ganada" que solo regresó.
--
-- SEGURO DE CORRER: no toca datos existentes. Idempotente.
-- CÓMO SE USA: SQL Editor de Supabase → pegar → Run.
-- schema.sql ya incluye todo esto para bases nuevas.
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
