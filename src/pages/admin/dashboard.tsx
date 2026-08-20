import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchGeneralEnquiries } from '@/lib/enquiries';
import { fetchAdminCareerApplications, fetchAdminCareerJobs } from '@/lib/careers';
import { listAdmissions, listAnnouncements } from '@/lib/api';
import {
  GraduationCap, Inbox, Building2, Sparkles, ArrowRight, RefreshCw,
  Briefcase, FileText, Clock, ShieldAlert, Megaphone, GalleryHorizontal
} from 'lucide-react';
import StatCard from '@/components/admin/ui/StatCard';
import StatusBadge from '@/components/admin/ui/StatusBadge';

function formatDate(d?: string) {
  return d ? new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : '-';
}

function recentRowKey(row: any, kind: string, index: number) {
  return row.application_id || row.id || row.reference_code || `${kind}-${index}`;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function AdminDashboard() {
  const [admissions, setAdmissions] = useState<any[]>([]);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [careerJobs, setCareerJobs] = useState<any[]>([]);
  const [careerApplications, setCareerApplications] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      const [
        { data: admissionRows, error: admissionErr },
        enquiryResult,
        careerJobsResult,
        careerApplicationsResult,
        announcementsResult,
      ] = await Promise.all([
        listAdmissions(500).then((data) => ({ data, error: null })).catch((err) => ({ data: [], error: err })),
        fetchGeneralEnquiries(500),
        fetchAdminCareerJobs(),
        fetchAdminCareerApplications(),
        listAnnouncements(true).then((data) => ({ data })).catch(() => ({ data: [] })),
      ]);

      if (admissionErr) {
        setError(admissionErr instanceof Error ? admissionErr.message : String(admissionErr));
      }

      setAdmissions(admissionRows || []);
      setEnquiries(enquiryResult.data || []);
      setCareerJobs(careerJobsResult.data || []);
      setCareerApplications(careerApplicationsResult.data || []);
      setAnnouncements(announcementsResult.data || []);
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
        <div className="h-32 bg-slate-200 rounded-3xl" />
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
      {/* Hero Welcome Banner */}
      <div className="bg-white p-6 md:p-8 rounded-3xl text-secondary-900 shadow-xs relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-200/90">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 border border-primary-200/80 text-primary-800 text-xs font-black uppercase tracking-wider mb-3">
            <Sparkles size={14} className="text-primary-700" /> Official CMS Portal
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-secondary-950 tracking-tight">
            {getGreeting()}, Administrator 👋
          </h1>
          <p className="text-secondary-700 text-xs md:text-sm mt-2 leading-relaxed font-medium">
            Welcome back to <strong className="text-secondary-950 font-bold">Prarthana PU Science College Administration</strong>. Monitor admissions, student enquiries, announcements, careers, and website content from one centralized dashboard.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 shrink-0">
          <button
            onClick={loadData}
            className="px-4.5 py-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 text-secondary-900 font-extrabold text-xs transition-all border border-slate-300 flex items-center gap-2 shadow-xs"
          >
            <RefreshCw size={14} className="text-secondary-700" /> Refresh Realtime Data
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold flex items-center gap-3">
          <ShieldAlert size={18} className="shrink-0" />
          <div>
            <p className="font-bold">System Warning</p>
            <p className="text-xs font-normal">{error}</p>
          </div>
        </div>
      )}

      {/* Real-time Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Admissions"
          value={totalAdmissions}
          label="Total Received"
          icon={GraduationCap}
          colorScheme="primary"
        />

        <StatCard
          title="Pending Review"
          value={pendingAdmissions}
          label="Requires Action"
          icon={Clock}
          colorScheme="amber"
        />

        <StatCard
          title="Enquiries"
          value={newEnquiries}
          label="Leads & Inquiries"
          icon={Inbox}
          colorScheme="blue"
        />

        <StatCard
          title="Active Openings"
          value={activeCareerJobs}
          label="Career Vacancies"
          icon={Briefcase}
          colorScheme="emerald"
        />

        <StatCard
          title="Applications"
          value={totalCareerApplications}
          label="Job Applicants"
          icon={FileText}
          colorScheme="purple"
        />

        <StatCard
          title="Announcements"
          value={announcements.length}
          label="Active Notices"
          icon={Megaphone}
          colorScheme="indigo"
        />
      </div>

      {/* Quick Action Shortcuts */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <h3 className="text-xs font-extrabold text-secondary-500 mb-4 uppercase tracking-wider">
          Quick Management Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link
            to="/admin/admissions"
            className="flex flex-col items-start p-4 rounded-2xl bg-slate-50 hover:bg-primary-50 hover:border-primary-200 border border-slate-200/80 transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors mb-2">
              <GraduationCap size={18} />
            </div>
            <span className="text-xs font-bold text-secondary-900 group-hover:text-primary-700">Admissions</span>
            <span className="text-[10px] text-secondary-500 font-medium">Review forms</span>
          </Link>

          <Link
            to="/admin/enquiries"
            className="flex flex-col items-start p-4 rounded-2xl bg-slate-50 hover:bg-blue-50 hover:border-blue-200 border border-slate-200/80 transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors mb-2">
              <Inbox size={18} />
            </div>
            <span className="text-xs font-bold text-secondary-900 group-hover:text-blue-700">Enquiries</span>
            <span className="text-[10px] text-secondary-500 font-medium">Manage leads</span>
          </Link>

          <Link
            to="/admin/announcements"
            className="flex flex-col items-start p-4 rounded-2xl bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 border border-slate-200/80 transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors mb-2">
              <Megaphone size={18} />
            </div>
            <span className="text-xs font-bold text-secondary-900 group-hover:text-indigo-700">Announcements</span>
            <span className="text-[10px] text-secondary-500 font-medium">Publish updates</span>
          </Link>

          <Link
            to="/admin/careers"
            className="flex flex-col items-start p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-200/80 transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors mb-2">
              <Briefcase size={18} />
            </div>
            <span className="text-xs font-bold text-secondary-900 group-hover:text-emerald-700">Careers</span>
            <span className="text-[10px] text-secondary-500 font-medium">Job vacancies</span>
          </Link>

          <Link
            to="/admin/cms/site-config"
            className="flex flex-col items-start p-4 rounded-2xl bg-slate-50 hover:bg-purple-50 hover:border-purple-200 border border-slate-200/80 transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors mb-2">
              <Building2 size={18} />
            </div>
            <span className="text-xs font-bold text-secondary-900 group-hover:text-purple-700">Site CMS</span>
            <span className="text-[10px] text-secondary-500 font-medium">Edit content</span>
          </Link>

          <Link
            to="/admin/media-library"
            className="flex flex-col items-start p-4 rounded-2xl bg-slate-50 hover:bg-amber-50 hover:border-amber-200 border border-slate-200/80 transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors mb-2">
              <GalleryHorizontal size={18} />
            </div>
            <span className="text-xs font-bold text-secondary-900 group-hover:text-amber-700">Media Library</span>
            <span className="text-[10px] text-secondary-500 font-medium">Upload assets</span>
          </Link>
        </div>
      </div>

      {/* Main Data Preview Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Admissions */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
            <h3 className="font-extrabold text-secondary-900 text-sm flex items-center gap-2">
              <GraduationCap size={16} className="text-primary-600" /> Recent Admission Applications
            </h3>
            <Link to="/admin/admissions" className="text-xs font-bold text-primary-600 hover:underline flex items-center gap-1">
              View All <ArrowRight size={12} />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 flex-1">
            {admissions.length === 0 ? (
              <div className="p-8 text-center text-secondary-500 text-xs font-medium">No admissions received yet.</div>
            ) : (
              admissions.slice(0, 5).map((row, idx) => (
                <div key={recentRowKey(row, 'admission', idx)} className="p-4 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-secondary-900 truncate">{row.student_name}</p>
                    <p className="text-[11px] text-secondary-500 mt-0.5">
                      Course: <span className="font-semibold text-secondary-700">{row.course_interested || 'General'}</span> • {row.mobile_number || 'No Phone'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <StatusBadge status={row.status || 'Submitted'} size="sm" />
                    <p className="text-[10px] text-secondary-400 mt-1">{formatDate(row.created_at || row.submitted_at)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Enquiries */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
            <h3 className="font-extrabold text-secondary-900 text-sm flex items-center gap-2">
              <Inbox size={16} className="text-blue-600" /> Recent General Enquiries
            </h3>
            <Link to="/admin/enquiries" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
              View All <ArrowRight size={12} />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 flex-1">
            {enquiries.length === 0 ? (
              <div className="p-8 text-center text-secondary-500 text-xs font-medium">No enquiries recorded yet.</div>
            ) : (
              enquiries.slice(0, 5).map((row, idx) => (
                <div key={recentRowKey(row, 'enquiry', idx)} className="p-4 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-secondary-900 truncate">{row.name || 'Anonymous'}</p>
                    <p className="text-[11px] text-secondary-500 mt-0.5">
                      {row.email || row.mobile || 'No contact info'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <StatusBadge status={row.enquiry_type || 'General'} size="sm" />
                    <p className="text-[10px] text-secondary-400 mt-1">{formatDate(row.created_at || row.submitted_at)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
