export interface AdmissionFormData {
  // Step 1 — Personal Details
  studentName: string;
  fatherName: string;
  motherName: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  mobileNumber: string;
  alternateMobile: string;
  parentMobile: string;
  nationality: string;
  motherTongue: string;
  // Step 2 — Academic Info
  address: string;
  city: string;
  district: string;
  state: string;
  pinCode: string;
  previousSchool: string;
  previousSchoolAddress: string;
  sslcMarks: string;
  sslcBoard: string;
  passingYear: string;
  courseInterested: string;
  mediumOfInstruction: string;
  preferredBatch: string;
  // Step 3 — Additional Info
  religion: string;
  caste: string;
  bloodGroup: string;
  aadhaarNumber: string;
  transportRequired: string;
  hostelRequired: string;
  parentOccupation: string;
  parentEmail: string;
  emergencyContact: string;
  annualFamilyIncome: string;
  admissionSource: string;
  message: string;
  photoDataUrl: string;
}

export const initialAdmissionFormData: AdmissionFormData = {
  studentName: '', fatherName: '', motherName: '', dateOfBirth: '', gender: '', email: '',
  mobileNumber: '', alternateMobile: '', parentMobile: '', nationality: 'Indian', motherTongue: '',
  address: '', city: '', district: '', state: '', pinCode: '',
  previousSchool: '', previousSchoolAddress: '', sslcMarks: '', sslcBoard: '',
  passingYear: '', courseInterested: '', mediumOfInstruction: '', preferredBatch: '',
  religion: '', caste: '', bloodGroup: '', aadhaarNumber: '', transportRequired: '',
  hostelRequired: '', parentOccupation: '', parentEmail: '', emergencyContact: '',
  annualFamilyIncome: '', admissionSource: '', message: '', photoDataUrl: '',
};

export const admissionSources = [
  'Friends / Relatives',
  'Social Media (Facebook / Instagram / YouTube)',
  'Google Search',
  'Newspaper Advertisement',
  'School Teacher / Principal',
  'Alumni / Senior Students',
  'Education Fair / Seminar',
  'Hoardings / Banners',
  'Others',
] as const;

export const preferredBatches = ['Morning Batch', 'Regular Batch', 'Evening Batch'] as const;

export const sslcBoards = [
  'Karnataka Secondary Education Examination Board (KSEEB)',
  'CBSE',
  'ICSE',
  'Other State Board',
  'Others',
] as const;

const APPLICATION_ID_KEY = 'prarthana_app_id_counter';
const REFERENCE_CODE_KEY = 'prarthana_ref_codes';

export function generateApplicationId(): string {
  const stored = localStorage.getItem(APPLICATION_ID_KEY);
  let counter = stored ? parseInt(stored, 10) : 1000;
  counter += 1;
  localStorage.setItem(APPLICATION_ID_KEY, String(counter));
  return `PPSC${new Date().getFullYear()}${counter}`;
}

export function generateReferenceCode(length = 7): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const used = new Set<string>(
    JSON.parse(localStorage.getItem(REFERENCE_CODE_KEY) || '[]') as string[],
  );
  let code = '';
  let attempts = 0;
  do {
    code = '';
    for (let i = 0; i < length; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    attempts += 1;
  } while (used.has(code) && attempts < 50);
  used.add(code);
  localStorage.setItem(REFERENCE_CODE_KEY, JSON.stringify([...used]));
  return code;
}

export interface AdmissionPayload extends Record<string, string> {
  applicationId: string;
  referenceCode: string;
  submittedAt: string;
  status: string;
  verifiedBy: string;
  remarks: string;
  followUpDate: string;
  receptionNotes: string;
  counsellorName: string;
}

export function buildPayload(data: AdmissionFormData, applicationId: string, referenceCode: string): AdmissionPayload {
  const submittedAt = new Date().toISOString();
  return {
    applicationId,
    referenceCode,
    studentName: data.studentName,
    fatherName: data.fatherName,
    motherName: data.motherName,
    dateOfBirth: data.dateOfBirth,
    gender: data.gender,
    email: data.email,
    mobileNumber: data.mobileNumber,
    parentMobile: data.parentMobile,
    alternateMobile: data.alternateMobile,
    nationality: data.nationality,
    motherTongue: data.motherTongue,
    address: data.address,
    city: data.city,
    district: data.district,
    state: data.state,
    pinCode: data.pinCode,
    previousSchool: data.previousSchool,
    previousSchoolAddress: data.previousSchoolAddress,
    sslcMarks: data.sslcMarks,
    sslcBoard: data.sslcBoard,
    passingYear: data.passingYear,
    courseInterested: data.courseInterested,
    mediumOfInstruction: data.mediumOfInstruction,
    preferredBatch: data.preferredBatch,
    religion: data.religion,
    caste: data.caste,
    bloodGroup: data.bloodGroup,
    aadhaarNumber: data.aadhaarNumber.trim() || 'Not Provided',
    transportRequired: data.transportRequired || 'No',
    hostelRequired: data.hostelRequired || 'No',
    parentOccupation: data.parentOccupation,
    parentEmail: data.parentEmail.trim() || 'Not Provided',
    emergencyContact: data.emergencyContact,
    annualFamilyIncome: data.annualFamilyIncome.trim() || 'Not Provided',
    admissionSource: data.admissionSource,
    message: data.message.trim() || '-',
    photoUrl: data.photoDataUrl || 'Pending Upload',
    enquiryType: 'Admission Form',
    submittedAt,
    status: 'New',
    verifiedBy: '',
    remarks: '',
    followUpDate: '',
    receptionNotes: '',
    counsellorName: '',
  };
}

