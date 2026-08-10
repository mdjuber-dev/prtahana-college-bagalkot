import { useEffect, useMemo, useState } from 'react';
import { Eye, RefreshCw, Search, Trash2, X } from 'lucide-react';
import { supabase } from '@/lib/supabase-config';

type AdmissionRow = Record<string, unknown> & {
  application_id?: string | null;
  reference_code?: string | null;
  student_name?: string | null;
  mobile_number?: string | null;
  email?: string | null;
  course_interested?: string | null;
  status?: string | null;
  created_at?: string | null;
  submitted_at?: string | null;
  updated_at?: string | null;
};

type AdmissionIdentifier = {
  column: 'application_id' | 'reference_code';
  value: string;
};

const statuses = ['Submitted', 'Pending', 'Approved', 'Rejected'];

const exportHeaders = [
  'application_id',
  'reference_code',
  'student_name',
  'course_interested',
  'mobile_number',
  'email',
  'status',
  'submitted_at',
  'created_at',
];

const detailSections: { title: string; fields: { key: string; label: string }[] }[] = [
  {
    title: 'Application',
    fields: [
      { key: 'application_id', label: 'Application ID' },
      { key: 'reference_code', label: 'Reference Code' },
      { key: 'status', label: 'Status' },
      { key: 'course_interested', label: 'Course' },
      { key: 'medium_of_instruction', label: 'Medium' },
      { key: 'preferred_batch', label: 'Preferred Batch' },
      { key: 'submitted_at', label: 'Submitted At' },
      { key: 'created_at', label: 'Created At' },
    ],
  },
  {
    title: 'Student',
    fields: [
      { key: 'student_name', label: 'Student Name' },
      { key: 'date_of_birth', label: 'Date of Birth' },
      { key: 'gender', label: 'Gender' },
      { key: 'nationality', label: 'Nationality' },
      { key: 'mother_tongue', label: 'Mother Tongue' },
      { key: 'religion', label: 'Religion' },
      { key: 'caste', label: 'Caste' },
      { key: 'blood_group', label: 'Blood Group' },
      { key: 'aadhaar_number', label: 'Aadhaar Number' },
    ],
  },
  {
    title: 'Contact',
    fields: [
      { key: 'mobile_number', label: 'Mobile' },
      { key: 'alternate_mobile', label: 'Alternate Mobile' },
      { key: 'email', label: 'Email' },
      { key: 'parent_mobile', label: 'Parent Mobile' },
      { key: 'parent_email', label: 'Parent Email' },
      { key: 'emergency_contact', label: 'Emergency Contact' },
      { key: 'address', label: 'Address' },
      { key: 'city', label: 'City' },
      { key: 'district', label: 'District' },
      { key: 'state', label: 'State' },
      { key: 'pin_code', label: 'PIN Code' },
    ],
  },
  {
    title: 'Parent & Academic',
    fields: [
      { key: 'father_name', label: "Father's Name" },
      { key: 'mother_name', label: "Mother's Name" },
      { key: 'parent_occupation', label: "Parent's Occupation" },
      { key: 'annual_family_income', label: 'Annual Family Income' },
      { key: 'previous_school', label: 'Previous School' },
      { key: 'previous_school_address', label: 'Previous School Address' },
      { key: 'sslc_marks', label: 'SSLC Marks' },
      { key: 'sslc_board', label: 'SSLC Board' },
      { key: 'passing_year', label: 'Passing Year' },
    ],
  },
  {
    title: 'Facilities & Notes',
    fields: [
      { key: 'transport_required', label: 'Transport Required' },
      { key: 'hostel_required', label: 'Hostel Required' },
      { key: 'admission_source', label: 'Admission Source' },
      { key: 'message', label: 'Message' },
      { key: 'remarks', label: 'Remarks' },
      { key: 'follow_up_date', label: 'Follow-up Date' },
      { key: 'reception_notes', label: 'Reception Notes' },
      { key: 'counsellor_name', label: 'Counsellor' },
    ],
  },
];

