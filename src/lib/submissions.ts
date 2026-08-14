import type { EnquiryFormData } from './admission-config';
import { insertGeneralEnquiry } from './enquiries';
import { createAdmission } from './neon-api';

export async function submitAdmissionToNeon(admission: Record<string, unknown>) {
  try {
    const data = await createAdmission(admission);
    return { success: true, data };
  } catch (err) {
    console.error('submitAdmissionToNeon unexpected error:', err);
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function submitGeneralEnquiryToNeon(enquiry: EnquiryFormData & { enquiryType?: string; source?: string }) {
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
