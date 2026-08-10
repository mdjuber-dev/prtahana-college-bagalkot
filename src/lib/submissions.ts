import { supabase } from './supabase-config';
import type { EnquiryFormData } from './admission-config';
import { insertGeneralEnquiry } from './enquiries';

export async function submitAdmissionToSupabase(admission: Record<string, unknown>) {
  if (!supabase) return { success: false, error: 'Supabase not configured' };
  try {
    const { data, error } = await supabase.from('admissions').insert([admission]).select();
    if (error) {
      console.error('submitAdmissionToSupabase error:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  } catch (err) {
    console.error('submitAdmissionToSupabase unexpected error:', err);
    return { success: false, error: String(err) };
  }
}

export async function submitGeneralEnquiryToSupabase(enquiry: EnquiryFormData & { enquiryType?: string; source?: string }) {
  return insertGeneralEnquiry({
    name: enquiry.name,
    mobile: enquiry.mobile,
    email: enquiry.email || null,
    course: enquiry.course || 'General',
    message: enquiry.message || null,
    enquiry_type: enquiry.enquiryType || 'Website Enquiry',
    source: enquiry.source || 'Website',
    status: 'New',
  });
}
