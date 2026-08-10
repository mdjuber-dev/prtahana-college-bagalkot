import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase-config';
import { fetchGeneralEnquiries } from '@/lib/enquiries';
import { GraduationCap, Inbox, Building2, Bus, Calendar, TrendingUp, Sparkles, ArrowRight, RefreshCw } from 'lucide-react';

function formatDate(d?: string) {
  return d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '-';
}

function monthKey(value?: string) {
  if (!value) return 'Unknown';
  return new Date(value).toLocaleString('en-IN', { month: 'short', year: '2-digit' });
}

function countBy<T extends Record<string, any>>(rows: T[], key: keyof T, fallback = 'Unknown') {
  return rows.reduce<Record<string, number>>((acc, row) => {
    const label = String(row[key] || fallback);
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});
}

function recentRowKey(row: any, kind: 'admission' | 'enquiry', index: number) {
  if (kind === 'admission') {
    return row.application_id || row.reference_code || `admission-${index}`;
  }
  return row.id || `enquiry-${index}`;
}

export default function AdminDashboard() {
  const [admissions, setAdmissions] = useState<any[]>([]);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enquiryError, setEnquiryError] = useState('');
  const [lastCmsUpdate, setLastCmsUpdate] = useState<string | null>(null);

  const loadData = async () => {
    if (!supabase) {
      setError('Supabase is not configured.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    setEnquiryError('');

    try {
      const [
        { data: admissionRows, error: admissionError },
        enquiryResult,
        { data: cmsData },
      ] = await Promise.all([
        supabase.from('admissions').select('*').order('created_at', { ascending: false }).limit(500),
        fetchGeneralEnquiries(500),
        supabase.from('site_cms').select('updated_at').eq('key', 'site_config').maybeSingle(),
      ]);

      if (admissionError) {
        setError(admissionError.message);
      }

      if (enquiryResult.error) {
        setEnquiryError(enquiryResult.error);
        setEnquiries([]);
      } else {
        setEnquiries(enquiryResult.data);
      }

      setAdmissions(admissionRows || []);
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

  const todayStart = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const todayAdmissions = admissions.filter((r) => new Date(r.created_at || r.submitted_at) >= todayStart).length;
  const todayEnquiries = enquiries.filter((r) => new Date(r.created_at || r.submitted_at) >= todayStart).length;
  const pendingApplications = admissions.filter((r) => ['Submitted', 'Pending', 'New', 'Under Review'].includes(r.status || '')).length;

  const hostelCount = admissions.filter((r) => {
    const v = String(r.hostel_required || '').toLowerCase();
    return v === 'yes' || v === 'true' || v === 'required';
  }).length;

  const transportCount = admissions.filter((r) => {
    const v = String(r.transport_required || '').toLowerCase();
    return v === 'yes' || v === 'true' || v === 'required';
  }).length;

  const courseStats = countBy(admissions, 'course_interested');
  const admissionTrend = countBy(admissions.map((r) => ({ month: monthKey(r.created_at || r.submitted_at) })), 'month');
  const enquiryTrend = countBy(enquiries.map((r) => ({ month: monthKey(r.created_at || r.submitted_at) })), 'month');

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded-lg w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-28 bg-gray-200 rounded-2xl" />
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="h-64 bg-gray-200 rounded-2xl" />
          <div className="h-64 bg-gray-200 rounded-2xl" />
          <div className="h-64 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-primary-700 uppercase tracking-widest">Real-Time College Portal Metrics</p>
          <h2 className="text-2xl font-black text-secondary-900">Admin Dashboard</h2>
        </div>
        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-secondary-700 bg-white border border-secondary-200 hover:bg-secondary-50 transition-colors shadow-sm self-start sm:self-auto"
        >
          <RefreshCw size={14} /> Refresh Real-Time Data
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold">
          Admissions: {error}
        </div>
      )}

      {enquiryError && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-sm font-semibold">
          Enquiries: {enquiryError}
          {enquiryError.includes('schema cache') && (
            <span className="block mt-1 font-normal">Apply migration <code className="bg-amber-100 px-1 rounded">20260810170000_ensure_general_enquiries_pipeline.sql</code> in Supabase SQL Editor.</span>
          )}
        </div>
      )}

      {/* Primary KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-secondary-200/80 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-secondary-500 uppercase tracking-wider">Total Admissions</span>
            <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center">
              <GraduationCap size={20} />
            </div>
          </div>
          <div className="text-3xl font-black text-secondary-900">{admissions.length}</div>
          <p className="text-xs text-secondary-500 mt-1">
            <span className="font-bold text-primary-700">+{todayAdmissions}</span> submitted today · <span className="font-semibold text-amber-600">{pendingApplications} pending</span>
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-secondary-200/80 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-secondary-500 uppercase tracking-wider">Total Enquiries</span>
            <div className="w-10 h-10 rounded-xl bg-accent-50 text-accent-700 flex items-center justify-center">
              <Inbox size={20} />
            </div>
          </div>
          <div className="text-3xl font-black text-secondary-900">{enquiries.length}</div>
          <p className="text-xs text-secondary-500 mt-1">
            <span className="font-bold text-accent-700">+{todayEnquiries}</span> received today
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-secondary-200/80 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-secondary-500 uppercase tracking-wider">Hostel Required</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Building2 size={20} />
            </div>
          </div>
          <div className="text-3xl font-black text-secondary-900">{hostelCount}</div>
          <p className="text-xs text-secondary-500 mt-1">Students requesting hostel accommodation</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-secondary-200/80 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-secondary-500 uppercase tracking-wider">Transport Required</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Bus size={20} />
            </div>
          </div>
          <div className="text-3xl font-black text-secondary-900">{transportCount}</div>
          <p className="text-xs text-secondary-500 mt-1">Students requesting college bus transport</p>
        </div>
      </div>

      {/* Analytics Charts & Visualizations */}
      <div className="grid lg:grid-cols-3 gap-4">
        <ChartCard title="Course-wise Admissions (PCMB vs PCMC)" data={courseStats} icon={GraduationCap} />
        <ChartCard title="Monthly Admissions Trend" data={admissionTrend} icon={TrendingUp} />
        <ChartCard title="Monthly Enquiries Trend" data={enquiryTrend} icon={Sparkles} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-secondary-200/80 p-5 shadow-soft">
          <h3 className="font-extrabold text-secondary-900 mb-3 flex items-center gap-2">
            <Sparkles size={16} className="text-accent-600" />
            Quick Actions
          </h3>
          <div className="grid gap-2 text-sm">
            <Link className="px-3.5 py-2.5 rounded-xl border border-secondary-200 hover:bg-primary-50 font-semibold text-secondary-800 flex items-center justify-between transition-colors" to="/admin/admissions">
              <span>Review All Admissions</span>
              <ArrowRight size={16} className="text-secondary-400" />
            </Link>
            <Link className="px-3.5 py-2.5 rounded-xl border border-secondary-200 hover:bg-primary-50 font-semibold text-secondary-800 flex items-center justify-between transition-colors" to="/admin/enquiries">
              <span>Review Website Enquiries</span>
              <ArrowRight size={16} className="text-secondary-400" />
            </Link>
            <Link className="px-3.5 py-2.5 rounded-xl border border-secondary-200 hover:bg-primary-50 font-semibold text-secondary-800 flex items-center justify-between transition-colors" to="/admin/cms/site-config">
              <span>Manage Website CMS Content</span>
              <ArrowRight size={16} className="text-secondary-400" />
            </Link>
            <Link className="px-3.5 py-2.5 rounded-xl border border-secondary-200 hover:bg-primary-50 font-semibold text-secondary-800 flex items-center justify-between transition-colors" to="/admin/analytics">
              <span>Power BI & Analytics Setup</span>
              <ArrowRight size={16} className="text-secondary-400" />
            </Link>
          </div>
        </div>

        <div className="lg:col-span-2 bg-gradient-to-br from-primary-900 to-primary-950 text-white rounded-2xl p-6 shadow-soft relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-accent-300 text-xs font-bold mb-3 border border-white/15">
              <Calendar size={12} /> Website Content System
            </div>
            <h3 className="text-xl font-bold mb-2">Supabase CMS Status</h3>
            <p className="text-primary-200 text-sm leading-relaxed max-w-xl">
              Public website content is synced dynamically from Supabase database tables (`site_cms`). Any updates saved in Website CMS reflect instantly on the public website without needing code redeployment.
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-primary-800/80 flex items-center justify-between text-xs text-primary-300">
            <span>Last CMS Content Update: {lastCmsUpdate ? formatDate(lastCmsUpdate) : 'Initial defaults active'}</span>
            <Link to="/admin/cms/site-config" className="text-accent-400 font-bold hover:underline">Edit Content →</Link>
          </div>
        </div>
      </div>

      {/* Recent Activity Tables */}
      <div className="grid lg:grid-cols-2 gap-4">
        <RecentCard title="Recent Admissions" rows={admissions.slice(0, 7)} kind="admission" />
        <RecentCard title="Recent Enquiries" rows={enquiries.slice(0, 7)} kind="enquiry" />
      </div>
    </div>
  );
}

