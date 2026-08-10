export type AdmissionStatus = 'New' | 'Under Review' | 'Counselling' | 'Document Verification' | 'Approved' | 'Rejected';

export type FeePaymentStatus = 'Pending' | 'Partial' | 'Paid';

export interface AdmissionRecord {
  application_id: string;
  reference_code: string;
  student_name: string;
  father_name: string;
  mother_name: string;
  date_of_birth: string;
  gender: string;
  email: string;
  mobile_number: string;
  alternate_mobile: string;
  parent_mobile: string;
  nationality: string;
  mother_tongue: string;
  address: string;
  city: string;
  district: string;
  state: string;
  pin_code: string;
  previous_school: string;
  previous_school_address: string;
  sslc_marks: string;
  sslc_board: string;
  passing_year: string;
  course_interested: string;
  medium_of_instruction: string;
  preferred_batch: string;
  religion: string;
  caste: string;
  blood_group: string;
  aadhaar_number: string;
  transport_required: string;
  hostel_required: string;
  parent_occupation: string;
  parent_email: string;
  emergency_contact: string;
  annual_family_income: string;
  admission_source: string;
  message: string;
  photo_url: string | null;
  enquiry_type: string;
  submitted_at: string;
  created_at: string;
  status: string;
  verified_by: string | null;
  remarks: string | null;
  follow_up_date: string | null;
  reception_notes: string | null;
  counsellor_name: string | null;
  counsellor_assigned_date: string | null;
  pdf_path: string | null;
  bank_name: string | null;
  bank_account_number: string | null;
  bank_ifsc: string | null;
  bank_branch: string | null;
  fee_payment_status: string;
  fee_amount_paid: number;
  fee_due_date: string | null;
  doc_marks_card_verified: boolean;
  doc_tc_verified: boolean;
  doc_aadhaar_verified: boolean;
  doc_photos_verified: boolean;
  doc_income_certificate_verified: boolean;
  doc_caste_certificate_verified: boolean;
}

export interface ActivityLogEntry {
  id: string;
  application_id: string;
  action: string;
  description: string | null;
  performed_by: string | null;
  created_at: string;
}

export const ADMISSION_STATUSES: AdmissionStatus[] = [
  'New',
  'Under Review',
  'Counselling',
  'Document Verification',
  'Approved',
  'Rejected',
];

export const FEE_STATUSES: FeePaymentStatus[] = ['Pending', 'Partial', 'Paid'];

export const COURSES = ['PCMB', 'PCMC'] as const;

export const statusColors: Record<string, string> = {
  'New': 'bg-green-100 text-green-700 border-green-200',
  'Under Review': 'bg-blue-100 text-blue-700 border-blue-200',
  'Counselling': 'bg-amber-100 text-amber-700 border-amber-200',
  'Document Verification': 'bg-orange-100 text-orange-700 border-orange-200',
  'Approved': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Rejected': 'bg-red-100 text-red-700 border-red-200',
};

export const feeStatusColors: Record<string, string> = {
  'Pending': 'bg-red-100 text-red-700 border-red-200',
  'Partial': 'bg-amber-100 text-amber-700 border-amber-200',
  'Paid': 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

export interface DocChecklistItem {
  key: keyof Pick<AdmissionRecord,
    | 'doc_marks_card_verified' | 'doc_tc_verified' | 'doc_aadhaar_verified'
    | 'doc_photos_verified' | 'doc_income_certificate_verified' | 'doc_caste_certificate_verified'
  >;
  label: string;
}

export const DOC_CHECKLIST: DocChecklistItem[] = [
  { key: 'doc_marks_card_verified', label: 'SSLC Marks Card' },
  { key: 'doc_tc_verified', label: 'Transfer Certificate' },
  { key: 'doc_aadhaar_verified', label: 'Aadhaar Card' },
  { key: 'doc_photos_verified', label: 'Passport-size Photos' },
  { key: 'doc_income_certificate_verified', label: 'Income Certificate' },
  { key: 'doc_caste_certificate_verified', label: 'Caste Certificate' },
];
