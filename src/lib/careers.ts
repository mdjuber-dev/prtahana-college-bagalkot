import {
  createCareerApplication,
  createCareerJob,
  deleteCareerJob,
  getCareerJob,
  getCareerResumeUrl,
  listCareerApplications,
  listCareerJobs,
  updateCareerApplication,
  updateCareerJob,
  uploadCareerResume,
} from './neon-api';

export const CAREER_RESUME_BUCKET = 'career-applications';
export const MAX_RESUME_SIZE = 10 * 1024 * 1024;

export const JOB_STATUSES = ['active', 'inactive', 'closed'] as const;
export const CAREER_APPLICATION_STATUSES = ['new', 'reviewing', 'shortlisted', 'rejected', 'selected'] as const;

export type JobStatus = typeof JOB_STATUSES[number];
export type CareerApplicationStatus = typeof CAREER_APPLICATION_STATUSES[number];

export interface CareerJob {
  id: string;
  title: string;
  slug: string;
  department: string | null;
  employment_type: string | null;
  location: string | null;
  qualification: string | null;
  experience_required: string | null;
  salary_text: string | null;
  vacancies: number | null;
  short_description: string | null;
  description: string | null;
  responsibilities: string | null;
  required_qualifications: string | null;
  preferred_qualifications: string | null;
  benefits: string | null;
  additional_information: string | null;
  application_deadline: string | null;
  status: JobStatus;
  is_featured: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface CareerApplication {
  id: string;
  application_ref: string;
  job_id: string;
  full_name: string;
  email: string;
  mobile: string;
  qualification: string;
  subject_department: string | null;
  years_experience: string;
  current_organization: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  cover_letter: string;
  additional_information: string | null;
  resume_path: string;
  resume_file_name: string;
  resume_file_size: number;
  status: CareerApplicationStatus;
  created_at: string;
  updated_at: string;
  career_jobs?: Pick<CareerJob, 'title' | 'slug' | 'department'> | null;
}

export interface CareerApplicationForm {
  fullName: string;
  email: string;
  mobile: string;
  qualification: string;
  subjectDepartment: string;
  yearsExperience: string;
  currentOrganization: string;
  linkedinUrl: string;
  portfolioUrl: string;
  coverLetter: string;
  additionalInformation: string;
  resume: File | null;
}

export const initialCareerApplicationForm: CareerApplicationForm = {
  fullName: '',
  email: '',
  mobile: '',
  qualification: '',
  subjectDepartment: '',
  yearsExperience: '',
  currentOrganization: '',
  linkedinUrl: '',
  portfolioUrl: '',
  coverLetter: '',
  additionalInformation: '',
  resume: null,
};

const allowedResumeMimeTypes = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const allowedResumeExtensions = new Set(['pdf', 'doc', 'docx']);

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || `job-${Date.now()}`;
}

export function isJobOpen(job: Pick<CareerJob, 'status' | 'application_deadline'>): boolean {
  if (job.status !== 'active') return false;
  if (!job.application_deadline) return true;
  const deadline = new Date(`${job.application_deadline}T23:59:59`);
  return deadline >= new Date();
}

export function formatCareerDate(value?: string | null): string {
  if (!value) return 'Open until filled';
  return new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function generateCareerReference(): string {
  const year = new Date().getFullYear();
  const random =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 8).toUpperCase()
      : Math.random().toString(36).slice(2, 10).toUpperCase();
  return `PRT-CAREER-${year}-${random}`;
}

export function validateResume(file: File | null): string | null {
  if (!file) return 'Please upload your resume / CV.';
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  if (!allowedResumeExtensions.has(extension) || !allowedResumeMimeTypes.has(file.type)) {
    return 'Please upload a PDF, DOC, or DOCX resume.';
  }
  if (file.size > MAX_RESUME_SIZE) return 'Resume must be smaller than 10 MB.';
  return null;
}

export function validateCareerApplicationForm(form: CareerApplicationForm): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!form.fullName.trim()) errors.fullName = 'Full name is required.';
  if (!form.email.trim()) errors.email = 'Email is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = 'Enter a valid email address.';
  if (!form.mobile.trim()) errors.mobile = 'Mobile number is required.';
  else if (!/^[6-9]\d{9}$/.test(form.mobile.trim())) errors.mobile = 'Enter a valid 10-digit mobile number.';
  if (!form.qualification.trim()) errors.qualification = 'Qualification is required.';
  if (!form.yearsExperience.trim()) errors.yearsExperience = 'Years of experience is required.';
  if (form.coverLetter.trim().length < 30) errors.coverLetter = 'Cover letter must be at least 30 characters.';
  const resumeError = validateResume(form.resume);
  if (resumeError) errors.resume = resumeError;
  return errors;
}

