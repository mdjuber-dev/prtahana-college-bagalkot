import { createGeneralEnquiry, listGeneralEnquiries, updateGeneralEnquiry, deleteGeneralEnquiry as deleteGeneralEnquiryApi } from './neon-api';

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
  try {
    const data = await listGeneralEnquiries(limit);
    return { data: (data as GeneralEnquiryRow[]) || [], error: null };
  } catch (error) {
    console.error('fetchGeneralEnquiries error:', error);
    return { data: [], error: error instanceof Error ? error.message : String(error) };
  }
}

export async function insertGeneralEnquiry(input: GeneralEnquiryInsert): Promise<{ success: boolean; data?: GeneralEnquiryRow[]; error?: string }> {
  try {
    const payload = buildGeneralEnquiryPayload(input);
    const data = await createGeneralEnquiry(payload);
    return { success: true, data: data as GeneralEnquiryRow[] };
  } catch (err) {
    console.error('insertGeneralEnquiry unexpected error:', err);
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function updateGeneralEnquiryStatus(id: string, status: string): Promise<{ success: boolean; error?: string }> {
  try {
    await updateGeneralEnquiry(id, { status });
    return { success: true };
  } catch (error) {
    console.error('updateGeneralEnquiryStatus error:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function deleteGeneralEnquiry(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await deleteGeneralEnquiryApi(id);
    return { success: true };
  } catch (error) {
    console.error('deleteGeneralEnquiry error:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}
