import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };

export function isSupabaseConfigured(): boolean {
  return supabase !== null;
}

export interface AdmissionSubmitResult {
  success: boolean;
  applicationId?: string;
  referenceCode?: string;
  submittedAt?: string;
  status?: string;
  error?: string;
}
