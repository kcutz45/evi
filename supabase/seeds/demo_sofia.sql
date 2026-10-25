
/*
   demo_sofia.sql — EVI · DATOS FICTICIOS DE PRUEBA
   ---------------------------------------------------------------------
   PROPÓSITO: Llenar la cuenta de Sofía con 3 meses de datos realistas
              para probar TODAS las pantallas: Inicio, Dinero, Reporte,
              Eventos (activos, con alerta, excedido y cerrados), Te deben,
              Mis cuentas, transferencias y Metas.
   
   REQUISITOS:
     1. La cuenta de Sofía ya existe (se registró en la app).
     2. Ya se aplicó migrations/20261024c_cuentas_y_metas.sql.
   
   CÓMO SE USA: SQL Editor de Supabase → pegar todo → Run.
     * Busca a Sofía por correo (cambiá v_correo si hace falta) o, si no,
       por un perfil cuyo nombre empiece con "Sof".
     * Se puede correr varias veces: borra lo que creó la vez anterior
       (todo va marcado con metadata.seed = 'sofia-demo') y lo vuelve a
       crear. NO toca nada que Sofía haya registrado a mano.
     * Las fechas son relativas a HOY: mes actual, anterior y antepasado.
   
   POR QUÉ ASÍ: los datos pasan por los mismos triggers y funciones que
     la app (estado pendiente/confirmado, cierre de eventos, cuentas
     divididas, saldo de metas). Para eso se simula la sesión de Sofía
     con request.jwt.claims, como hace Supabase con un usuario real.
*/

-- ---------------------------------------------------------------------
-- Ayudantes temporales (solo existen durante esta ejecución).
-- ---------------------------------------------------------------------
-- Fecha relativa: mes 0 = este mes, -1 = el anterior. Nunca en el futuro.
create or replace function pg_temp.fd(p_mes int, p_dia int) returns date
language sql stable as $$
  select least(
    (date_trunc('month', public.gt_today()) + make_interval(months => p_mes, days => p_dia - 1))::date,
    public.gt_today()
  )
$$;

create or replace function pg_temp.cat(p_nombre text, p_tipo text, p_user uuid) returns uuid
language sql stable as $$
  select id from public.categories
   where name = p_nombre and kind = p_tipo and (user_id is null or user_id = p_user)
   order by user_id nulls last limit 1
$$;

create or replace function pg_temp.cta(p_nombre text, p_user uuid) returns uuid
language sql stable as $$
  select id from public.accounts where name = p_nombre and user_id = p_user
$$;

do $$
declare
  v_correo text := 'sofia@correo.com';   -- ← cambiá esto por el correo real de Sofía
  v_user   uuid;
  v_seed   jsonb := '{"seed": "sofia-demo"}';
  v_mov    uuid;
  v_e1 uuid; v_e2 uuid; v_e3 uuid; v_e4 uuid; v_e5 uuid;
  v_g1 uuid; v_g2 uuid; v_g3 uuid; v_g4 uuid;
