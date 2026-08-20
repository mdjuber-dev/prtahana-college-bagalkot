import { useEffect, useState } from 'react';
import { fetchGeneralEnquiries, updateGeneralEnquiryStatus, deleteGeneralEnquiry, type GeneralEnquiryRow } from '@/lib/enquiries';
import { Inbox, RefreshCw, Download, Search, User, Phone, BookOpen, MessageSquare, Calendar, Trash2, Eye, AlertCircle } from 'lucide-react';
import AdminPageHeader from '@/components/admin/ui/AdminPageHeader';
import StatusBadge from '@/components/admin/ui/StatusBadge';

const statuses = ['New', 'Contacted', 'Follow Up', 'Converted', 'Closed'];

export default function AdminEnquiries() {
  const [rows, setRows] = useState<GeneralEnquiryRow[]>([]);
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<GeneralEnquiryRow | null>(null);
  const [status, setStatus] = useState('New');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<GeneralEnquiryRow | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setError('');
    try {
      const result = await deleteGeneralEnquiry(deleteTarget.id);
      if (!result.success) {
        setError(result.error || 'Unable to delete enquiry.');
      } else {
        setRows((prev) => prev.filter((r) => r.id !== deleteTarget.id));
        if (selected?.id === deleteTarget.id) setSelected(null);
        setDeleteTarget(null);
        await load();
      }
    } catch (deleteError: any) {
      setError(deleteError?.message || String(deleteError));
    } finally {
      setDeleting(false);
    }
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
      <AdminPageHeader
        title="Enquiries Pipeline"
        subtitle="Track prospective student inquiries, update contact statuses, and export admission leads."
        icon={Inbox}
        badge="Prospective Leads"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={load}
              disabled={loading}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all backdrop-blur-md border border-white/10 flex items-center gap-2"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
            <button
              onClick={exportCsv}
              disabled={!filtered.length}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Download size={14} />
              <span>Export CSV</span>
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

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search candidate name, mobile, email, course..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder-secondary-400"
          />
        </div>
        <span className="text-xs font-bold text-secondary-500">
          Total Enquiries: <strong className="text-primary-700">{filtered.length}</strong>
        </span>
      </div>

      {/* Table List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-secondary-500 text-[11px] font-extrabold uppercase tracking-wider border-b border-slate-200/80">
                <th className="py-4 px-6">Applicant Name</th>
                <th className="py-4 px-6">Mobile Number</th>
                <th className="py-4 px-6">Course</th>
                <th className="py-4 px-6">Enquiry Type</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Submitted Date</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-secondary-400 font-semibold">
                    Loading enquiries list...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-secondary-500 font-semibold">
                    {error ? 'Unable to load enquiries.' : 'No enquiry records found matching criteria.'}
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6 font-bold text-secondary-900 flex items-center gap-2">
                      <User size={15} className="text-secondary-400 shrink-0" />
                      <span>{r.name || '-'}</span>
                    </td>
                    <td className="py-4 px-6 text-secondary-700 font-medium">
                      <span className="inline-flex items-center gap-1.5">
                        <Phone size={13} className="text-secondary-400 shrink-0" />
                        {r.mobile || '-'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-secondary-700 font-semibold">
                      <span className="inline-flex items-center gap-1.5">
                        <BookOpen size={13} className="text-secondary-400 shrink-0" />
                        {r.course || 'General'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-secondary-500">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 font-bold text-secondary-700 border border-slate-200">
                        {r.enquiry_type || 'Website Enquiry'}
                      </span>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <StatusBadge status={r.status || 'New'} size="sm" />
                    </td>
                    <td className="py-4 px-6 text-xs text-secondary-500 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar size={13} className="text-secondary-400" />
                        {r.created_at ? new Date(r.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openRow(r)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-secondary-200 text-secondary-700 hover:bg-white"
                          title="View enquiry"
                        >
                          <Eye size={14} /> View
                        </button>
                        <button
                          onClick={() => setDeleteTarget(r)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-red-200 text-red-700 hover:bg-red-50"
                          title="Delete enquiry"
                        >
                          <Trash2 size={14} /> Delete
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
                <button
                  onClick={() => setDeleteTarget(selected)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-1.5 border border-red-200 text-red-700 rounded-xl hover:bg-red-50"
                >
                  <Trash2 size={14} /> Delete Enquiry
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

      {deleteTarget && (
        <div className="fixed inset-0 z-[130] bg-black/60 p-4 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-700 flex items-center justify-center mb-4">
              <Trash2 size={24} />
            </div>
            <h3 className="text-xl font-bold text-secondary-900 mb-2">Delete Enquiry?</h3>
            <p className="text-sm text-secondary-600 mb-4">Are you sure you want to permanently delete this enquiry?</p>
            <div className="rounded-xl bg-secondary-50 border p-4 text-sm mb-5">
              <div><span className="font-semibold">Name:</span> {deleteTarget.name || '-'}</div>
              <div><span className="font-semibold">Mobile:</span> {deleteTarget.mobile || '-'}</div>
              <div><span className="font-semibold">Enquiry Type:</span> {deleteTarget.enquiry_type || '-'}</div>
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button onClick={() => setDeleteTarget(null)} disabled={deleting} className="px-4 py-2 border rounded-lg disabled:opacity-50">Cancel</button>
              <button onClick={confirmDelete} disabled={deleting} className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50">
                {deleting ? 'Deleting...' : 'Delete Enquiry'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
