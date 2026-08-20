import { useEffect, useMemo, useState } from 'react';
import { Eye, RefreshCw, Search, Trash2, X, GraduationCap, Download, CheckCircle2, AlertCircle } from 'lucide-react';
import { deleteAdmission, listAdmissions, updateAdmission } from '@/lib/api';
import { getMediaUrl } from '@/lib/media-url';
import AdminPageHeader from '@/components/admin/ui/AdminPageHeader';
import StatusBadge from '@/components/admin/ui/StatusBadge';

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

    try {
      const data = await listAdmissions(500);
      setRows((data as AdmissionRow[]) || []);
    } catch (fetchError: any) {
      console.error('load admissions failed:', fetchError);
      setRows([]);
      setError(fetchError?.message || String(fetchError));
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
    if (!selected) return;

    const identifier = getAdmissionIdentifier(selected);
    if (!identifier) {
      setError('This admission does not have an application ID or reference code, so it cannot be updated safely.');
      return;
    }

    setSaving(true);
    setError('');
    setNotice('');

    try {
      const updatedAt = new Date().toISOString();
      const data = await updateAdmission(identifier.column, identifier.value, { status, updated_at: updatedAt });
      const updated = (data as AdmissionRow | null) || { ...selected, status, updated_at: updatedAt };
      setSelected(updated);
      setRows((prev) => prev.map((row) => {
        const rowIdentifier = getAdmissionIdentifier(row);
        return rowIdentifier?.column === identifier.column && rowIdentifier.value === identifier.value ? updated : row;
      }));
      setNotice('Saved successfully.');
    } catch (updateError: any) {
      console.error('update admission status failed:', updateError);
      setError(updateError?.message || String(updateError));
    }

    setSaving(false);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    const identifier = getAdmissionIdentifier(deleteTarget);
    if (!identifier) {
      setError('This admission does not have an application ID or reference code, so it cannot be deleted safely.');
      return;
    }

    setDeleting(true);
    setError('');
    setNotice('');

    try {
      await deleteAdmission(identifier.column, identifier.value);
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
    } catch (deleteError: any) {
      console.error('delete admission failed:', deleteError);
      setError(deleteError?.message || String(deleteError));
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
    <div className="space-y-6">
      <AdminPageHeader
        title="Admissions Management"
        subtitle="Manage student application forms, view applicant profiles, track review status, and export record data."
        icon={GraduationCap}
        badge="Admissions Pipeline"
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

      {notice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, mobile, email, app ID, reference, course..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder-secondary-400"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-secondary-700 focus:outline-none focus:border-primary-500"
          >
            <option value="All">All Statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <span className="text-xs font-bold text-secondary-500 hidden sm:inline">
            Showing <strong className="text-primary-700">{filtered.length}</strong> items
          </span>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold uppercase tracking-wider text-secondary-500">
                <th className="py-4 px-6">Application / Ref</th>
                <th className="py-4 px-4">Student Name</th>
                <th className="py-4 px-4">Course</th>
                <th className="py-4 px-4">Mobile</th>
                <th className="py-4 px-4">Email</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4">Submitted</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-secondary-400 font-semibold">
                    Loading admissions database...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-secondary-500 font-semibold">
                    {error ? 'Unable to load admissions.' : 'No admissions found matching criteria.'}
                  </td>
                </tr>
              ) : (
                filtered.map((r, index) => (
                  <tr key={rowKey(r, index)} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-secondary-900">{r.application_id || '-'}</div>
                      <div className="text-[11px] text-secondary-500 font-mono">{r.reference_code || '-'}</div>
                    </td>
                    <td className="py-4 px-4 font-bold text-secondary-900">{r.student_name || '-'}</td>
                    <td className="py-4 px-4 font-semibold text-secondary-700">{r.course_interested || '-'}</td>
                    <td className="py-4 px-4 font-medium text-secondary-600">{r.mobile_number || '-'}</td>
                    <td className="py-4 px-4 font-medium text-secondary-600">{r.email || '-'}</td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <StatusBadge status={String(r.status || 'Submitted')} size="sm" />
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-secondary-500 font-medium">{formatValue(r.created_at || r.submitted_at)}</td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openRow(r)}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 text-secondary-700 hover:bg-primary-50 hover:text-primary-700 hover:border-primary-200 transition-colors font-bold text-xs inline-flex items-center gap-1"
                        >
                          <Eye size={14} /> View
                        </button>
                        <button
                          onClick={() => setDeleteTarget(r)}
                          className="p-1.5 rounded-xl text-secondary-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Admission"
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
                  <img src={getMediaUrl(String(selected.photo_url))} alt="Student upload" className="w-32 h-32 object-cover rounded-xl border" />
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
