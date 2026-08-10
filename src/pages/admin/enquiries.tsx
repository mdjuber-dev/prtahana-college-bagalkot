import { useEffect, useState } from 'react';
import { fetchGeneralEnquiries, updateGeneralEnquiryStatus, type GeneralEnquiryRow } from '@/lib/enquiries';

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
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-primary-700">Home popup & contact enquiries → <code className="bg-secondary-100 px-1 rounded">general_enquiries</code></p>
        <h2 className="text-2xl font-bold">Enquiries</h2>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm font-semibold">
          {error}
          {error.includes('schema cache') && (
            <p className="mt-2 font-normal text-red-700">
              Run migration <code className="bg-red-100 px-1 rounded">20260810170000_ensure_general_enquiries_pipeline.sql</code> in Supabase SQL Editor, then click Refresh.
            </p>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, mobile, email, course, type or status" className="p-2 border rounded-lg flex-1" />
        <button onClick={load} disabled={loading} className="px-3 py-2 border rounded-lg disabled:opacity-50">{loading ? 'Loading…' : 'Refresh'}</button>
        <button onClick={exportCsv} disabled={!filtered.length} className="px-3 py-2 border rounded-lg disabled:opacity-50">Export</button>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary-50">
            <tr className="border-b">
              <th className="p-3">Name</th>
              <th className="p-3">Mobile</th>
              <th className="p-3">Course</th>
              <th className="p-3">Type</th>
              <th className="p-3">Status</th>
              <th className="p-3">Submitted</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center text-secondary-500">Loading enquiries…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-secondary-500">{error ? 'Unable to load enquiries.' : 'No enquiry records yet.'}</td></tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id} className="border-b hover:bg-primary-50 cursor-pointer" onClick={() => openRow(r)}>
                  <td className="p-3 font-medium">{r.name || '-'}</td>
                  <td className="p-3">{r.mobile || '-'}</td>
                  <td className="p-3">{r.course || '-'}</td>
                  <td className="p-3">{r.enquiry_type || '-'}</td>
                  <td className="p-3">{r.status || 'New'}</td>
                  <td className="p-3 whitespace-nowrap">{r.created_at ? new Date(r.created_at).toLocaleString('en-IN') : '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 z-[120] bg-black/50 p-4 flex items-start justify-center overflow-y-auto">
          <div className="bg-white rounded-xl p-6 max-w-3xl w-full">
            <div className="flex justify-between items-center mb-4 gap-3">
              <h3 className="text-xl font-semibold">{selected.name || 'Enquiry'}</h3>
              <button onClick={() => setSelected(null)} className="px-2 py-1 border rounded">Close</button>
            </div>
            <div className="flex gap-2 mb-4">
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="p-2 border rounded">
                {statuses.map((s) => <option key={s}>{s}</option>)}
              </select>
              <button onClick={updateStatus} disabled={saving} className="px-3 py-2 bg-primary-700 text-white rounded disabled:opacity-50">
                {saving ? 'Saving…' : 'Update Status'}
              </button>
            </div>
            <pre className="text-sm bg-gray-50 p-3 rounded overflow-auto max-h-[65vh]">{JSON.stringify(selected, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
