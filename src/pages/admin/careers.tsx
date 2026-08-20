import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Eye, Plus, RefreshCw, Trash2, X, Briefcase, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import AdminPageHeader from '@/components/admin/ui/AdminPageHeader';
import StatusBadge from '@/components/admin/ui/StatusBadge';
import {
  deleteCareerJobIfSafe,
  fetchAdminCareerApplications,
  fetchAdminCareerJobs,
  JOB_STATUSES,
  saveCareerJob,
  slugify,
  updateCareerJobStatus,
  type CareerJob,
  type JobStatus,
} from '@/lib/careers';

const emptyJob: Partial<CareerJob> = {
  title: '',
  slug: '',
  department: '',
  employment_type: 'Full Time',
  location: 'Bagalkot, Karnataka',
  qualification: '',
  experience_required: '',
  salary_text: '',
  vacancies: 1,
  short_description: '',
  description: '',
  responsibilities: '',
  required_qualifications: '',
  preferred_qualifications: '',
  benefits: '',
  additional_information: '',
  application_deadline: '',
  status: 'inactive',
  is_featured: false,
  display_order: 100,
};

export default function AdminCareersPage() {
  const [jobs, setJobs] = useState<CareerJob[]>([]);
  const [applicationCount, setApplicationCount] = useState(0);
  const [newApplicationCount, setNewApplicationCount] = useState(0);
  const [shortlistedCount, setShortlistedCount] = useState(0);
  const [editing, setEditing] = useState<Partial<CareerJob> | null>(null);
  const [preview, setPreview] = useState<CareerJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    setNotice('');
    const [jobsResult, appsResult] = await Promise.all([
      fetchAdminCareerJobs(),
      fetchAdminCareerApplications(),
    ]);
    setJobs(jobsResult.data);
    setApplicationCount(appsResult.data.length);
    setNewApplicationCount(appsResult.data.filter((app) => app.status === 'new').length);
    setShortlistedCount(appsResult.data.filter((app) => app.status === 'shortlisted').length);
    setError(jobsResult.error || appsResult.error || '');
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const stats = useMemo(() => ({
    total: jobs.length,
    active: jobs.filter((job) => job.status === 'active').length,
    closed: jobs.filter((job) => job.status === 'closed').length,
  }), [jobs]);

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    setError('');
    setNotice('');
    const payload = {
      ...editing,
      slug: editing.slug?.trim() || slugify(editing.title || ''),
    };
    const result = await saveCareerJob(payload);
    if (result.success) {
      setEditing(null);
      setNotice('Job saved successfully.');
      await load();
    } else {
      setError(result.error || 'Unable to save job.');
    }
    setSaving(false);
  };

  const changeStatus = async (job: CareerJob, status: JobStatus) => {
    const result = await updateCareerJobStatus(job.id, status);
    if (result.success) {
      setNotice(`Job marked ${status}.`);
      await load();
    } else {
      setError(result.error || 'Unable to update job status.');
    }
  };

  const deleteJob = async (job: CareerJob) => {
    if (!window.confirm(`Delete "${job.title}"? Jobs with applications cannot be deleted.`)) return;
    const result = await deleteCareerJobIfSafe(job.id);
    if (result.success) {
      setNotice('Job deleted successfully.');
      await load();
    } else {
      setError(result.error || 'Unable to delete job.');
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Career Opportunities"
        subtitle="Manage faculty & administrative job openings, update recruitment status, and review applicant counts."
        icon={Briefcase}
        badge="Recruitment & HR"
        actions={
          <div className="flex items-center gap-2">
            <Link
              to="/admin/careers/applications"
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all backdrop-blur-md border border-white/10 flex items-center gap-2"
            >
              <FileText size={14} />
              <span>Applications ({applicationCount})</span>
            </Link>
            <button
              onClick={load}
              disabled={loading}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all backdrop-blur-md border border-white/10 flex items-center gap-2"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setEditing(emptyJob)}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <Plus size={14} />
              <span>Add Job Opening</span>
            </button>
          </div>
        }
      />

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {notice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-secondary-400">Total Jobs</span>
          <p className="text-xl font-black text-secondary-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600">Active</span>
          <p className="text-xl font-black text-emerald-700 mt-1">{stats.active}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-secondary-400">Closed</span>
          <p className="text-xl font-black text-secondary-700 mt-1">{stats.closed}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary-600">Applications</span>
          <p className="text-xl font-black text-primary-700 mt-1">{applicationCount}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600">New Candidates</span>
          <p className="text-xl font-black text-amber-700 mt-1">{newApplicationCount}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600">Shortlisted</span>
          <p className="text-xl font-black text-purple-700 mt-1">{shortlistedCount}</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-secondary-500 text-[11px] font-extrabold uppercase tracking-wider border-b border-slate-200/80">
                <th className="py-4 px-6">Job Position</th>
                <th className="py-4 px-4">Department</th>
                <th className="py-4 px-4">Type</th>
                <th className="py-4 px-4">Application Deadline</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-secondary-400 font-semibold">
                    Loading job vacancies...
                  </td>
                </tr>
              ) : jobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-secondary-500 font-semibold">
                    No career job postings recorded yet.
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-secondary-900 text-sm">{job.title}</div>
                      <div className="text-[11px] text-secondary-400 font-mono">/{job.slug}</div>
                    </td>
                    <td className="py-4 px-4 font-semibold text-secondary-700">{job.department || '-'}</td>
                    <td className="py-4 px-4 font-medium text-secondary-600">{job.employment_type || '-'}</td>
                    <td className="py-4 px-4 font-medium text-secondary-500">{job.application_deadline || 'Open until filled'}</td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <StatusBadge status={job.status} size="sm" />
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setPreview(job)}
                          className="p-1.5 rounded-xl border border-slate-200 text-secondary-600 hover:bg-slate-50 transition-colors"
                          title="Preview Job"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => setEditing(job)}
                          className="p-1.5 rounded-xl border border-slate-200 text-secondary-600 hover:bg-slate-50 transition-colors"
                          title="Edit Job"
                        >
                          <Edit size={15} />
                        </button>
                        {JOB_STATUSES.map((st) => (
                          <button
                            key={st}
                            onClick={() => changeStatus(job, st)}
                            disabled={job.status === st}
                            className="px-2.5 py-1 rounded-xl border border-slate-200 text-[11px] font-bold capitalize text-secondary-700 hover:bg-slate-100 disabled:opacity-40 transition-colors"
                          >
                            {st}
                          </button>
                        ))}
                        <button
                          onClick={() => deleteJob(job)}
                          className="p-1.5 rounded-xl text-secondary-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Job"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-[120] bg-black/50 p-4 flex items-start justify-center overflow-y-auto">
          <div className="bg-white rounded-xl p-6 max-w-5xl w-full my-8">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold">{editing.id ? 'Edit Job' : 'Add Job'}</h3>
              <button onClick={() => setEditing(null)} className="p-2 border rounded-lg"><X size={18} /></button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Text label="Job Title *" value={editing.title || ''} onChange={(value) => setEditing({ ...editing, title: value, slug: editing.slug || slugify(value) })} />
              <Text label="Slug" value={editing.slug || ''} onChange={(value) => setEditing({ ...editing, slug: slugify(value) })} />
              <Text label="Department" value={editing.department || ''} onChange={(value) => setEditing({ ...editing, department: value })} />
              <Text label="Employment Type" value={editing.employment_type || ''} onChange={(value) => setEditing({ ...editing, employment_type: value })} />
              <Text label="Location" value={editing.location || ''} onChange={(value) => setEditing({ ...editing, location: value })} />
              <Text label="Qualification" value={editing.qualification || ''} onChange={(value) => setEditing({ ...editing, qualification: value })} />
              <Text label="Experience Required" value={editing.experience_required || ''} onChange={(value) => setEditing({ ...editing, experience_required: value })} />
              <Text label="Salary / Compensation" value={editing.salary_text || ''} onChange={(value) => setEditing({ ...editing, salary_text: value })} />
              <Text label="Number of Openings" type="number" value={String(editing.vacancies || 1)} onChange={(value) => setEditing({ ...editing, vacancies: Number(value || 1) })} />
              <Text label="Application Deadline" type="date" value={editing.application_deadline || ''} onChange={(value) => setEditing({ ...editing, application_deadline: value || null })} />
              <label className="block">
                <span className="text-sm font-bold text-secondary-700 mb-1 block">Status</span>
                <select value={editing.status || 'inactive'} onChange={(e) => setEditing({ ...editing, status: e.target.value as JobStatus })} className={inputClass}>
                  {JOB_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
                <p className="text-xs text-secondary-500 mt-1">Only active jobs are visible on the public Careers page.</p>
              </label>
              <Text label="Display Order" type="number" value={String(editing.display_order || 100)} onChange={(value) => setEditing({ ...editing, display_order: Number(value || 100) })} />
              <label className="flex items-center gap-2 text-sm font-bold text-secondary-700">
                <input type="checkbox" checked={!!editing.is_featured} onChange={(e) => setEditing({ ...editing, is_featured: e.target.checked })} />
                Featured Job
              </label>
              <Text label="Short Description" textarea value={editing.short_description || ''} onChange={(value) => setEditing({ ...editing, short_description: value })} />
              <Text label="Full Description" textarea value={editing.description || ''} onChange={(value) => setEditing({ ...editing, description: value })} />
              <Text label="Responsibilities" textarea value={editing.responsibilities || ''} onChange={(value) => setEditing({ ...editing, responsibilities: value })} />
              <Text label="Required Qualifications" textarea value={editing.required_qualifications || ''} onChange={(value) => setEditing({ ...editing, required_qualifications: value })} />
              <Text label="Preferred Qualifications" textarea value={editing.preferred_qualifications || ''} onChange={(value) => setEditing({ ...editing, preferred_qualifications: value })} />
              <Text label="Benefits" textarea value={editing.benefits || ''} onChange={(value) => setEditing({ ...editing, benefits: value })} />
              <Text label="Additional Information" textarea value={editing.additional_information || ''} onChange={(value) => setEditing({ ...editing, additional_information: value })} />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setEditing(null)} disabled={saving} className="px-4 py-2 border rounded-lg disabled:opacity-50">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-primary-700 text-white rounded-lg font-semibold disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Job'}
              </button>
            </div>
          </div>
        </div>
      )}

      {preview && (
        <div className="fixed inset-0 z-[125] bg-black/50 p-4 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full">
            <div className="flex justify-between gap-3 mb-4">
              <h3 className="text-2xl font-black">{preview.title}</h3>
              <button onClick={() => setPreview(null)} className="p-2 border rounded-lg"><X size={18} /></button>
            </div>
            <div className="rounded-xl bg-primary-50 border border-primary-100 p-4 mb-4">
              <p className="font-bold text-primary-800">{preview.department || 'College Team'} · {preview.employment_type || 'Full Time'}</p>
              <p className="text-sm text-secondary-600">{preview.location || 'Bagalkot, Karnataka'}</p>
            </div>
            <p className="text-secondary-700 whitespace-pre-line mb-4">{preview.short_description || preview.description || 'No description added yet.'}</p>
            {preview.status === 'active' ? (
              <Link to={`/careers/${preview.slug}`} target="_blank" className="inline-flex items-center gap-2 px-4 py-2 bg-primary-700 text-white rounded-lg font-semibold">
                Open Public Preview <Eye size={16} />
              </Link>
            ) : (
              <p className="text-sm text-secondary-500">Activate this job to preview it on the public careers page.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const inputClass = 'w-full px-3 py-2 rounded-lg border border-secondary-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none text-sm';


function Text({ label, value, onChange, textarea, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; textarea?: boolean; type?: string }) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-secondary-700 mb-1 block">{label}</span>
      {textarea ? (
        <textarea rows={4} value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} />
      )}
    </label>
  );
}
