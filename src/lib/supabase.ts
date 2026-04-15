/// <reference types="vite/client" />
/**
 * PreventX Supabase Client
 * 
 * Client-side Supabase instance for the Vite/React SPA.
 * Used for authentication, report storage, and real-time sync.
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn(
    'Supabase is not configured. Set VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_URL/NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://example.invalid',
  supabaseAnonKey || 'missing-anon-key'
);

function getConfigError(
  message = 'Supabase is not configured. Set VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_URL/NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.'
) {
  return { error: { message } } as any;
}

// ─── Auth Helpers ───────────────────────────────────────────────────────────────

export async function signUp(email: string, password: string) {
  if (!isSupabaseConfigured) return getConfigError();
  return supabase.auth.signUp({ email, password });
}

export async function signIn(email: string, password: string) {
  if (!isSupabaseConfigured) return getConfigError();
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  if (!isSupabaseConfigured) return getConfigError();
  return supabase.auth.signOut();
}

export async function getCurrentUser() {
  if (!isSupabaseConfigured) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export function onAuthStateChange(callback: (event: string, session: any) => void) {
  if (!isSupabaseConfigured) {
    return {
      data: {
        subscription: {
          unsubscribe: () => {},
        },
      },
    } as any;
  }
  return supabase.auth.onAuthStateChange(callback);
}

// ─── Reports Database Helpers ───────────────────────────────────────────────────

export interface SupabaseReport {
  id?: string;
  user_id?: string;
  diabetes_risk: number;
  hypertension_risk: number;
  anemia_risk: number;
  overall_risk: number;
  diabetes_severity: string;
  hypertension_severity: string;
  anemia_severity: string;
  model_architecture: string;
  processing_time_ms: number;
  shap_features: any; // JSON blob
  created_at?: string;
  fingernail_url?: string;
  eyelid_url?: string;
}

export async function saveReportToCloud(report: SupabaseReport) {
  if (!isSupabaseConfigured) return getConfigError();
  const user = await getCurrentUser();
  if (!user) return { error: 'Not authenticated' };

  return supabase.from('health_reports').insert({
    ...report,
    user_id: user.id,
  });
}

export async function getCloudReports() {
  if (!isSupabaseConfigured) return { data: [], error: 'Supabase not configured' };
  const user = await getCurrentUser();
  if (!user) return { data: [], error: 'Not authenticated' };

  return supabase
    .from('health_reports')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);
}

export async function deleteCloudReport(id: string) {
  if (!isSupabaseConfigured) return getConfigError();
  return supabase.from('health_reports').delete().eq('id', id);
}

// ─── Storage Helpers ────────────────────────────────────────────────────────────

export async function uploadMedicalImage(file: File, userId: string, type: 'fingernail' | 'eyelid'): Promise<{ url?: string; error?: any }> {
  if (!isSupabaseConfigured) return getConfigError('Supabase storage is not configured.');
  try {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${userId}/${type}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError, data } = await supabase.storage
      .from('medical-images')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('medical-images')
      .getPublicUrl(filePath);

    return { url: publicUrl };
  } catch (error) {
    console.error(`Error uploading ${type} image:`, error);
    return { error };
  }
}