function getAdmissionIdentifier(row: AdmissionRow | null): AdmissionIdentifier | null {
  const applicationId = String(row?.application_id || '').trim();
  if (applicationId) return { column: 'application_id', value: applicationId };

  const referenceCode = String(row?.reference_code || '').trim();
  if (referenceCode) return { column: 'reference_code', value: referenceCode };

  return null;
}

function rowKey(row: AdmissionRow, index: number): string {
  const identifier = getAdmissionIdentifier(row);
  return identifier ? `${identifier.column}:${identifier.value}` : `admission-row-${index}`;
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '-';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') return String(value);
  const raw = String(value);
  if (/^\d{4}-\d{2}-\d{2}T/.test(raw)) return new Date(raw).toLocaleString('en-IN');
  return raw;
}

function isImageSource(value: unknown): value is string {
  const raw = String(value || '');
  return raw.startsWith('data:image/') || /\.(png|jpe?g|webp|gif)(\?.*)?$/i.test(raw);
}

function isUrl(value: unknown): value is string {
  const raw = String(value || '');
  return /^https?:\/\//i.test(raw);
}

function isLongEncodedValue(value: unknown): boolean {
  const raw = String(value || '');
  return raw.length > 300 && /^[A-Za-z0-9+/=:\-;,._\s]+$/.test(raw);
}

function displayIdentifier(row: AdmissionRow | null): string {
  return String(row?.application_id || row?.reference_code || '-');
}

function statusClass(status: string): string {
  if (status === 'Approved') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (status === 'Rejected') return 'bg-red-50 text-red-700 border-red-200';
  if (status === 'Pending') return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-blue-50 text-blue-700 border-blue-200';
}

