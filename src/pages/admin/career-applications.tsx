import { useEffect, useMemo, useState } from 'react';
import { Download, Eye, RefreshCw, Search, X } from 'lucide-react';
import {
  CAREER_APPLICATION_STATUSES,
  createResumeSignedUrl,
  fetchAdminCareerApplications,
  fetchAdminCareerJobs,
  updateCareerApplicationStatus,
  type CareerApplication,
  type CareerApplicationStatus,
  type CareerJob,
} from '@/lib/careers';

export default function AdminCareerApplicationsPage() {
  const [applications, setApplications] = useState<CareerApplication[]>([]);
  const [jobs, setJobs] = useState<CareerJob[]>([]);
  const [selected, setSelected] = useState<CareerApplication | null>(null);
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [jobFilter, setJobFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    const [appsResult, jobsResult] = await Promise.all([
      fetchAdminCareerApplications(),
      fetchAdminCareerJobs(),
    ]);
    setApplications(appsResult.data);
    setJobs(jobsResult.data);
    setError(appsResult.error || jobsResult.error || '');
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => {
    const search = q.trim().toLowerCase();
    return applications.filter((app) => {
      if (statusFilter !== 'all' && app.status !== statusFilter) return false;
      if (jobFilter !== 'all' && app.job_id !== jobFilter) return false;
      if (!search) return true;
      const position = app.career_jobs?.title || '';
      return [app.application_ref, app.full_name, app.email, app.mobile, position]
        .some((value) => String(value || '').toLowerCase().includes(search));
    });
  }, [applications, jobFilter, q, statusFilter]);

  const changeStatus = async (app: CareerApplication, status: CareerApplicationStatus) => {
    setSaving(true);
    setError('');
    setNotice('');
    const result = await updateCareerApplicationStatus(app.id, status);
    if (result.success) {
      setApplications((prev) => prev.map((row) => row.id === app.id ? { ...row, status } : row));
      setSelected((prev) => prev?.id === app.id ? { ...prev, status } : prev);
      setNotice('Application status saved successfully.');
    } else {
      setError(result.error || 'Unable to update application status.');
    }
    setSaving(false);
  };

  const openResume = async (app: CareerApplication, download = false) => {
    const result = await createResumeSignedUrl(app.resume_path);
    if (!result.url) {
      setError(result.error || 'Unable to create secure resume link.');
      return;
    }
    const url = download ? `${result.url}${result.url.includes('?') ? '&' : '?'}download=${encodeURIComponent(app.resume_file_name)}` : result.url;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const exportCsv = () => {
    const headers = ['application_ref', 'full_name', 'email', 'mobile', 'position', 'qualification', 'years_experience', 'status', 'created_at'];
    const rows = filtered.map((app) => ({
      application_ref: app.application_ref,
      full_name: app.full_name,
      email: app.email,
      mobile: app.mobile,
      position: app.career_jobs?.title || app.job_id,
      qualification: app.qualification,
      years_experience: app.years_experience,
      status: app.status,
      created_at: app.created_at,
    }));
    const csv = [headers.join(','), ...rows.map((row) => headers.map((h) => JSON.stringify(String((row as Record<string, string>)[h] || ''))).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'career_applications.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-primary-700">Career Applications</p>
          <h2 className="text-2xl font-bold">Applications</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={load} disabled={loading} className="inline-flex items-center gap-2 px-3 py-2 border rounded-lg bg-white disabled:opacity-50">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button onClick={exportCsv} disabled={!filtered.length} className="px-3 py-2 border rounded-lg bg-white disabled:opacity-50">Export</button>
        </div>
      </div>

      {error && <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm font-semibold">{error}</div>}
      {notice && <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold">{notice}</div>}

      <div className="grid lg:grid-cols-[1fr_auto_auto] gap-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, mobile, application ID or position" className="w-full pl-9 pr-3 py-2 border rounded-lg" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border rounded-lg bg-white">
          <option value="all">All Statuses</option>
          {CAREER_APPLICATION_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
        </select>
        <select value={jobFilter} onChange={(e) => setJobFilter(e.target.value)} className="px-3 py-2 border rounded-lg bg-white">
          <option value="all">All Jobs</option>
          {jobs.map((job) => <option key={job.id} value={job.id}>{job.title}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary-50">
            <tr className="border-b">
              <th className="p-3">Application ID</th>
              <th className="p-3">Applicant</th>
              <th className="p-3">Position</th>
              <th className="p-3">Email</th>
              <th className="p-3">Mobile</th>
              <th className="p-3">Experience</th>
              <th className="p-3">Status</th>
              <th className="p-3">Submitted</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} className="p-8 text-center text-secondary-500">Loading applications...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={9} className="p-8 text-center text-secondary-500">No career applications found.</td></tr>
            ) : (
              filtered.map((app) => (
                <tr key={app.id} className="border-b hover:bg-primary-50">
                  <td className="p-3 font-bold">{app.application_ref}</td>
                  <td className="p-3">{app.full_name}</td>
                  <td className="p-3">{app.career_jobs?.title || '-'}</td>
                  <td className="p-3">{app.email}</td>
                  <td className="p-3">{app.mobile}</td>
                  <td className="p-3">{app.years_experience}</td>
                  <td className="p-3"><StatusPill status={app.status} /></td>
                  <td className="p-3 whitespace-nowrap">{new Date(app.created_at).toLocaleString('en-IN')}</td>
                  <td className="p-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setSelected(app)} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border"><Eye size={14} /> View</button>
                      <button onClick={() => openResume(app)} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border"><Download size={14} /> Resume</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 z-[120] bg-black/50 p-4 flex items-start justify-center overflow-y-auto">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full my-8">
            <div className="flex items-start justify-between gap-3 mb-5">
              <div>
                <p className="text-xs font-bold text-primary-700 uppercase tracking-wide">{selected.application_ref}</p>
                <h3 className="text-2xl font-black text-secondary-900">{selected.full_name}</h3>
                <p className="text-secondary-500">{selected.career_jobs?.title || 'Career Application'}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 border rounded-lg"><X size={18} /></button>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 mb-5 p-4 rounded-xl bg-secondary-50 border">
              <select value={selected.status} onChange={(e) => changeStatus(selected, e.target.value as CareerApplicationStatus)} disabled={saving} className="p-2 border rounded-lg bg-white">
                {CAREER_APPLICATION_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
              <button onClick={() => openResume(selected)} className="px-3 py-2 bg-primary-700 text-white rounded-lg font-semibold">View Resume</button>
              <button onClick={() => openResume(selected, true)} className="px-3 py-2 border rounded-lg font-semibold">Download Resume</button>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-5">
              <Detail label="Email" value={selected.email} />
              <Detail label="Mobile" value={selected.mobile} />
              <Detail label="Qualification" value={selected.qualification} />
              <Detail label="Subject / Department" value={selected.subject_department || selected.career_jobs?.department || '-'} />
              <Detail label="Experience" value={selected.years_experience} />
              <Detail label="Current Organization" value={selected.current_organization || '-'} />
              <Detail label="LinkedIn" value={selected.linkedin_url || '-'} link />
              <Detail label="Portfolio" value={selected.portfolio_url || '-'} link />
              <Detail label="Resume Filename" value={selected.resume_file_name} />
              <Detail label="Submitted" value={new Date(selected.created_at).toLocaleString('en-IN')} />
            </div>

            <section className="rounded-xl border p-4 mb-4">
              <h4 className="font-bold text-secondary-900 mb-2">Cover Letter</h4>
              <p className="text-sm text-secondary-700 whitespace-pre-line">{selected.cover_letter}</p>
            </section>
            {selected.additional_information && (
              <section className="rounded-xl border p-4">
                <h4 className="font-bold text-secondary-900 mb-2">Additional Information</h4>
                <p className="text-sm text-secondary-700 whitespace-pre-line">{selected.additional_information}</p>
              </section>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const cls = status === 'selected' || status === 'shortlisted'
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : status === 'rejected'
      ? 'bg-red-50 text-red-700 border-red-200'
      : status === 'reviewing'
        ? 'bg-blue-50 text-blue-700 border-blue-200'
        : 'bg-amber-50 text-amber-700 border-amber-200';
  return <span className={`inline-flex px-2.5 py-1 rounded-full border text-xs font-bold ${cls}`}>{status}</span>;
}

function Detail({ label, value, link }: { label: string; value: string; link?: boolean }) {
  const isLink = link && value !== '-';
  return (
    <div className="rounded-xl bg-secondary-50 border p-3">
      <p className="text-xs font-bold uppercase text-secondary-500">{label}</p>
      {isLink ? (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary-700 underline break-all">{value}</a>
      ) : (
        <p className="text-sm font-semibold text-secondary-900 break-words">{value}</p>
      )}
    </div>
  );
}