begin
  -- ------------------------------------------------------------------
  -- 0. ¿Quién es Sofía? ¿Está aplicada la migración de cuentas?
  -- ------------------------------------------------------------------
  if to_regclass('public.accounts') is null then
    raise exception 'Primero aplicá migrations/20261024c_cuentas_y_metas.sql';
  end if;

  select id into v_user from auth.users where lower(email) = lower(v_correo);
  if v_user is null then
    select p.id into v_user from public.profiles p where p.full_name ilike 'sof%';
    if (select count(*) from public.profiles where full_name ilike 'sof%') > 1 then
      raise exception 'Hay varios perfiles que empiezan con "Sof": poné el correo en v_correo';
    end if;
  end if;
  if v_user is null then
    raise exception 'No encontré a Sofía. Poné su correo en v_correo (busca v_correo más abajo)';
  end if;
  raise notice 'Cargando datos para el usuario %', v_user;

  -- Simula la sesión de Sofía: auth.uid() devuelve su id en esta transacción.
  perform set_config('request.jwt.claims', json_build_object('sub', v_user, 'role', 'authenticated')::text, true);

  -- ------------------------------------------------------------------
  -- 1. Limpieza de la corrida anterior (solo lo marcado como demo)
  -- ------------------------------------------------------------------
  delete from public.savings_goals where user_id = v_user and metadata @> v_seed;   -- y sus abonos
  delete from public.movements     where user_id = v_user and metadata @> v_seed;   -- y sus deudas
  delete from public.events        where user_id = v_user and metadata @> v_seed;   -- y sus tareas
  delete from public.account_transfers where user_id = v_user and note like '[demo]%';
  delete from public.accounts      where user_id = v_user and metadata @> v_seed;
  delete from public.categories    where user_id = v_user and metadata @> v_seed;

  -- ------------------------------------------------------------------
  -- 2. Cuentas: Efectivo (ya existe) + 3 nuevas, con su saldo inicial
  -- ------------------------------------------------------------------
  insert into public.accounts (user_id, name, kind, icon)
  select v_user, 'Efectivo', 'efectivo', 'wallet'
   where not exists (select 1 from public.accounts where user_id = v_user and lower(name) = 'efectivo');
  update public.accounts set opening_balance = 400, archived = false
   where user_id = v_user and lower(name) = 'efectivo';

  insert into public.accounts (user_id, name, kind, icon, opening_balance, metadata) values
    (v_user, 'Banco Industrial', 'banco',   'landmark',   8000, v_seed),
    (v_user, 'Zigi',             'digital', 'smartphone',  150, v_seed),
    (v_user, 'BAM Ahorro',       'banco',   'piggy-bank', 2000, v_seed);

  -- ------------------------------------------------------------------
  -- 3. Categorías propias ("Mis categorías")
  -- ------------------------------------------------------------------
  insert into public.categories (user_id, name, icon, kind, metadata) values
    (v_user, 'Gym',      'dumbbell', 'egreso',  v_seed),
    (v_user, 'Propinas', 'banknote', 'ingreso', v_seed)
  on conflict do nothing;

  -- ------------------------------------------------------------------
  -- 4. Movimientos de 3 meses (sin evento: quedan confirmados)
  --    (tipo, monto, categoría, nota, mes, día, cuenta)
  -- ------------------------------------------------------------------
  insert into public.movements (user_id, type, amount, category_id, note, occurred_on, account_id, metadata)
  select v_user, m.tipo, m.monto, pg_temp.cat(m.cat, m.tipo, v_user), m.nota,
         pg_temp.fd(m.mes, m.dia), pg_temp.cta(m.cuenta, v_user), v_seed
    from (values
      -- Mes antepasado
      ('ingreso', 5250.00, 'Salario',       'Salario',                 -2,  1, 'Banco Industrial'),
      ('ingreso',  350.00, 'Ventas',        'Venta de pulseras',       -2, 12, 'Efectivo'),
      ('egreso',  1500.00, 'Vivienda',      'Renta del apartamento',   -2,  2, 'Banco Industrial'),
      ('egreso',   120.00, 'Suscripciones', 'Netflix + Spotify',       -2,  3, 'Banco Industrial'),
      ('egreso',   175.00, 'Gym',           'Mensualidad del gym',     -2,  5, 'Banco Industrial'),
      ('egreso',   410.75, 'Despensa',      'Súper La Torre',          -2,  6, 'Banco Industrial'),
      ('egreso',    45.00, 'Comida',        'Almuerzo en la U',        -2,  7, 'Efectivo'),
      ('egreso',   150.00, 'Transporte',    'Gasolina',                -2,  9, 'Banco Industrial'),
      ('egreso',   350.00, 'Estudio',       'Libro de estadística',    -2, 11, 'Banco Industrial'),
      ('egreso',    62.50, 'Comida',        'Pollo Campero',           -2, 14, 'Efectivo'),
      ('egreso',   220.00, 'Salidas',       'Cine y cena',             -2, 16, 'Banco Industrial'),
      ('egreso',    25.00, 'Transporte',    'Uber a la U',             -2, 18, 'Zigi'),
      ('egreso',   385.20, 'Despensa',      'Paiz',                    -2, 20, 'Banco Industrial'),
      ('egreso',    38.00, 'Comida',        'Café con Andrea',         -2, 22, 'Efectivo'),
      ('egreso',   180.00, 'Salud',         'Consulta médica',         -2, 25, 'Banco Industrial'),
      ('egreso',    95.00, 'Ropa',          'Playera',                 -2, 27, 'Zigi'),
      -- Mes anterior
      ('ingreso', 5250.00, 'Salario',       'Salario',                 -1,  1, 'Banco Industrial'),
      ('ingreso', 1200.00, 'Freelance',     'Diseño de logo',          -1, 18, 'Zigi'),
      ('ingreso',  150.00, 'Propinas',      'Propinas de un evento',   -1, 21, 'Efectivo'),
      ('egreso',  1500.00, 'Vivienda',      'Renta del apartamento',   -1,  2, 'Banco Industrial'),
      ('egreso',   120.00, 'Suscripciones', 'Netflix + Spotify',       -1,  3, 'Banco Industrial'),
      ('egreso',    54.00, 'Comida',        'Almuerzo en la U',        -1,  4, 'Efectivo'),
      ('egreso',   175.00, 'Gym',           'Mensualidad del gym',     -1,  5, 'Banco Industrial'),
      ('egreso',   650.00, 'Estudio',       'Inscripción curso',       -1,  5, 'Banco Industrial'),
      ('egreso',   520.40, 'Despensa',      'Súper La Torre',          -1,  7, 'Banco Industrial'),
      ('egreso',   150.00, 'Transporte',    'Gasolina',                -1, 10, 'Banco Industrial'),
      ('egreso',    75.00, 'Otros',         'Corte de pelo',           -1, 12, 'Efectivo'),
      ('egreso',    89.90, 'Comida',        'Pizza',                   -1, 13, 'Efectivo'),
      ('egreso',   260.00, 'Regalos',       'Regalo para mamá',        -1, 15, 'Banco Industrial'),
      ('egreso',    32.00, 'Transporte',    'Uber',                    -1, 19, 'Zigi'),
      ('egreso',   298.60, 'Despensa',      'Despensa Familiar',       -1, 22, 'Banco Industrial'),
      ('egreso',    41.00, 'Comida',        'Almuerzo',                -1, 24, 'Efectivo'),
      ('egreso',   140.00, 'Salidas',       'Concierto',               -1, 26, 'Zigi'),
      -- Este mes
      ('ingreso', 5250.00, 'Salario',       'Salario',                  0,  1, 'Banco Industrial'),
      ('ingreso',  400.00, 'Remesas',       'Remesa de mi tío',         0, 10, 'Zigi'),
      ('ingreso',  200.00, 'Ventas',        'Venta de pulseras',        0, 14, 'Efectivo'),
      ('egreso',  1500.00, 'Vivienda',      'Renta del apartamento',    0,  2, 'Banco Industrial'),
      ('egreso',   120.00, 'Suscripciones', 'Netflix + Spotify',        0,  3, 'Banco Industrial'),
      ('egreso',   175.00, 'Gym',           'Mensualidad del gym',      0,  5, 'Banco Industrial'),
      ('egreso',   467.30, 'Despensa',      'Súper La Torre',           0,  6, 'Banco Industrial'),
      ('egreso',    48.00, 'Comida',        'Almuerzo en la U',         0,  6, 'Efectivo'),
      ('egreso',   150.00, 'Transporte',    'Gasolina',                 0,  8, 'Banco Industrial'),
      ('egreso',    72.50, 'Comida',        'Shucos',                   0, 11, 'Efectivo'),
      ('egreso',   210.00, 'Salud',         'Farmacia',                 0, 13, 'Banco Industrial'),
      ('egreso',    28.00, 'Transporte',    'Uber',                     0, 16, 'Zigi'),
      ('egreso',    36.00, 'Comida',        'Café',                     0, 17, 'Efectivo'),
      ('egreso',   312.15, 'Despensa',      'Paiz',                     0, 19, 'Banco Industrial'),
      ('egreso',   320.00, 'Ropa',          'Zapatos',                  0, 20, 'Banco Industrial'),
      ('egreso',    58.00, 'Comida',        'Almuerzo',                 0, 22, 'Efectivo')
    ) as m(tipo, monto, cat, nota, mes, dia, cuenta);

  -- Uno "sin cuenta", para ver que la cuenta es opcional.
  insert into public.movements (user_id, type, amount, category_id, note, occurred_on, metadata)
  values (v_user, 'egreso', 15, pg_temp.cat('Otros', 'egreso', v_user), 'Chicle y agua', pg_temp.fd(0, 21), v_seed);

  -- ------------------------------------------------------------------
  -- 5. Transferencias entre cuentas (cajero y ahorro)
  -- ------------------------------------------------------------------
  insert into public.account_transfers (user_id, from_account_id, to_account_id, amount, occurred_on, note) values
    (v_user, pg_temp.cta('Banco Industrial', v_user), pg_temp.cta('Efectivo', v_user),   600, pg_temp.fd(-2, 1),  '[demo] Cajero'),
    (v_user, pg_temp.cta('Banco Industrial', v_user), pg_temp.cta('Efectivo', v_user),   600, pg_temp.fd(-1, 1),  '[demo] Cajero'),
    (v_user, pg_temp.cta('Banco Industrial', v_user), pg_temp.cta('BAM Ahorro', v_user), 1000, pg_temp.fd(-1, 16), '[demo] Al ahorro'),
    (v_user, pg_temp.cta('Banco Industrial', v_user), pg_temp.cta('Efectivo', v_user),   600, pg_temp.fd(0, 1),   '[demo] Cajero');

  -- ------------------------------------------------------------------
  -- 6. Cuentas divididas (Te deben): con la misma RPC que usa la app
  -- ------------------------------------------------------------------
  v_mov := public.create_split_expense(150, pg_temp.cat('Salidas', 'egreso', v_user), null, 'Cena en Antigua',
    '[{"name":"Cris","amount":150},{"name":"Sebastian","amount":150}]', pg_temp.cta('Banco Industrial', v_user));
  update public.movements set occurred_on = pg_temp.fd(-1, 20), metadata = v_seed where id = v_mov;
  update public.receivables set status = 'cobrado', collected_account_id = pg_temp.cta('Efectivo', v_user)
   where movement_id = v_mov and debtor_name = 'Cris';

  v_mov := public.create_split_expense(30, pg_temp.cat('Transporte', 'egreso', v_user), null, 'Uber compartido',
    '[{"name":"Ana","amount":30},{"name":"Luis","amount":30}]', pg_temp.cta('Zigi', v_user));
  update public.movements set occurred_on = pg_temp.fd(0, 9), metadata = v_seed where id = v_mov;

  v_mov := public.create_split_expense(80, pg_temp.cat('Comida', 'egreso', v_user), null, 'Pizza del viernes',
    '[{"name":"Cris","amount":80},{"name":"Andrea","amount":80}]', pg_temp.cta('Efectivo', v_user));
  update public.movements set occurred_on = pg_temp.fd(0, 18), metadata = v_seed where id = v_mov;
  update public.receivables set status = 'cobrado', collected_account_id = pg_temp.cta('Zigi', v_user)
   where movement_id = v_mov and debtor_name = 'Andrea';

  v_mov := public.create_split_expense(100, pg_temp.cat('Regalos', 'egreso', v_user), null, 'Regalo de Kevin',
    '[{"name":"Sebastian","amount":100},{"name":"Ana","amount":100}]', pg_temp.cta('Banco Industrial', v_user));
  update public.movements set occurred_on = pg_temp.fd(0, 21), metadata = v_seed where id = v_mov;

  -- ------------------------------------------------------------------
  -- 7. Eventos
  --    E1 activo al 85% (alerta dorada) · E2 activo tranquilo ·
  --    E3 activo EXCEDIDO · E4 cerrado el mes pasado · E5 cerrado este mes
  -- ------------------------------------------------------------------
  insert into public.events (user_id, name, icon, event_date, location, planned_budget, metadata)
  values (v_user, 'Cumpleaños de Sofía', 'cake', public.gt_today() + 21, 'Casa de mis papás, Xela', 2000, v_seed)
  returning id into v_e1;
  insert into public.events (user_id, name, icon, event_date, location, planned_budget, metadata)
  values (v_user, 'Viaje a Monterrico', 'tree-palm', public.gt_today() + 45, 'Monterrico, Santa Rosa', 4000, v_seed)
  returning id into v_e2;
  insert into public.events (user_id, name, icon, event_date, location, planned_budget, metadata)
  values (v_user, 'Posada de la oficina', 'gift', public.gt_today() + 10, null, 800, v_seed)
  returning id into v_e3;
  insert into public.events (user_id, name, icon, event_date, location, planned_budget, metadata)
  values (v_user, 'Cena de generación', 'utensils', pg_temp.fd(-1, 20), 'Restaurante Hacienda Real', 1500, v_seed)
  returning id into v_e4;
  insert into public.events (user_id, name, icon, event_date, location, planned_budget, metadata)
  values (v_user, 'Baby shower de Ana', 'party-popper', pg_temp.fd(0, 12), 'Casa de Ana', 600, v_seed)
  returning id into v_e5;

  -- Gastos de los eventos (mientras están activos quedan "pendientes").
  insert into public.movements (user_id, type, amount, category_id, note, occurred_on, account_id, event_id, metadata)
  select v_user, 'egreso', g.monto, pg_temp.cat(g.cat, 'egreso', v_user), g.nota, g.fecha,
         pg_temp.cta(g.cuenta, v_user), g.evento, v_seed
    from (values
      (v_e1, 350.00, 'Comida',   'Pastel',                pg_temp.fd(0, 15), 'Banco Industrial'),
      (v_e1, 320.00, 'Otros',    'Decoración',            pg_temp.fd(0, 17), 'Efectivo'),
      (v_e1, 400.00, 'Salidas',  'Alquiler de bocinas',   pg_temp.fd(0, 19), 'Banco Industrial'),
      (v_e1, 630.00, 'Despensa', 'Comida para invitados', pg_temp.fd(0, 22), 'Banco Industrial'),
      (v_e2, 800.00, 'Salidas',  'Depósito del hotel',    pg_temp.fd(0, 10), 'Banco Industrial'),
      (v_e2, 150.00, 'Salud',    'Bloqueador y repelente', pg_temp.fd(0, 20), 'Zigi'),
      (v_e3, 350.00, 'Regalos',  'Intercambio de regalos', pg_temp.fd(0, 12), 'Banco Industrial'),
      (v_e3, 420.00, 'Comida',   'Tamales',               pg_temp.fd(0, 18), 'Efectivo'),
      (v_e3, 150.00, 'Despensa', 'Ponche',                pg_temp.fd(0, 20), 'Efectivo'),
      (v_e4, 500.00, 'Salidas',  'Reserva del salón',     pg_temp.fd(-1, 8), 'Banco Industrial'),
      (v_e4, 620.00, 'Comida',   'Menú de la cena',       pg_temp.fd(-1, 20), 'Banco Industrial'),
      (v_e4, 120.00, 'Otros',    'Propina',               pg_temp.fd(-1, 20), 'Banco Industrial'),
      (v_e5, 280.00, 'Regalos',  'Regalo para el bebé',   pg_temp.fd(0, 9), 'Banco Industrial'),
      (v_e5, 260.00, 'Otros',    'Globos y piñata',       pg_temp.fd(0, 11), 'Efectivo')
    ) as g(evento, monto, cat, nota, fecha, cuenta);

  -- Tareas (checklist).
  insert into public.event_tasks (event_id, title, is_done, position)
  select t.evento, t.titulo, t.hecha, t.pos
    from (values
      (v_e1, 'Reservar el salón', true, 0), (v_e1, 'Confirmar el pastel', true, 1),
      (v_e1, 'Comprar decoración', true, 2), (v_e1, 'Enviar invitaciones', false, 3),
      (v_e1, 'Hacer la playlist', false, 4), (v_e1, 'Comprar hielo', false, 5),
      (v_e2, 'Reservar hotel', true, 0), (v_e2, 'Alquilar carro', false, 1),
      (v_e2, 'Hacer lista de compras', false, 2), (v_e2, 'Comprar bloqueador', false, 3),
      (v_e2, 'Confirmar quién va', false, 4), (v_e2, 'Revisar el clima', false, 5),
      (v_e3, 'Organizar intercambio', true, 0), (v_e3, 'Encargar tamales', true, 1),
      (v_e3, 'Preparar el ponche', false, 2),
      (v_e4, 'Reservar restaurante', true, 0), (v_e4, 'Cobrar la cuota', true, 1),
      (v_e4, 'Preparar el discurso', true, 2), (v_e4, 'Tomar la foto grupal', true, 3),
      (v_e5, 'Comprar el regalo', true, 0), (v_e5, 'Inflar globos', true, 1)
    ) as t(evento, titulo, hecha, pos);

  -- Cierre con la misma función atómica de la app, y luego se le pone la
  -- fecha de cierre "real" (E4: el mes pasado; E5: este mes).
  perform public.close_event_and_transfer(v_e4);
  update public.events set closed_at = pg_temp.fd(-1, 28) + time '20:00' where id = v_e4;
  update public.movements set accounting_date = pg_temp.fd(-1, 28) where event_id = v_e4;

  perform public.close_event_and_transfer(v_e5);
  update public.events set closed_at = pg_temp.fd(0, 13) + time '19:00' where id = v_e5;
  update public.movements set accounting_date = pg_temp.fd(0, 13) where event_id = v_e5;

  -- ------------------------------------------------------------------
  -- 8. Metas de ahorro y sus abonos (el trigger calcula lo ahorrado)
  -- ------------------------------------------------------------------
  insert into public.savings_goals (user_id, name, icon, target_amount, deadline, metadata)
  values (v_user, 'Laptop nueva', 'laptop', 6500, public.gt_today() + 120, v_seed) returning id into v_g1;
  insert into public.savings_goals (user_id, name, icon, target_amount, metadata)
  values (v_user, 'Viaje a la playa', 'tree-palm', 2000, v_seed) returning id into v_g2;
  insert into public.savings_goals (user_id, name, icon, target_amount, metadata)
  values (v_user, 'Curso de inglés', 'graduation-cap', 1200, v_seed) returning id into v_g3;
  insert into public.savings_goals (user_id, name, icon, target_amount, metadata)
  values (v_user, 'Celular nuevo', 'smartphone', 1500, v_seed) returning id into v_g4;
  insert into public.savings_goals (user_id, name, icon, target_amount, deadline, metadata)
  values (v_user, 'Fondo de emergencia', 'heart-pulse', 10000, public.gt_today() + 365, v_seed);

  insert into public.savings_contributions (user_id, goal_id, account_id, amount, occurred_on) values
    (v_user, v_g1, pg_temp.cta('Banco Industrial', v_user), 1500, pg_temp.fd(-2, 20)),
    (v_user, v_g1, pg_temp.cta('BAM Ahorro', v_user),       1000, pg_temp.fd(-1, 17)),
    (v_user, v_g1, pg_temp.cta('Banco Industrial', v_user),  400, pg_temp.fd(0, 15)),
    (v_user, v_g2, pg_temp.cta('Banco Industrial', v_user),  400, pg_temp.fd(-1, 3)),
    (v_user, v_g2, pg_temp.cta('Zigi', v_user),              250, pg_temp.fd(0, 12)),
    (v_user, v_g3, pg_temp.cta('Banco Industrial', v_user),  600, pg_temp.fd(-2, 25)),
    (v_user, v_g3, pg_temp.cta('Banco Industrial', v_user),  450, pg_temp.fd(0, 2)),
    (v_user, v_g4, pg_temp.cta('BAM Ahorro', v_user),       1500, pg_temp.fd(-1, 25));

  raise notice 'Listo: datos de prueba de Sofía cargados.';
end;
$$;

-- ---------------------------------------------------------------------
-- Resumen para comprobar (corre como parte del mismo Run).
-- ---------------------------------------------------------------------
select 'cuentas' as que, count(*)::text as cuantos from public.accounts a
  join public.profiles p on p.id = a.user_id where p.full_name ilike 'sof%'
union all
select 'movimientos', count(*)::text from public.movements m
  join public.profiles p on p.id = m.user_id where p.full_name ilike 'sof%'
union all
select 'eventos', count(*)::text from public.events e
  join public.profiles p on p.id = e.user_id where p.full_name ilike 'sof%'
union all
select 'metas', count(*)::text from public.savings_goals g
  join public.profiles p on p.id = g.user_id where p.full_name ilike 'sof%';
