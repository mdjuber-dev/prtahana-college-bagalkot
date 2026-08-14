import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchGeneralEnquiries } from '@/lib/enquiries';
import { fetchAdminCareerApplications, fetchAdminCareerJobs } from '@/lib/careers';
import { getSiteCmsRow, listAdmissions } from '@/lib/api';
import {
  GraduationCap, Inbox, Building2, TrendingUp, Sparkles, ArrowRight, RefreshCw,
  Briefcase, FileText, PlusCircle, Clock, ShieldAlert,
} from 'lucide-react';

function formatDate(d?: string) {
  return d ? new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : '-';
}

function recentRowKey(row: any, kind: string, index: number) {
  return row.application_id || row.id || row.reference_code || `${kind}-${index}`;
}

export default function AdminDashboard() {
  const [admissions, setAdmissions] = useState<any[]>([]);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [careerJobs, setCareerJobs] = useState<any[]>([]);
  const [careerApplications, setCareerApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastCmsUpdate, setLastCmsUpdate] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      const [
        { data: admissionRows, error: admissionErr },
        enquiryResult,
        { data: cmsData },
        careerJobsResult,
        careerApplicationsResult,
      ] = await Promise.all([
        listAdmissions(500).then((data) => ({ data, error: null })).catch((err) => ({ data: [], error: err })),
        fetchGeneralEnquiries(500),
        getSiteCmsRow('site_config').then((data) => ({ data })).catch(() => ({ data: null })),
        fetchAdminCareerJobs(),
        fetchAdminCareerApplications(),
      ]);

      if (admissionErr) {
        setError(admissionErr instanceof Error ? admissionErr.message : String(admissionErr));
      }

      setAdmissions(admissionRows || []);
      setEnquiries(enquiryResult.data || []);
      setCareerJobs(careerJobsResult.data || []);
      setCareerApplications(careerApplicationsResult.data || []);
      if (cmsData?.updated_at) setLastCmsUpdate(cmsData.updated_at);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch dashboard records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const totalAdmissions = admissions.length;
  const pendingAdmissions = admissions.filter((r) => ['Submitted', 'Pending', 'New', 'Under Review'].includes(r.status || '')).length;
  const newEnquiries = enquiries.length;
  const activeCareerJobs = careerJobs.filter((job) => job.status === 'active').length;
  const totalCareerApplications = careerApplications.length;

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded-lg w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-28 bg-slate-200 rounded-2xl" />
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="h-80 bg-slate-200 rounded-2xl" />
          <div className="h-80 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary-600 uppercase tracking-widest">
            <Sparkles size={14} /> School Management System Overview
          </div>
          <h2 className="text-2xl font-black text-secondary-900 tracking-tight mt-1">Institutional Dashboard</h2>
          <p className="text-xs text-secondary-500 mt-1">Real-time metrics and database records across all departments.</p>
        </div>
        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-secondary-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors shadow-sm self-start sm:self-auto"
        >
          <RefreshCw size={14} /> Refresh Data
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold flex items-center gap-3">
          <ShieldAlert size={18} className="shrink-0" />
          <div>
            <p className="font-bold">System Error</p>
            <p className="text-xs font-normal">{error}</p>
          </div>
        </div>
      )}

      {/* Real-time Counter Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Admissions */}
        <div className="bg-white p-5 rounded-2xl border border-secondary-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-secondary-500 uppercase tracking-wider">Admissions</span>
            <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
              <GraduationCap size={18} />
            </div>
          </div>
          <p className="text-2xl font-black text-secondary-900 mt-3">{totalAdmissions}</p>
          <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <TrendingUp size={12} /> Total Received
          </p>
        </div>

        {/* Pending Admissions */}
        <div className="bg-white p-5 rounded-2xl border border-secondary-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-secondary-500 uppercase tracking-wider">Pending</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock size={18} />
            </div>
          </div>
          <p className="text-2xl font-black text-secondary-900 mt-3">{pendingAdmissions}</p>
          <p className="text-[11px] text-amber-600 font-medium mt-1">Review Required</p>
        </div>

        {/* New Enquiries */}
        <div className="bg-white p-5 rounded-2xl border border-secondary-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-secondary-500 uppercase tracking-wider">Enquiries</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Inbox size={18} />
            </div>
          </div>
          <p className="text-2xl font-black text-secondary-900 mt-3">{newEnquiries}</p>
          <p className="text-[11px] text-blue-600 font-medium mt-1">General Inquiries</p>
        </div>

        {/* Active Career Jobs */}
        <div className="bg-white p-5 rounded-2xl border border-secondary-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-secondary-500 uppercase tracking-wider">Active Jobs</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Briefcase size={18} />
            </div>
          </div>
          <p className="text-2xl font-black text-secondary-900 mt-3">{activeCareerJobs}</p>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">Career Openings</p>
        </div>

        {/* Career Applications */}
        <div className="bg-white p-5 rounded-2xl border border-secondary-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-secondary-500 uppercase tracking-wider">Applications</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <FileText size={18} />
            </div>
          </div>
          <p className="text-2xl font-black text-secondary-900 mt-3">{totalCareerApplications}</p>
          <p className="text-[11px] text-purple-600 font-medium mt-1">Job Applications</p>
        </div>

        {/* Published Content */}
        <div className="bg-white p-5 rounded-2xl border border-secondary-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-secondary-500 uppercase tracking-wider">Website CMS</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Building2 size={18} />
            </div>
          </div>
          <p className="text-2xl font-black text-secondary-900 mt-3">Live</p>
          <p className="text-[11px] text-secondary-500 font-medium mt-1">
            {lastCmsUpdate ? `Updated ${formatDate(lastCmsUpdate)}` : 'Synced with CMS'}
          </p>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="bg-white p-6 rounded-2xl border border-secondary-200/80 shadow-sm">
        <h3 className="text-sm font-bold text-secondary-800 mb-4 uppercase tracking-wider">Quick Management Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            to="/admin/admissions"
            className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 hover:bg-primary-50 hover:border-primary-200 border border-slate-200/80 transition-all text-xs font-semibold text-secondary-800 hover:text-primary-700 group"
          >
            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors">
              <GraduationCap size={16} />
            </div>
            <span>View Admissions</span>
          </Link>
          <Link
            to="/admin/enquiries"
            className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 hover:bg-blue-50 hover:border-blue-200 border border-slate-200/80 transition-all text-xs font-semibold text-secondary-800 hover:text-blue-700 group"
          >
            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Inbox size={16} />
            </div>
            <span>View Enquiries</span>
          </Link>
          <Link
            to="/admin/careers"
            className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-200/80 transition-all text-xs font-semibold text-secondary-800 hover:text-emerald-700 group"
          >
            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <PlusCircle size={16} />
            </div>
            <span>Manage Careers</span>
          </Link>
          <Link
            to="/admin/cms/site-config"
            className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 hover:bg-purple-50 hover:border-purple-200 border border-slate-200/80 transition-all text-xs font-semibold text-secondary-800 hover:text-purple-700 group"
          >
            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Building2 size={16} />
            </div>
            <span>Edit Site CMS</span>
          </Link>
        </div>
      </div>

      {/* Main Data Lists Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Admissions */}
        <div className="bg-white rounded-2xl border border-secondary-200/80 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-secondary-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-bold text-secondary-900 text-sm flex items-center gap-2">
              <GraduationCap size={16} className="text-primary-600" /> Recent Admission Submissions
            </h3>
            <Link to="/admin/admissions" className="text-xs font-semibold text-primary-600 hover:underline flex items-center gap-1">
              View All <ArrowRight size={12} />
            </Link>
          </div>

          <div className="divide-y divide-secondary-100 flex-1">
            {admissions.length === 0 ? (
              <div className="p-8 text-center text-secondary-500 text-sm">No admissions received yet.</div>
            ) : (
              admissions.slice(0, 5).map((row, idx) => (
                <div key={recentRowKey(row, 'admission', idx)} className="p-4 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-secondary-900 truncate">{row.student_name}</p>
                    <p className="text-xs text-secondary-500 mt-0.5">
                      Course: <span className="font-medium text-secondary-700">{row.course_interested || 'General'}</span> • {row.mobile_number || 'No Phone'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary-50 text-primary-700 border border-primary-200">
                      {row.status || 'Submitted'}
                    </span>
                    <p className="text-[10px] text-secondary-400 mt-1">{formatDate(row.created_at || row.submitted_at)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Enquiries */}
        <div className="bg-white rounded-2xl border border-secondary-200/80 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-secondary-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-bold text-secondary-900 text-sm flex items-center gap-2">
              <Inbox size={16} className="text-blue-600" /> Recent General Enquiries
            </h3>
            <Link to="/admin/enquiries" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
              View All <ArrowRight size={12} />
            </Link>
          </div>

          <div className="divide-y divide-secondary-100 flex-1">
            {enquiries.length === 0 ? (
              <div className="p-8 text-center text-secondary-500 text-sm">No enquiries recorded yet.</div>
            ) : (
              enquiries.slice(0, 5).map((row, idx) => (
                <div key={recentRowKey(row, 'enquiry', idx)} className="p-4 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-secondary-900 truncate">{row.name || 'Anonymous'}</p>
                    <p className="text-xs text-secondary-500 mt-0.5">
                      {row.email || row.mobile || 'No contact info'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-secondary-700">
                      {row.enquiry_type || 'General'}
                    </span>
                    <p className="text-[10px] text-secondary-400 mt-1">{formatDate(row.created_at || row.submitted_at)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Active Jobs & Career Applications Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Active Career Openings */}
        <div className="bg-white rounded-2xl border border-secondary-200/80 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-secondary-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-bold text-secondary-900 text-sm flex items-center gap-2">
              <Briefcase size={16} className="text-emerald-600" /> Active Job Openings
            </h3>
            <Link to="/admin/careers" className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1">
              Manage Careers <ArrowRight size={12} />
            </Link>
          </div>

          <div className="divide-y divide-secondary-100">
            {careerJobs.filter((j) => j.status === 'active').length === 0 ? (
              <div className="p-8 text-center text-secondary-500 text-sm">No active job openings currently posted.</div>
            ) : (
              careerJobs.filter((j) => j.status === 'active').slice(0, 4).map((job) => (
                <div key={job.id} className="p-4 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-secondary-900 truncate">{job.title}</p>
                    <p className="text-xs text-secondary-500 mt-0.5">{job.department} • {job.employment_type || 'Full-time'}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Active
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Career Applications */}
        <div className="bg-white rounded-2xl border border-secondary-200/80 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-secondary-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-bold text-secondary-900 text-sm flex items-center gap-2">
              <FileText size={16} className="text-purple-600" /> Recent Job Applications
            </h3>
            <Link to="/admin/careers/applications" className="text-xs font-semibold text-purple-600 hover:underline flex items-center gap-1">
              View Applications <ArrowRight size={12} />
            </Link>
          </div>

          <div className="divide-y divide-secondary-100">
            {careerApplications.length === 0 ? (
              <div className="p-8 text-center text-secondary-500 text-sm">No career applications submitted yet.</div>
            ) : (
              careerApplications.slice(0, 4).map((app) => (
                <div key={app.id || app.application_ref} className="p-4 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-secondary-900 truncate">{app.full_name}</p>
                    <p className="text-xs text-secondary-500 mt-0.5">{app.qualification} • {app.mobile}</p>
                  </div>
                  <p className="text-[10px] text-secondary-400 shrink-0">{formatDate(app.created_at)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