function ChartCard({ title, data, icon: Icon }: { title: string; data: Record<string, number>; icon: any }) {
  const max = Math.max(1, ...Object.values(data));
  const entries = Object.entries(data);
  return (
    <div className="bg-white rounded-2xl border border-secondary-200/80 p-5 shadow-soft">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-700 flex items-center justify-center">
          <Icon size={16} />
        </div>
        <h3 className="font-extrabold text-secondary-900 text-sm">{title}</h3>
      </div>
      {entries.length === 0 ? (
        <div className="py-8 text-center text-xs text-secondary-400 font-medium">No records submitted yet</div>
      ) : (
        <div className="space-y-3">
          {entries.map(([label, value]) => (
            <div key={label}>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-secondary-700">{label}</span>
                <span className="text-secondary-900 font-bold">{value}</span>
              </div>
              <div className="h-2 rounded-full bg-secondary-100 overflow-hidden">
                <div
                  className="h-full bg-gradient-primary rounded-full transition-all duration-500"
                  style={{ width: `${(value / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RecentCard({ title, rows, kind }: { title: string; rows: any[]; kind: 'admission' | 'enquiry' }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-secondary-200/80 shadow-soft">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-extrabold text-secondary-900">{title}</h3>
        <Link
          to={kind === 'admission' ? '/admin/admissions' : '/admin/enquiries'}
          className="text-xs font-bold text-primary-700 hover:text-primary-900"
        >
          View All →
        </Link>
      </div>
      <div className="divide-y divide-secondary-100">
        {rows.length === 0 ? (
          <div className="py-8 text-center text-xs text-secondary-400 font-medium">No recent entries</div>
        ) : (
          rows.map((r, index) => (
            <div key={recentRowKey(r, kind, index)} className="py-3 flex items-center justify-between gap-3 text-xs">
              <div className="min-w-0 flex-1">
                <p className="font-bold text-secondary-900 truncate">
                  {kind === 'admission' ? r.student_name || 'Application' : r.name || 'Enquiry'}
                </p>
                <p className="text-secondary-500 truncate mt-0.5">
                  {kind === 'admission'
                    ? `${r.course_interested || 'Science'} · ${r.mobile_number || '-'}`
                    : `${r.course || 'General'} · ${r.mobile || '-'}`}
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="inline-block px-2 py-0.5 rounded-md bg-secondary-100 text-secondary-700 font-bold text-[10px]">
                  {r.status || (kind === 'admission' ? 'Submitted' : 'New')}
                </span>
                <p className="text-[10px] text-secondary-400 mt-0.5">
                  {formatDate(r.created_at || r.submitted_at)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