export async function fetchActiveCareerJobs(): Promise<{ data: CareerJob[]; error: string | null }> {
  try {
    const data = await listCareerJobs(false);
    return { data: (data as CareerJob[]).filter(isJobOpen), error: null };
  } catch (error) {
    console.error('fetchActiveCareerJobs error:', error);
    return { data: [], error: 'Unable to load career opportunities.' };
  }
}

export async function fetchCareerJobBySlug(slug: string): Promise<{ data: CareerJob | null; error: string | null }> {
  try {
    const data = await getCareerJob(slug);
    return { data: data as CareerJob | null, error: null };
  } catch (error) {
    console.error('fetchCareerJobBySlug error:', error);
    return { data: null, error: 'Unable to load this career opportunity.' };
  }
}

export async function submitCareerApplication(job: CareerJob, form: CareerApplicationForm) {
  if (!isJobOpen(job)) return { success: false, error: 'Applications for this position are currently closed.' };

  const errors = validateCareerApplicationForm(form);
  if (Object.keys(errors).length) {
    return { success: false, error: Object.values(errors)[0] || 'Please check the application form.' };
  }

  const applicationRef = generateCareerReference();
  const extension = form.resume!.name.split('.').pop()?.toLowerCase() || 'pdf';
  const resumePath = `resumes/${applicationRef}/resume.${extension}`;

  try {
    const uploaded = await uploadCareerResume(form.resume!);

    const payload = {
      application_ref: applicationRef,
      job_id: job.id,
      full_name: form.fullName.trim(),
      email: form.email.trim(),
      mobile: form.mobile.trim(),
      qualification: form.qualification.trim(),
      subject_department: form.subjectDepartment.trim() || job.department || null,
      years_experience: form.yearsExperience.trim(),
      current_organization: form.currentOrganization.trim() || null,
      linkedin_url: form.linkedinUrl.trim() || null,
      portfolio_url: form.portfolioUrl.trim() || null,
      cover_letter: form.coverLetter.trim(),
      additional_information: form.additionalInformation.trim() || null,
      resume_path: uploaded.path || resumePath,
      resume_file_name: form.resume!.name,
      resume_file_size: form.resume!.size,
      status: 'new' as const,
    };

    const data = await createCareerApplication(payload);

    return { success: true, applicationRef: data.application_ref as string, resumePath: uploaded.path || resumePath };
  } catch (err) {
    console.error('submitCareerApplication unexpected error:', err);
    return { success: false, error: 'Unable to submit your application. Please try again.' };
  }
}

export async function fetchAdminCareerJobs(): Promise<{ data: CareerJob[]; error: string | null }> {
  try {
    const data = await listCareerJobs(true);
    return { data: data as CareerJob[], error: null };
  } catch (error) {
    console.error('fetchAdminCareerJobs error:', error);
    return { data: [], error: error instanceof Error ? error.message : String(error) };
  }
}

export async function saveCareerJob(input: Partial<CareerJob>) {
  const title = (input.title || '').trim();
  if (!title) return { success: false, error: 'Job title is required.' };

  const payload = {
    ...input,
    title,
    slug: (input.slug || slugify(title)).trim(),
    status: input.status || 'inactive',
    vacancies: Number(input.vacancies || 1),
    display_order: Number(input.display_order || 100),
    updated_at: new Date().toISOString(),
  };

  try {
    if (input.id) await updateCareerJob(input.id, payload);
    else await createCareerJob({ ...payload, created_at: new Date().toISOString() });
    return { success: true };
  } catch (error) {
    console.error('saveCareerJob error:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function updateCareerJobStatus(id: string, status: JobStatus) {
  try {
    await updateCareerJob(id, { status });
    return { success: true };
  } catch (error) {
    console.error('updateCareerJobStatus error:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function deleteCareerJobIfSafe(jobId: string) {
  try {
    await deleteCareerJob(jobId);
    return { success: true };
  } catch (error) {
    console.error('deleteCareerJobIfSafe error:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function fetchAdminCareerApplications() {
  try {
    const data = await listCareerApplications();
    return { data: data as CareerApplication[], error: null };
  } catch (error) {
    console.error('fetchAdminCareerApplications error:', error);
    return { data: [] as CareerApplication[], error: error instanceof Error ? error.message : String(error) };
  }
}

export async function updateCareerApplicationStatus(id: string, status: CareerApplicationStatus) {
  try {
    await updateCareerApplication(id, { status });
    return { success: true };
  } catch (error) {
    console.error('updateCareerApplicationStatus error:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function createResumeSignedUrl(path: string) {
  try {
    const url = await getCareerResumeUrl(path);
    return { url, error: null };
  } catch (error) {
    console.error('createResumeSignedUrl error:', error);
    return { url: null, error: error instanceof Error ? error.message : String(error) };
  }
}
