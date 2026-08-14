import { useEffect, useState } from 'react';
import { fetchGeneralEnquiries, updateGeneralEnquiryStatus, type GeneralEnquiryRow } from '@/lib/enquiries';
import { Inbox, RefreshCw, Download, Search, User, Phone, BookOpen, MessageSquare, Calendar } from 'lucide-react';

const statuses = ['New', 'Contacted', 'Follow Up', 'Converted', 'Closed'];

export default function AdminEnquiries() {
  const [rows, setRows] = useState<GeneralEnquiryRow[]>([]);
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<GeneralEnquiryRow | null>(null);
  const [status, setStatus] = useState('New');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    const { data, error: fetchErr } = await fetchGeneralEnquiries();
    if (fetchErr) {
      setError(fetchErr);
      setRows([]);
    } else {
      setRows(data);
    }
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const filtered = rows.filter((r) => {
    if (!q) return true;
    const s = q.toLowerCase();
    return [r.name, r.mobile, r.email, r.course, r.enquiry_type, r.status, r.source]
      .some((value) => String(value || '').toLowerCase().includes(s));
  });

  const openRow = (row: GeneralEnquiryRow) => {
    setSelected(row);
    setStatus(row.status || 'New');
  };

  const updateStatus = async () => {
    if (!selected) return;
    setSaving(true);
    const result = await updateGeneralEnquiryStatus(selected.id, status);
    if (!result.success) {
      alert(result.error || 'Failed to update status');
    } else {
      setSelected({ ...selected, status });
      await load();
    }
    setSaving(false);
  };

  const exportCsv = () => {
    const headers = ['name', 'mobile', 'email', 'course', 'enquiry_type', 'source', 'status', 'message', 'created_at'];
    const csv = [headers.join(','), ...filtered.map((row) => headers.map((h) => JSON.stringify(String((row as unknown as Record<string, unknown>)[h] ?? ''))).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'general_enquiries.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-primary-700 uppercase tracking-widest">
            <Inbox size={14} /> Prospective Student Enquiries
          </div>
          <h1 className="text-2xl font-black text-secondary-900">Enquiries Pipeline</h1>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-secondary-700 bg-white border border-secondary-200 hover:bg-secondary-50 transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            onClick={exportCsv}
            disabled={!filtered.length}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 transition-colors shadow-sm disabled:opacity-50"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold">
          {error}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-secondary-200/80 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-3 text-secondary-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search candidate name, mobile, email, course, or enquiry type..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-secondary-200 text-xs text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          />
        </div>
      </div>

      {/* Table List */}
      <div className="bg-white rounded-2xl border border-secondary-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-secondary-50/80 text-secondary-600 text-xs font-bold uppercase tracking-wider border-b border-secondary-200">
                <th className="py-3.5 px-6">Applicant Name</th>
                <th className="py-3.5 px-6">Mobile Number</th>
                <th className="py-3.5 px-6">Course</th>
                <th className="py-3.5 px-6">Enquiry Type</th>
                <th className="py-3.5 px-6">Current Status</th>
                <th className="py-3.5 px-6">Submitted Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-secondary-500 text-sm">
                    Loading enquiries list...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-secondary-500 text-sm">
                    {error ? 'Unable to load enquiries.' : 'No enquiry records found.'}
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-primary-50/30 transition-colors cursor-pointer"
                    onClick={() => openRow(r)}
                  >
                    <td className="py-4 px-6 font-semibold text-secondary-900 flex items-center gap-2">
                      <User size={15} className="text-secondary-400" />
                      {r.name || '-'}
                    </td>
                    <td className="py-4 px-6 text-secondary-700">
                      <span className="inline-flex items-center gap-1.5">
                        <Phone size={13} className="text-secondary-400" />
                        {r.mobile || '-'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-secondary-700">
                      <span className="inline-flex items-center gap-1.5">
                        <BookOpen size={13} className="text-secondary-400" />
                        {r.course || 'General'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-secondary-500">
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 font-medium text-secondary-700">
                        {r.enquiry_type || 'Website Enquiry'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        {r.status || 'New'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-secondary-500 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar size={13} className="text-secondary-400" />
                        {r.created_at ? new Date(r.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Drawer / Modal */}
      {selected && (
        <div className="fixed inset-0 z-[120] bg-secondary-950/60 backdrop-blur-sm p-4 flex items-center justify-center overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full border border-secondary-200 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-secondary-100 pb-4">
              <div>
                <p className="text-xs font-bold text-primary-600 uppercase tracking-widest">Enquiry Record Details</p>
                <h3 className="text-xl font-black text-secondary-900 mt-0.5">{selected.name || 'Anonymous Applicant'}</h3>
              </div>
              <button onClick={() => setSelected(null)} className="px-3 py-1.5 rounded-xl border border-secondary-200 text-xs font-bold text-secondary-600 hover:bg-secondary-50">
                Close
              </button>
            </div>

            {/* Status Update Control */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-secondary-700">Update Lead Status</p>
                <p className="text-[11px] text-secondary-500">Track and manage prospective student workflow status.</p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="px-3 py-1.5 text-xs font-medium rounded-xl border border-secondary-200 bg-white"
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <button
                  onClick={updateStatus}
                  disabled={saving}
                  className="px-4 py-1.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>

            {/* Field Breakdown Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
                <p className="text-secondary-400 font-medium">Applicant Name</p>
                <p className="font-bold text-secondary-900 mt-1">{selected.name || '-'}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
                <p className="text-secondary-400 font-medium">Mobile Number</p>
                <p className="font-bold text-secondary-900 mt-1">{selected.mobile || '-'}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
                <p className="text-secondary-400 font-medium">Email Address</p>
                <p className="font-bold text-secondary-900 mt-1">{selected.email || '-'}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
                <p className="text-secondary-400 font-medium">Course Interest</p>
                <p className="font-bold text-secondary-900 mt-1">{selected.course || 'General'}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
                <p className="text-secondary-400 font-medium">Enquiry Type</p>
                <p className="font-bold text-secondary-900 mt-1">{selected.enquiry_type || 'Website Enquiry'}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
                <p className="text-secondary-400 font-medium">Lead Source</p>
                <p className="font-bold text-secondary-900 mt-1">{selected.source || 'Website'}</p>
              </div>
            </div>

            {/* Message Body */}
            {selected.message && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <p className="text-xs font-bold text-secondary-700 mb-1 flex items-center gap-1.5">
                  <MessageSquare size={13} className="text-primary-600" /> Additional Message / Query:
                </p>
                <p className="text-xs text-secondary-800 leading-relaxed font-normal whitespace-pre-wrap">
                  {selected.message}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