/**
 * Build the Google Sheet row with every admission field, including all
 * document URL placeholders. Data is sent silently to the Google Apps
 * Script web app via the edge function — no file is ever returned to
 * the browser.
 */
/**
 * Builds the payload that is sent to Google Sheets.
 * Admission form fields use the exact camelCase property names from
 * AdmissionFormData so Apps Script can map JSON keys to headers safely.
 */
export function buildSheetRow(
  data: AdmissionFormData,
  applicationId: string,
  referenceCode: string,
  submittedAt: string
): Record<string, string> {
  return {
    sheetType: 'admission',
    applicationId,
    referenceCode,
    admissionSession: '2026-27',
    studentName: data.studentName,
    fatherName: data.fatherName,
    motherName: data.motherName,
    dateOfBirth: data.dateOfBirth,
    gender: data.gender,
    email: data.email,
    mobileNumber: data.mobileNumber,
    alternateMobile: data.alternateMobile,
    parentMobile: data.parentMobile,
    nationality: data.nationality,
    motherTongue: data.motherTongue,
    address: data.address,
    city: data.city,
    district: data.district,
    state: data.state,
    pinCode: data.pinCode,
    previousSchool: data.previousSchool,
    previousSchoolAddress: data.previousSchoolAddress,
    sslcMarks: data.sslcMarks,
    sslcBoard: data.sslcBoard,
    passingYear: data.passingYear,
    courseInterested: data.courseInterested,
    mediumOfInstruction: data.mediumOfInstruction,
    preferredBatch: data.preferredBatch,
    religion: data.religion,
    caste: data.caste,
    bloodGroup: data.bloodGroup,
    aadhaarNumber: data.aadhaarNumber,
    transportRequired: data.transportRequired,
    hostelRequired: data.hostelRequired,
    parentOccupation: data.parentOccupation,
    parentEmail: data.parentEmail,
    emergencyContact: data.emergencyContact,
    annualFamilyIncome: data.annualFamilyIncome,
    admissionSource: data.admissionSource,
    message: data.message,
    photoDataUrl: data.photoDataUrl,
    submittedAt,
    status: 'Submitted',
  };
}

export interface EnquiryFormData {
  name: string;
  mobile: string;
  email: string;
  course: string;
  message: string;
  enquiryType?: string;
  source?: string;
}

export function buildEnquirySheetRow(
  data: EnquiryFormData,
  enquiryId: string,
  submittedAt: string
): Record<string, string> {
  return {
    'sheetType': 'enquiry',
    'Enquiry ID': enquiryId,
    'Name': data.name,
    'Mobile Number': data.mobile,
    'Email': data.email,
    'Course Interested': data.course,
    'Message': data.message,
    'Enquiry Type': data.enquiryType || 'Website Enquiry',
    'Submitted At': submittedAt,
    'Source': data.source || 'Website',
    'Status': 'New',
  };
}

export function generateEnquiryId(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(10000 + Math.random() * 90000);
  return `ENQ-${year}-${random}`;
}

/**
 * Build the QR code content string containing Application ID, Reference Code,
 * Student Name, Course, and Submission Date.
 */
export function buildQRContent(applicationId: string, referenceCode: string, formData: AdmissionFormData, _submittedAt: string): string {
  const lines = [
    `Application ID: ${applicationId}`,
    `Reference Code: ${referenceCode}`,
    `Student Name: ${formData.studentName || 'Not Provided'}`,
    `Course: ${formData.courseInterested || 'Not Provided'}`,
    `Admission Session: 2026-27`,
  ];
  return lines.join('\n');
}