export default function AdminAdmissions() {
  const [rows, setRows] = useState<AdmissionRow[]>([]);
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selected, setSelected] = useState<AdmissionRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdmissionRow | null>(null);
  const [status, setStatus] = useState('Submitted');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    setNotice('');

    if (!supabase) {
      setRows([]);
      setError('Supabase is not configured.');
      setLoading(false);
      return;
    }

    const { data, error: fetchError } = await supabase
      .from('admissions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);

    if (fetchError) {
      console.error('load admissions failed:', fetchError);
      setRows([]);
      setError(fetchError.message);
    } else {
      setRows((data as AdmissionRow[]) || []);
    }

    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => {
    const search = q.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesStatus = statusFilter === 'All' || String(r.status || 'Submitted') === statusFilter;
      if (!matchesStatus) return false;
      if (!search) return true;

      return [
        r.student_name,
        r.mobile_number,
        r.email,
        r.application_id,
        r.reference_code,
        r.course_interested,
        r.status,
      ].some((value) => String(value || '').toLowerCase().includes(search));
    });
  }, [q, rows, statusFilter]);

  const openRow = (row: AdmissionRow) => {
    setSelected(row);
    const rowStatus = String(row.status || 'Submitted');
    setStatus(statuses.includes(rowStatus) ? rowStatus : 'Submitted');
    setNotice('');
  };

  const updateStatus = async () => {
    if (!supabase || !selected) return;

    const identifier = getAdmissionIdentifier(selected);
    if (!identifier) {
      setError('This admission does not have an application ID or reference code, so it cannot be updated safely.');
      return;
    }

    setSaving(true);
    setError('');
    setNotice('');

    const { data, error: updateError } = await supabase
      .from('admissions')
      .update({ status, updated_at: new Date().toISOString() })
      .eq(identifier.column, identifier.value)
      .select('*')
      .maybeSingle();

    if (updateError) {
      console.error('update admission status failed:', updateError);
      setError(updateError.message);
    } else {
      const updated = (data as AdmissionRow | null) || { ...selected, status };
      setSelected(updated);
      setRows((prev) => prev.map((row) => {
        const rowIdentifier = getAdmissionIdentifier(row);
        return rowIdentifier?.column === identifier.column && rowIdentifier.value === identifier.value ? updated : row;
      }));
      setNotice('Saved successfully.');
    }

    setSaving(false);
  };

  const confirmDelete = async () => {
    if (!supabase || !deleteTarget) return;

    const identifier = getAdmissionIdentifier(deleteTarget);
    if (!identifier) {
      setError('This admission does not have an application ID or reference code, so it cannot be deleted safely.');
      return;
    }

    setDeleting(true);
    setError('');
    setNotice('');

    const { error: deleteError } = await supabase
      .from('admissions')
      .delete()
      .eq(identifier.column, identifier.value);

    if (deleteError) {
      console.error('delete admission failed:', deleteError);
      setError(deleteError.message);
    } else {
      setRows((prev) => prev.filter((row) => {
        const rowIdentifier = getAdmissionIdentifier(row);
        return !(rowIdentifier?.column === identifier.column && rowIdentifier.value === identifier.value);
      }));
      if (selected) {
        const selectedIdentifier = getAdmissionIdentifier(selected);
        if (selectedIdentifier?.column === identifier.column && selectedIdentifier.value === identifier.value) {
          setSelected(null);
        }
      }
      setDeleteTarget(null);
      setNotice('Admission deleted successfully.');
      await load();
    }

    setDeleting(false);
  };

  const exportCsv = () => {
    const csv = [
      exportHeaders.join(','),
      ...filtered.map((row) => exportHeaders.map((h) => JSON.stringify(formatValue(row[h]))).join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'admissions.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-primary-700">Separate admissions records</p>
        <h2 className="text-2xl font-bold">Admissions</h2>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm font-semibold">
          {error}
        </div>
      )}

      {notice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold">
          {notice}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, mobile, email, application ID, reference, course or status"
            className="w-full pl-9 pr-3 py-2 border rounded-lg"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border rounded-lg bg-white">
          <option value="All">All Statuses</option>
          {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button onClick={load} disabled={loading} className="inline-flex items-center justify-center gap-2 px-3 py-2 border rounded-lg disabled:opacity-50">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> {loading ? 'Loading...' : 'Refresh'}
        </button>
        <button onClick={exportCsv} disabled={!filtered.length} className="px-3 py-2 border rounded-lg disabled:opacity-50">Export</button>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary-50">
            <tr className="border-b">
              <th className="p-3">Application / Reference</th>
              <th className="p-3">Student</th>
              <th className="p-3">Course</th>
              <th className="p-3">Mobile</th>
              <th className="p-3">Email</th>
              <th className="p-3">Status</th>
              <th className="p-3">Submitted</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="p-8 text-center text-secondary-500">Loading admissions...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} className="p-8 text-center text-secondary-500">{error ? 'Unable to load admissions.' : 'No admissions found.'}</td></tr>
            ) : (
              filtered.map((r, index) => (
                <tr key={rowKey(r, index)} className="border-b hover:bg-primary-50">
                  <td className="p-3">
                    <div className="font-semibold text-secondary-900">{r.application_id || '-'}</div>
                    <div className="text-xs text-secondary-500">{r.reference_code || '-'}</div>
                  </td>
                  <td className="p-3 font-medium">{r.student_name || '-'}</td>
                  <td className="p-3">{r.course_interested || '-'}</td>
                  <td className="p-3">{r.mobile_number || '-'}</td>
                  <td className="p-3">{r.email || '-'}</td>
                  <td className="p-3">
                    <span className={`inline-flex px-2.5 py-1 rounded-full border text-xs font-bold ${statusClass(String(r.status || 'Submitted'))}`}>
                      {r.status || 'Submitted'}
                    </span>
                  </td>
                  <td className="p-3 whitespace-nowrap">{formatValue(r.created_at || r.submitted_at)}</td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openRow(r)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-secondary-200 text-secondary-700 hover:bg-white"
                      >
                        <Eye size={14} /> View
                      </button>
                      <button
                        onClick={() => setDeleteTarget(r)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-red-200 text-red-700 hover:bg-red-50"
                        title="Delete Admission"
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

      {selected && (
        <div className="fixed inset-0 z-[120] bg-black/50 p-4 flex items-start justify-center overflow-y-auto">
          <div className="bg-white rounded-xl p-6 max-w-5xl w-full my-8">
            <div className="flex justify-between items-start mb-4 gap-3">
              <div>
                <p className="text-xs font-bold text-primary-700 uppercase tracking-wide">Admission Details</p>
                <h3 className="text-xl font-semibold">{selected.student_name || 'Admission'} - {displayIdentifier(selected)}</h3>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 border rounded-lg hover:bg-secondary-50" aria-label="Close admission details">
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 mb-4 p-4 rounded-xl bg-secondary-50 border">
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="p-2 border rounded-lg bg-white">
                {statuses.map((s) => <option key={s}>{s}</option>)}
              </select>
              <button onClick={updateStatus} disabled={saving} className="px-3 py-2 bg-primary-700 text-white rounded-lg disabled:opacity-50">
                {saving ? 'Saving...' : 'Update Status'}
              </button>
              <button
                onClick={() => setDeleteTarget(selected)}
                className="inline-flex items-center justify-center gap-2 px-3 py-2 border border-red-200 text-red-700 rounded-lg hover:bg-red-50 sm:ml-auto"
              >
                <Trash2 size={16} /> Delete Admission
              </button>
            </div>

            {Boolean(selected.photo_url) && (
              <div className="mb-5 p-4 rounded-xl border bg-white">
                <h4 className="font-bold text-secondary-900 mb-3">Uploaded Photo</h4>
                {isImageSource(selected.photo_url) ? (
                  <img src={String(selected.photo_url)} alt="Student upload" className="w-32 h-32 object-cover rounded-xl border" />
                ) : isUrl(selected.photo_url) ? (
                  <a href={String(selected.photo_url)} target="_blank" rel="noopener noreferrer" className="text-primary-700 font-semibold underline">Open uploaded file</a>
                ) : (
                  <p className="text-sm text-secondary-500">Uploaded file data is stored with this admission.</p>
                )}
              </div>
            )}

            <div className="grid lg:grid-cols-2 gap-4">
              {detailSections.map((section) => (
                <section key={section.title} className="rounded-xl border bg-white p-4">
                  <h4 className="font-bold text-secondary-900 mb-3">{section.title}</h4>
                  <dl className="grid sm:grid-cols-2 gap-3">
                    {section.fields.map((field) => {
                      const value = selected[field.key];
                      if (value === undefined || field.key === 'photo_url') return null;
                      return (
                        <div key={field.key}>
                          <dt className="text-xs font-semibold text-secondary-500">{field.label}</dt>
                          <dd className="text-sm text-secondary-900 break-words">
                            {isLongEncodedValue(value) ? 'Stored file data' : formatValue(value)}
                          </dd>
                        </div>
                      );
                    })}
                  </dl>
                </section>
              ))}
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-[130] bg-black/60 p-4 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-700 flex items-center justify-center mb-4">
              <Trash2 size={24} />
            </div>
            <h3 className="text-xl font-bold text-secondary-900 mb-2">Delete Admission?</h3>
            <p className="text-sm text-secondary-600 mb-4">Are you sure you want to permanently delete this admission?</p>
            <div className="rounded-xl bg-secondary-50 border p-4 text-sm mb-5">
              <div><span className="font-semibold">Student Name:</span> {deleteTarget.student_name || '-'}</div>
              <div><span className="font-semibold">Application ID / Reference Code:</span> {displayIdentifier(deleteTarget)}</div>
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button onClick={() => setDeleteTarget(null)} disabled={deleting} className="px-4 py-2 border rounded-lg disabled:opacity-50">Cancel</button>
              <button onClick={confirmDelete} disabled={deleting} className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50">
                {deleting ? 'Deleting...' : 'Delete Admission'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
