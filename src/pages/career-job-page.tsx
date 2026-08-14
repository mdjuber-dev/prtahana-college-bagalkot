import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  FileText,
  GraduationCap,
  Loader2,
  MapPin,
  Upload,
  Users,
  X,
} from 'lucide-react';
import PageHero from '@/components/shared/page-hero';
import { fadeInUp } from '@/lib/motion';
import {
  fetchCareerJobBySlug,
  formatCareerDate,
  initialCareerApplicationForm,
  isJobOpen,
  submitCareerApplication,
  validateCareerApplicationForm,
  validateResume,
  type CareerApplicationForm,
  type CareerJob,
} from '@/lib/careers';

export default function CareerJobPage() {
  const { slug = '' } = useParams();
  const [job, setJob] = useState<CareerJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState<CareerApplicationForm>(initialCareerApplicationForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [successRef, setSuccessRef] = useState('');
  const formRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let mounted = true;
    fetchCareerJobBySlug(slug).then((result) => {
      if (!mounted) return;
      setJob(result.data);
      setError(result.error || (!result.data ? 'This career opportunity is not available.' : ''));
      setLoading(false);
    });
    return () => { mounted = false; };
  }, [slug]);

  const open = job ? isJobOpen(job) : false;

  const setField = (field: keyof CareerApplicationForm, value: string | File | null) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!job || submitting) return;

    const errors = validateCareerApplicationForm(form);
    setFormErrors(errors);
    if (Object.keys(errors).length) return;

    setSubmitting(true);
    setError('');
    const result = await submitCareerApplication(job, form);
    if (result.success && result.applicationRef) {
      setSuccessRef(result.applicationRef);
      setForm(initialCareerApplicationForm);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } else {
      setError(result.error || 'Unable to submit your application. Please try again.');
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <>
        <PageHero eyebrow="Careers" title="Loading Opportunity" subtitle="Please wait while we load this career opportunity." />
        <section className="py-16"><div className="max-w-5xl mx-auto px-4 h-72 rounded-2xl bg-white shadow-soft animate-pulse" /></section>
      </>
    );
  }

  if (!job) {
    return (
      <>
        <PageHero eyebrow="Careers" title="Opportunity Not Available" subtitle="This job may be closed or unavailable." />
        <section className="py-16 text-center">
          <Link to="/careers" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary-700 text-white font-bold">
            <ArrowLeft size={18} /> Back to Careers
          </Link>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHero
        eyebrow="Careers"
        title={job.title}
        subtitle={job.short_description || 'Join Prarthana PU Science College and help shape the next generation of learners.'}
      />

      <section className="py-16 md:py-24 bg-gradient-to-b from-white to-primary-50/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {error && (
            <div className="mb-8 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold">
              {error}
            </div>
          )}

          {successRef ? (
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-soft border border-primary-100 p-8 text-center">
              <CheckCircle2 size={56} className="text-emerald-600 mx-auto mb-4" />
              <h2 className="text-3xl font-black text-secondary-900 mb-2">Application Submitted</h2>
              <p className="text-secondary-600 mb-5">Thank you for applying to Prarthana PU Science College.</p>
              <div className="rounded-xl bg-primary-50 border border-primary-100 p-4 mb-5">
                <p className="text-xs font-bold text-primary-700 uppercase tracking-wider">Application ID</p>
                <p className="text-xl font-black text-secondary-900">{successRef}</p>
                <p className="text-sm text-secondary-500 mt-1">Position: {job.title}</p>
              </div>
              <p className="text-sm text-secondary-500 mb-6">Please keep your application ID for future reference.</p>
              <Link to="/careers" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary-700 text-white font-bold">
                Back to Careers <ArrowRight size={18} />
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-[1fr_420px] gap-8 items-start">
              <motion.article variants={fadeInUp} initial="hidden" animate="visible" className="bg-white rounded-2xl border border-primary-100 shadow-soft p-6 md:p-8">
                <Link to="/careers" className="inline-flex items-center gap-2 text-primary-700 font-bold text-sm mb-6">
                  <ArrowLeft size={16} /> Back to Openings
                </Link>

                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                  <div>
                    <p className="text-xs font-black text-primary-700 uppercase tracking-wider mb-1">{job.department || 'College Team'}</p>
                    <h2 className="text-3xl md:text-4xl font-black text-secondary-900">{job.title}</h2>
                  </div>
                  <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-bold ${open ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                    {open ? 'Applications Open' : 'Applications Closed'}
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8 text-sm">
                  <Info icon={Briefcase} label="Employment Type" value={job.employment_type || 'Full Time'} />
                  <Info icon={MapPin} label="Location" value={job.location || 'Bagalkot, Karnataka'} />
                  <Info icon={Users} label="Experience" value={job.experience_required || 'As per role'} />
                  <Info icon={GraduationCap} label="Qualification" value={job.qualification || 'Relevant qualification'} />
                  <Info icon={CalendarDays} label="Deadline" value={formatCareerDate(job.application_deadline)} />
                  <Info icon={FileText} label="Openings" value={String(job.vacancies || 1)} />
                </div>

                {job.salary_text && <Section title="Salary / Compensation" body={job.salary_text} />}
                <Section title="Job Description" body={job.description || job.short_description || ''} />
                <Section title="Responsibilities" body={job.responsibilities || ''} />
                <Section title="Required Qualifications" body={job.required_qualifications || job.qualification || ''} />
                <Section title="Preferred Qualifications" body={job.preferred_qualifications || ''} />
                <Section title="Benefits" body={job.benefits || ''} />
                <Section title="Additional Information" body={job.additional_information || ''} />
              </motion.article>

              <aside ref={formRef} className="bg-white rounded-2xl border border-primary-100 shadow-soft p-6 sticky top-24">
                <h2 className="text-2xl font-black text-secondary-900 mb-2">Apply Now</h2>
                <p className="text-sm text-secondary-500 mb-5">Submit your cover letter and resume for {job.title}.</p>

                {!open ? (
                  <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-red-700 text-sm font-semibold">
                    Applications for this position are currently closed.
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    <Field label="Full Name" required error={formErrors.fullName}>
                      <input value={form.fullName} onChange={(e) => setField('fullName', e.target.value)} className={inputClass} />
                    </Field>
                    <Field label="Email" required error={formErrors.email}>
                      <input type="email" value={form.email} onChange={(e) => setField('email', e.target.value)} className={inputClass} />
                    </Field>
                    <Field label="Mobile Number" required error={formErrors.mobile}>
                      <input type="tel" maxLength={10} value={form.mobile} onChange={(e) => setField('mobile', e.target.value)} className={inputClass} />
                    </Field>
                    <Field label="Position Applied For">
                      <input value={job.title} disabled className={`${inputClass} bg-secondary-50 text-secondary-500`} />
                    </Field>
                    <Field label="Qualification" required error={formErrors.qualification}>
                      <input value={form.qualification} onChange={(e) => setField('qualification', e.target.value)} className={inputClass} />
                    </Field>
                    <Field label="Subject / Department">
                      <input value={form.subjectDepartment} onChange={(e) => setField('subjectDepartment', e.target.value)} className={inputClass} placeholder={job.department || ''} />
                    </Field>
                    <Field label="Years of Experience" required error={formErrors.yearsExperience}>
                      <input value={form.yearsExperience} onChange={(e) => setField('yearsExperience', e.target.value)} className={inputClass} />
                    </Field>
                    <Field label="Current Organization">
                      <input value={form.currentOrganization} onChange={(e) => setField('currentOrganization', e.target.value)} className={inputClass} />
                    </Field>
                    <Field label="LinkedIn Profile">
                      <input value={form.linkedinUrl} onChange={(e) => setField('linkedinUrl', e.target.value)} className={inputClass} />
                    </Field>
                    <Field label="Portfolio / Website">
                      <input value={form.portfolioUrl} onChange={(e) => setField('portfolioUrl', e.target.value)} className={inputClass} />
                    </Field>
                    <Field label="Cover Letter" required error={formErrors.coverLetter}>
                      <textarea rows={5} value={form.coverLetter} onChange={(e) => setField('coverLetter', e.target.value)} className={inputClass} />
                    </Field>
                    <Field label="Additional Information">
                      <textarea rows={3} value={form.additionalInformation} onChange={(e) => setField('additionalInformation', e.target.value)} className={inputClass} />
                    </Field>
                    <Field label="Resume / CV" required error={formErrors.resume}>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          const fileError = validateResume(file);
                          setField('resume', file);
                          if (fileError) setFormErrors((prev) => ({ ...prev, resume: fileError }));
                        }}
                      />
                      {form.resume ? (
                        <div className="rounded-xl border border-primary-100 bg-primary-50 p-3 flex items-center justify-between gap-3">
                          <div>
                            <p className="font-bold text-secondary-900 text-sm">{form.resume.name}</p>
                            <p className="text-xs text-emerald-700 font-semibold">Ready to upload</p>
                          </div>
                          <button type="button" onClick={() => { setField('resume', null); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="p-2 rounded-lg hover:bg-white" aria-label="Remove resume">
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full rounded-xl border-2 border-dashed border-primary-200 p-5 text-center hover:bg-primary-50 transition-colors">
                          <Upload size={24} className="mx-auto text-primary-700 mb-2" />
                          <span className="text-sm font-bold text-secondary-800">Upload PDF, DOC, or DOCX</span>
                          <span className="block text-xs text-secondary-500 mt-1">Maximum file size: 10 MB</span>
                        </button>
                      )}
                    </Field>

                    <button type="submit" disabled={submitting} className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-primary text-white font-black disabled:opacity-60">
                      {submitting ? <><Loader2 size={18} className="animate-spin" /> Submitting...</> : <>Submit Application <ArrowRight size={18} /></>}
                    </button>
                  </form>
                )}
              </aside>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

const inputClass = 'w-full px-3 py-2.5 rounded-lg border border-secondary-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all text-sm';

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-bold text-secondary-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
      {error && <span className="block mt-1 text-xs text-red-600 font-semibold">{error}</span>}
    </label>
  );
}

function Info({ icon: Icon, label, value }: { icon: typeof Briefcase; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-secondary-50 p-3">
      <Icon size={17} className="text-primary-700 mb-2" />
      <p className="text-[11px] font-bold uppercase text-secondary-500">{label}</p>
      <p className="font-semibold text-secondary-900">{value}</p>
    </div>
  );
}

function Section({ title, body }: { title: string; body: string }) {
  if (!body.trim()) return null;
  return (
    <section className="mb-7">
      <h3 className="text-xl font-black text-secondary-900 mb-2">{title}</h3>
      <div className="text-secondary-600 leading-relaxed whitespace-pre-line">{body}</div>
    </section>
  );
}
