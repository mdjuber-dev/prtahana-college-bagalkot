import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Eye, Plus, RefreshCw, Trash2, X } from 'lucide-react';
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
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-primary-700">Careers CMS</p>
          <h2 className="text-2xl font-bold">Careers</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/careers/applications" className="px-3 py-2 rounded-lg border bg-white font-semibold text-sm">View Applications</Link>
          <button onClick={load} disabled={loading} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border bg-white disabled:opacity-50">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button onClick={() => setEditing(emptyJob)} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary-700 text-white font-semibold">
            <Plus size={16} /> Add Job
          </button>
        </div>
      </div>

      {error && <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm font-semibold">{error}</div>}
      {notice && <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold">{notice}</div>}

      <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-3">
        <Stat label="Total Jobs" value={stats.total} />
        <Stat label="Active Jobs" value={stats.active} />
        <Stat label="Closed Jobs" value={stats.closed} />
        <Stat label="Applications" value={applicationCount} />
        <Stat label="New" value={newApplicationCount} />
        <Stat label="Shortlisted" value={shortlistedCount} />
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary-50">
            <tr className="border-b">
              <th className="p-3">Job</th>
              <th className="p-3">Department</th>
              <th className="p-3">Type</th>
              <th className="p-3">Deadline</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center text-secondary-500">Loading jobs...</td></tr>
            ) : jobs.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-secondary-500">No career jobs found.</td></tr>
            ) : (
              jobs.map((job) => (
                <tr key={job.id} className="border-b hover:bg-primary-50">
                  <td className="p-3">
                    <div className="font-bold text-secondary-900">{job.title}</div>
                    <div className="text-xs text-secondary-500">/{job.slug}</div>
                  </td>
                  <td className="p-3">{job.department || '-'}</td>
                  <td className="p-3">{job.employment_type || '-'}</td>
                  <td className="p-3">{job.application_deadline || 'Open until filled'}</td>
                  <td className="p-3"><StatusPill status={job.status} /></td>
                  <td className="p-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setPreview(job)} className="p-2 rounded-lg border hover:bg-white" title="Preview"><Eye size={15} /></button>
                      <button onClick={() => setEditing(job)} className="p-2 rounded-lg border hover:bg-white" title="Edit"><Edit size={15} /></button>
                      {JOB_STATUSES.map((status) => (
                        <button key={status} onClick={() => changeStatus(job, status)} disabled={job.status === status} className="px-2 py-1 rounded-lg border text-xs font-semibold disabled:opacity-40">
                          {status}
                        </button>
                      ))}
                      <button onClick={() => deleteJob(job)} className="p-2 rounded-lg border border-red-200 text-red-700 hover:bg-red-50" title="Delete"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-xl border p-4 shadow-sm">
      <p className="text-xs font-bold text-secondary-500 uppercase">{label}</p>
      <p className="text-3xl font-black text-secondary-900">{value}</p>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const cls = status === 'active'
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : status === 'closed'
      ? 'bg-red-50 text-red-700 border-red-200'
      : 'bg-secondary-50 text-secondary-700 border-secondary-200';
  return <span className={`inline-flex px-2.5 py-1 rounded-full border text-xs font-bold ${cls}`}>{status}</span>;
}

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