const MOBILE_RE = /^[6-9]\d{9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const AADHAAR_RE = /^\d{12}$/;
const PIN_RE = /^[1-9]\d{5}$/;

export function validateAdmissionForm(data: AdmissionFormData, step: number): Record<string, string> {
  const errors: Record<string, string> = {};

  if (step === 1) {
    if (!data.studentName.trim()) errors.studentName = 'Please enter your Student Name.';
    if (!data.fatherName.trim()) errors.fatherName = "Please enter Father's Name.";
    if (!data.motherName.trim()) errors.motherName = "Please enter Mother's Name.";
    if (!data.dateOfBirth) errors.dateOfBirth = 'Please select your Date of Birth.';
    if (!data.gender) errors.gender = 'Please select your Gender.';
    if (!data.email.trim()) errors.email = 'Please enter your Email.';
    else if (!EMAIL_RE.test(data.email.trim())) errors.email = 'Please enter a valid email address';
    if (!data.mobileNumber.trim()) errors.mobileNumber = 'Please enter your Mobile Number.';
    else if (!MOBILE_RE.test(data.mobileNumber.trim())) errors.mobileNumber = 'Please enter a valid 10-digit mobile number';
    if (data.alternateMobile && !MOBILE_RE.test(data.alternateMobile.trim())) errors.alternateMobile = 'Please enter a valid 10-digit mobile number';
    if (!data.parentMobile.trim()) errors.parentMobile = 'Please enter Parent Mobile Number.';
    else if (!MOBILE_RE.test(data.parentMobile.trim())) errors.parentMobile = 'Please enter a valid 10-digit mobile number';
    if (!data.nationality.trim()) errors.nationality = 'Please enter your Nationality.';
    if (!data.motherTongue.trim()) errors.motherTongue = 'Please enter your Mother Tongue.';
  }

  if (step === 2) {
    if (!data.address.trim()) errors.address = 'Please enter your Address.';
    if (!data.city.trim()) errors.city = 'Please enter your City.';
    if (!data.district.trim()) errors.district = 'Please enter your District.';
    if (!data.state.trim()) errors.state = 'Please enter your State.';
    if (!data.pinCode.trim()) errors.pinCode = 'Please enter your PIN Code.';
    else if (!PIN_RE.test(data.pinCode.trim())) errors.pinCode = 'Please enter a valid 6-digit PIN code';
    if (!data.previousSchool.trim()) errors.previousSchool = 'Please enter your Previous School Name.';
    if (!data.previousSchoolAddress.trim()) errors.previousSchoolAddress = 'Please enter your Previous School Address.';
    if (!data.sslcMarks.trim()) errors.sslcMarks = 'Please enter your SSLC Marks / Percentage.';
    else {
      const marks = parseFloat(data.sslcMarks);
      if (isNaN(marks) || marks < 0 || marks > 100) errors.sslcMarks = 'Please enter valid marks (0-100)';
    }
    if (!data.sslcBoard) errors.sslcBoard = 'Please select your SSLC Board.';
    if (!data.passingYear) errors.passingYear = 'Please select your Passing Year.';
    if (!data.courseInterested) errors.courseInterested = 'Please select a Course.';
    if (!data.mediumOfInstruction) errors.mediumOfInstruction = 'Please select Medium of Instruction.';
    if (!data.preferredBatch) errors.preferredBatch = 'Please select a Preferred Batch.';
  }

  if (step === 3) {
    if (!data.religion.trim()) errors.religion = 'Please enter your Religion.';
    if (!data.caste.trim()) errors.caste = 'Please enter your Caste.';
    if (!data.bloodGroup) errors.bloodGroup = 'Please select your Blood Group.';
    if (data.aadhaarNumber.trim() && !AADHAAR_RE.test(data.aadhaarNumber.trim())) errors.aadhaarNumber = 'Please enter a valid 12-digit Aadhaar number';
    if (!data.transportRequired) errors.transportRequired = 'Please select a Transport option.';
    if (!data.hostelRequired) errors.hostelRequired = 'Please select a Hostel option.';
    if (!data.parentOccupation.trim()) errors.parentOccupation = "Please enter Parent's Occupation.";
    if (!data.parentEmail.trim()) errors.parentEmail = "Please enter Parent's Email.";
    else if (!EMAIL_RE.test(data.parentEmail.trim())) errors.parentEmail = 'Please enter a valid email address';
    if (!data.emergencyContact.trim()) errors.emergencyContact = 'Please enter an Emergency Contact Number.';
    else if (!MOBILE_RE.test(data.emergencyContact.trim())) errors.emergencyContact = 'Please enter a valid 10-digit mobile number';
    if (!data.admissionSource) errors.admissionSource = 'Please select how you heard about us.';
  }

  return errors;
}

export function getPassingYears(): number[] {
  const current = new Date().getFullYear();
  const years: number[] = [];
  for (let y = current; y >= current - 10; y--) years.push(y);
  return years;
}

export async function fileToCompressedDataUrl(file: File, maxSize = 256): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });

  if (file.size < 60_000) return dataUrl;

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Could not load image'));
    image.src = dataUrl;
  });

  let { width, height } = img;
  if (width > height && width > maxSize) {
    height = Math.round((height * maxSize) / width);
    width = maxSize;
  } else if (height > maxSize) {
    width = Math.round((width * maxSize) / height);
    height = maxSize;
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL('image/jpeg', 0.8);
}
