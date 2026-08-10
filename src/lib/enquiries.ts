import { supabase } from './supabase-config';

/** Canonical table for home popup + contact general enquiries (NOT admissions). */
export const GENERAL_ENQUIRIES_TABLE = 'general_enquiries';

export interface GeneralEnquiryRow {
  id: string;
  name: string;
  mobile: string;
  email?: string | null;
  course: string;
  message?: string | null;
  enquiry_type: string;
  source: string;
  status: string;
  submitted_at?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface GeneralEnquiryInsert {
  name: string;
  mobile: string;
  email?: string | null;
  course: string;
  message?: string | null;
  enquiry_type?: string;
  source?: string;
  status?: string;
}

export function buildGeneralEnquiryPayload(input: GeneralEnquiryInsert): Omit<GeneralEnquiryRow, 'id'> {
  const now = new Date().toISOString();
  return {
    name: input.name.trim(),
    mobile: input.mobile.trim(),
    email: input.email?.trim() || null,
    course: (input.course || '').trim() || 'General',
    message: input.message?.trim() || null,
    enquiry_type: input.enquiry_type || 'Website Enquiry',
    source: input.source || 'Website',
    status: input.status || 'New',
    submitted_at: now,
    created_at: now,
    updated_at: now,
  };
}

export async function fetchGeneralEnquiries(limit = 500): Promise<{ data: GeneralEnquiryRow[]; error: string | null }> {
  if (!supabase) return { data: [], error: 'Supabase is not configured.' };

  const { data, error } = await supabase
    .from(GENERAL_ENQUIRIES_TABLE)
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('fetchGeneralEnquiries error:', error.message);
    return { data: [], error: error.message };
  }

  return { data: (data as GeneralEnquiryRow[]) || [], error: null };
}

export async function insertGeneralEnquiry(input: GeneralEnquiryInsert): Promise<{ success: boolean; data?: GeneralEnquiryRow[]; error?: string }> {
  if (!supabase) return { success: false, error: 'Supabase is not configured.' };

  try {
    const payload = buildGeneralEnquiryPayload(input);
    const { data, error } = await supabase
      .from(GENERAL_ENQUIRIES_TABLE)
      .insert([payload])
      .select();

    if (error) {
      console.error('insertGeneralEnquiry error:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as GeneralEnquiryRow[] };
  } catch (err) {
    console.error('insertGeneralEnquiry unexpected error:', err);
    return { success: false, error: String(err) };
  }
}

export async function updateGeneralEnquiryStatus(id: string, status: string): Promise<{ success: boolean; error?: string }> {
  if (!supabase) return { success: false, error: 'Supabase is not configured.' };

  const { error } = await supabase
    .from(GENERAL_ENQUIRIES_TABLE)
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('updateGeneralEnquiryStatus error:', error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}
