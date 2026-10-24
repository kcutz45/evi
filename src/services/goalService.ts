/**
 * goalService.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Metas de ahorro: listar, crear, abonar/retirar y archivar.
 *
 * POR QUÉ EXISTE: Única capa que conoce savings_goals y
 *            savings_contributions. Lo ahorrado (saved_amount) y el
 *            estado "completada" los calcula un trigger con la suma de
 *            los abonos (§12 de schema.sql): el cliente nunca los escribe.
 *
 * DEPENDE DE: types/supabase.ts, types/goal.ts
 * USADO EN:   hooks/useGoals.ts
 * ---------------------------------------------------------------
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Abono, Meta, NuevaMeta } from '@/types/goal';
import type { Database } from '@/types/supabase';

type Cliente = SupabaseClient<Database>;

// Primero las activas, luego las completadas; dentro, las más nuevas arriba.
export async function listarMetas(client: Cliente): Promise<Meta[]> {
  const { data, error } = await client
    .from('savings_goals')
    .select('id, name, icon, target_amount, saved_amount, deadline, status')
    .neq('status', 'archivada')
    .order('status')
    .order('created_at', { ascending: false });
  if (error) throw new Error('No pudimos cargar tus metas.', { cause: error });
  return data.map((f) => ({
    id: f.id,
    nombre: f.name,
    icono: f.icon,
    objetivo: Number(f.target_amount),
    ahorrado: Number(f.saved_amount),
    fechaLimite: f.deadline,
    estado: f.status,
  }));
}

export async function crearMeta(client: Cliente, nueva: NuevaMeta): Promise<void> {
  const { error } = await client.from('savings_goals').insert({
    name: nueva.nombre.trim(),
    icon: nueva.icono,
    target_amount: nueva.objetivo,
    deadline: nueva.fechaLimite,
  });
  if (error) throw new Error('No pudimos crear la meta.', { cause: error });
}

// El CHECK saved_amount >= 0 rechaza retirar más de lo ahorrado.
export async function abonar(client: Cliente, abono: Abono): Promise<void> {
  const { error } = await client
    .from('savings_contributions')
    .insert({ goal_id: abono.metaId, account_id: abono.cuentaId, amount: abono.monto });
  if (error?.message.includes('saved_amount')) {
    throw new Error('No podés retirar más de lo que llevás ahorrado.', { cause: error });
  }
  if (error) throw new Error('No pudimos guardar el abono.', { cause: error });
}

// Archivar en vez de borrar: el dinero abonado ya salió de tus cuentas.
export async function archivarMeta(client: Cliente, id: string): Promise<void> {
  const { error } = await client.from('savings_goals').update({ status: 'archivada' }).eq('id', id);
  if (error) throw new Error('No pudimos quitar la meta.', { cause: error });
}
