-- =====================================================================
-- 20261024_categorias_ampliadas.sql — EVI
-- ---------------------------------------------------------------------
-- PROPÓSITO: Amplía las categorías del sistema para el registro paso a
--            paso: 11 de gasto y 7 de ingreso (antes 7 y 1).
--
-- POR QUÉ EXISTE: Con una sola categoría de ingreso ("Ingresos"), los
--            usuarios dejaban sus ingresos sin categoría (ej. "Quincena").
--            Las nuevas reflejan cómo gana y gasta el usuario tipo (§0):
--            remesas, mesada, freelance, salidas, suscripciones...
--
-- SEGURO DE CORRER:
--   * No borra nada. "Ingresos" se RENOMBRA a "Otros ingresos": los
--     movimientos que ya la usan la conservan (mismo id).
--   * Idempotente: se puede ejecutar más de una vez sin duplicar.
--
-- CÓMO SE USA: SQL Editor de Supabase → pegar → Run.
-- schema.sql (sección 9) ya incluye esta lista para bases nuevas.
-- =====================================================================

update public.categories
   set name = 'Otros ingresos'
 where user_id is null and kind = 'ingreso' and name = 'Ingresos';

insert into public.categories (user_id, name, icon, kind)
select null, v.name, v.icon, v.kind
from (values
  ('Salidas',       'party-popper', 'egreso'),
  ('Suscripciones', 'tv',           'egreso'),
  ('Ropa',          'shirt',        'egreso'),
  ('Regalos',       'gift',         'egreso'),
  ('Salario',       'briefcase',    'ingreso'),
  ('Freelance',     'laptop',       'ingreso'),
  ('Ventas',        'tag',          'ingreso'),
  ('Remesas',       'globe',        'ingreso'),
  ('Mesada',        'wallet',       'ingreso'),
  ('Regalo',        'gift',         'ingreso'),
  ('Otros ingresos','banknote',     'ingreso')
) as v(name, icon, kind)
where not exists (
  select 1 from public.categories c
  where c.user_id is null and c.name = v.name and c.kind = v.kind
);

-- Verificación: debe dar 11 egreso y 7 ingreso.
select kind, count(*) as categorias_del_sistema
from public.categories
where user_id is null
group by kind
order by kind;
