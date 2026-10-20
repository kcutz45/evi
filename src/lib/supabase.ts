/**
 * supabase.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Cliente de Supabase para el NAVEGADOR (componentes
 *            'use client', hooks y los servicios que ellos usan).
 *
 * POR QUÉ EXISTE: Un solo lugar crea el cliente. Solo lo importan los
 *            archivos de /services; un componente que lo importe está
 *            rompiendo la Responsabilidad Única (§2.1).
 *
 *            @supabase/ssr guarda la sesión en cookies (no en
 *            localStorage), así el servidor (lib/supabaseServer.ts) ve
 *            la misma sesión que el navegador.
 *
 * SEGURIDAD: La clave anon es pública por diseño. Lo que protege los
 *            datos son las políticas RLS y los privilegios de
 *            supabase/schema.sql, no esconder esta clave.
 *
 * DEPENDE DE: lib/supabaseEnv.ts, types/supabase.ts
 * USADO EN:   services/*
 * ---------------------------------------------------------------
 */
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';
import { supabaseAnonKey, supabaseUrl } from './supabaseEnv';

// En el navegador createBrowserClient devuelve siempre la misma
// instancia, así que exportar una constante no crea clientes de más.
export const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);

export type BrowserSupabaseClient = typeof supabase;
