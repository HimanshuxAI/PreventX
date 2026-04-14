/// <reference types="vite/client" />
/**
 * PreventX Supabase Client
 * 
 * Client-side Supabase instance for the Vite/React SPA.
 * Used for authentication, report storage, and real-time sync.
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://geujksuhqqrrtedsxiiv.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_fNJSR54IYpvLlk9Ch0JdXA_cH2t6Ew6';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── Auth Helpers ───────────────────────────────────────────────────────────────

export async function signUp(email: string, password: string) {
  return supabase.auth.signUp({ email, password });
}

export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export function onAuthStateChange(callback: (event: string, session: any) => void) {
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
  const user = await getCurrentUser();
  if (!user) return { error: 'Not authenticated' };

  return supabase.from('health_reports').insert({
    ...report,
    user_id: user.id,
  });
}

export async function getCloudReports() {
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
  return supabase.from('health_reports').delete().eq('id', id);
}

// ─── Storage Helpers ────────────────────────────────────────────────────────────

export async function uploadMedicalImage(file: File, userId: string, type: 'fingernail' | 'eyelid'): Promise<{ url?: string; error?: any }> {
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
