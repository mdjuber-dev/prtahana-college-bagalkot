import { useEffect, useMemo, useState } from 'react';
import { createDashboardConfig, deleteDashboardConfig, listDashboardConfigs, updateDashboardConfig } from '@/lib/neon-api';
import { BarChart3, Plus, Trash2, Edit2, ExternalLink, ShieldAlert, CheckCircle2, Eye, Layout, AlertCircle } from 'lucide-react';
import AdminPageHeader from '@/components/admin/ui/AdminPageHeader';

interface DashboardConfig {
  id: string;
  name: string;
  provider: 'Power BI' | 'Tableau' | 'Other';
  embed_url: string;
  status: 'enabled' | 'disabled';
  description?: string;
  display_order?: number;
  is_default?: boolean;
  created_at?: string;
}

type DashboardForm = Omit<DashboardConfig, 'id' | 'created_at'> & { id: string };

const emptyForm: DashboardForm = {
  id: '',
  name: '',
  provider: 'Power BI',
  embed_url: '',
  status: 'enabled',
  description: '',
  display_order: 1,
  is_default: false,
};

function validateEmbedUrl(url: string, provider: string): { valid: boolean; message?: string; normalized?: string } {
  if (!url.trim()) return { valid: false, message: 'Embed URL cannot be empty.' };
  try {
    const parsed = new URL(url.trim());
    if (parsed.protocol !== 'https:') {
      return { valid: false, message: 'Embed URL must use secure HTTPS protocol.' };
    }

    if (provider === 'Power BI') {
      const host = parsed.hostname.toLowerCase();
      const isPowerBiDomain = host === 'app.powerbi.com' || host.endsWith('.powerbi.com');
      const isReportEmbed = parsed.pathname.includes('/reportEmbed') || parsed.pathname.includes('/view');
      const hasReportId = parsed.searchParams.has('reportId') || parsed.searchParams.has('ctid');

      if (!isPowerBiDomain) {
        return { valid: false, message: 'Power BI URL must originate from app.powerbi.com' };
      }
      if (!isReportEmbed && !hasReportId) {
        return {
          valid: false,
          message: 'Use a public "Publish to web" or embedded report URL (e.g. https://app.powerbi.com/view?r=... or https://app.powerbi.com/reportEmbed?...)',
        };
      }
    }

    return { valid: true, normalized: parsed.toString() };
  } catch {
    return { valid: false, message: 'Invalid URL format. Please paste a full HTTPS URL.' };
  }
}

export default function AnalyticsDashboardAdmin() {
  const [items, setItems] = useState<DashboardConfig[]>([]);
  const [form, setForm] = useState<DashboardForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [activeDashboard, setActiveDashboard] = useState<DashboardConfig | null>(null);

  const validation = useMemo(() => {
    return form.embed_url ? validateEmbedUrl(form.embed_url, form.provider) : { valid: false };
  }, [form.embed_url, form.provider]);

  const loadDashboards = async () => {
    setLoading(true);
    try {
      const data = await listDashboardConfigs();
      const rows = ((data as DashboardConfig[]) || []).sort(
        (a, b) => (a.display_order ?? 999) - (b.display_order ?? 999),
      );
      setItems(rows);
      const defaultItem = rows.find((r) => r.is_default && r.status === 'enabled') || rows.find((r) => r.status === 'enabled') || rows[0];
      if (defaultItem) {
        setActiveDashboard(defaultItem);
        setPreviewUrl(defaultItem.embed_url);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load dashboards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboards();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.name.trim()) {
      setError('Dashboard name is required.');
      return;
    }

    const check = validateEmbedUrl(form.embed_url, form.provider);
    if (!check.valid) {
      setError(check.message || 'Invalid embed URL.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        provider: form.provider,
        embed_url: check.normalized || form.embed_url.trim(),
        status: form.status,
        description: form.description?.trim() || '',
        display_order: Number(form.display_order) || 1,
        is_default: Boolean(form.is_default),
      };

      if (form.id) await updateDashboardConfig(form.id, payload);
      else await createDashboardConfig(payload);
      setSuccess(`Dashboard "${payload.name}" saved successfully.`);
      setForm(emptyForm);
      await loadDashboards();
    } catch (err: any) {
      setError(err?.message || 'Failed to save dashboard configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: DashboardConfig) => {
    setForm({
      id: item.id,
      name: item.name,
      provider: item.provider,
      embed_url: item.embed_url,
      status: item.status,
      description: item.description || '',
      display_order: item.display_order || 1,
      is_default: item.is_default || false,
    });
    setPreviewUrl(item.embed_url);
    setActiveDashboard(item);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this dashboard configuration?')) return;
    try {
      await deleteDashboardConfig(id);
      setSuccess('Dashboard configuration deleted.');
      if (activeDashboard?.id === id) {
        setActiveDashboard(null);
        setPreviewUrl('');
      }
      await loadDashboards();
    } catch (delErr: any) {
      setError(delErr?.message || String(delErr));
    }
  };

  const handlePreview = (item: DashboardConfig) => {
    setActiveDashboard(item);
    setPreviewUrl(item.embed_url);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Dashboard Configuration & Analytics"
        subtitle="Manage Power BI, Tableau, and external BI dashboard embeds, set default analytics views, and configure reporting panels."
        icon={BarChart3}
        badge="Analytics Portal"
      />

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold flex items-center gap-2">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 size={18} /> {success}
        </div>
      )}

      {/* Security Callout Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-primary-950 text-white shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <ShieldAlert size={14} /> Power BI Security & Authentication Note
          </div>
          <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
            Support is included for public / <strong>"Publish to Web"</strong> Power BI report links. For confidential organization dashboards requiring Entra ID / Azure AD tokens, client secrets are never exposed in frontend code — the system is decoupled so a secure backend Edge Function service can provide token auth.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Config Form & List */}
        <div className="lg:col-span-5 space-y-6">
          {/* Add / Edit Form */}
          <div className="bg-white rounded-2xl border p-5 shadow-soft space-y-4">
            <h3 className="font-extrabold text-secondary-900 text-base flex items-center gap-2 border-b pb-3">
              <Layout size={18} className="text-primary-700" />
              {form.id ? 'Edit Analytics Dashboard' : 'Add Analytics Dashboard'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-secondary-700 uppercase tracking-wider mb-1">Dashboard Name *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Admissions & Revenue Analytics"
                  className="w-full p-2.5 border rounded-xl bg-white text-secondary-900 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-secondary-700 uppercase tracking-wider mb-1">Provider</label>
                  <select
                    value={form.provider}
                    onChange={(e) => setForm({ ...form, provider: e.target.value as any })}
                    className="w-full p-2.5 border rounded-xl bg-white text-secondary-900 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  >
                    <option value="Power BI">Power BI</option>
                    <option value="Tableau">Tableau</option>
                    <option value="Other">Other Embed</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-secondary-700 uppercase tracking-wider mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                    className="w-full p-2.5 border rounded-xl bg-white text-secondary-900 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  >
                    <option value="enabled">Enabled</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-secondary-700 uppercase tracking-wider mb-1">Display Order</label>
                  <input
                    type="number"
                    min={1}
                    value={form.display_order}
                    onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) || 1 })}
                    className="w-full p-2.5 border rounded-xl bg-white text-secondary-900 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-secondary-700 uppercase tracking-wider mb-1">Power BI / Embed HTTPS URL *</label>
                <input
                  required
                  value={form.embed_url}
                  onChange={(e) => setForm({ ...form, embed_url: e.target.value })}
                  placeholder="https://app.powerbi.com/view?r=..."
                  className="w-full p-2.5 border rounded-xl bg-white font-mono text-xs text-secondary-900 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
                {form.embed_url && !validation.valid && (
                  <p className="mt-1 text-[11px] text-red-600 font-semibold">{validation.message}</p>
                )}
              </div>

              <div>
                <label className="block font-bold text-secondary-700 uppercase tracking-wider mb-1">Description (Optional)</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief summary of KPIs, charts, or reports in this dashboard..."
                  rows={2}
                  className="w-full p-2.5 border rounded-xl bg-white text-secondary-900 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.is_default}
                    onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
                    className="w-4 h-4 text-primary-600 rounded border-secondary-300 focus:ring-primary-500"
                  />
                  <span className="font-bold text-secondary-800">Set as Default Dashboard</span>
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 px-4 bg-gradient-primary text-white font-bold rounded-xl text-xs shadow-sm hover:shadow-glow transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <Plus size={14} />
                  {saving ? 'Saving...' : form.id ? 'Update Dashboard' : 'Save Dashboard'}
                </button>
                {form.id && (
                  <button
                    type="button"
                    onClick={() => setForm(emptyForm)}
                    className="py-2.5 px-4 bg-secondary-100 text-secondary-700 font-bold rounded-xl text-xs hover:bg-secondary-200"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Saved List */}
          <div className="bg-white rounded-2xl border p-5 shadow-soft space-y-3">
            <h3 className="font-extrabold text-secondary-900 text-sm border-b pb-3">Configured Analytics Dashboards</h3>
            {loading ? (
              <div className="py-6 text-center text-xs text-secondary-400">Loading saved dashboards...</div>
            ) : items.length === 0 ? (
              <div className="py-6 text-center text-xs text-secondary-500 bg-secondary-50 rounded-xl border border-dashed">
                No dashboards configured yet. Add your Power BI embed URL above.
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${activeDashboard?.id === item.id ? 'bg-primary-50/70 border-primary-300 ring-1 ring-primary-400' : 'bg-white hover:bg-secondary-50'
                      }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-secondary-900 truncate">{item.name}</span>
                        {item.is_default && (
                          <span className="px-1.5 py-0.5 rounded bg-primary-700 text-white text-[9px] font-extrabold uppercase">
                            Default
                          </span>
                        )}
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${item.status === 'enabled' ? 'bg-emerald-100 text-emerald-800' : 'bg-secondary-200 text-secondary-600'
                          }`}>
                          {item.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-secondary-500 truncate mt-0.5">{item.provider} · {item.embed_url}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handlePreview(item)}
                        className="p-1.5 text-primary-700 hover:bg-primary-100 rounded-lg"
                        title="Preview Live Report"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-1.5 text-secondary-700 hover:bg-secondary-100 rounded-lg"
                        title="Edit Config"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete Config"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Embed Container */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border shadow-soft overflow-hidden flex flex-col h-[700px]">
            {/* Embed Header */}
            <div className="p-4 bg-secondary-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <BarChart3 size={18} className="text-accent-400" />
                <div>
                  <h4 className="font-bold text-sm leading-tight">
                    {activeDashboard ? activeDashboard.name : 'Power BI Live Report Viewer'}
                  </h4>
                  <p className="text-[11px] text-secondary-400">
                    {activeDashboard ? `${activeDashboard.provider} · ${activeDashboard.status}` : 'Select a dashboard to load'}
                  </p>
                </div>
              </div>
              {previewUrl && (
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink size={13} /> Open External
                </a>
              )}
            </div>

            {/* Embed Iframe Container */}
            <div className="flex-1 bg-slate-100 relative">
              {previewUrl ? (
                <iframe
                  src={previewUrl}
                  title={activeDashboard?.name || 'Analytics Dashboard'}
                  className="w-full h-full border-0"
                  allowFullScreen
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-secondary-50">
                  <div className="w-16 h-16 rounded-2xl bg-primary-50 text-primary-700 flex items-center justify-center mb-4 border border-primary-200">
                    <BarChart3 size={32} />
                  </div>
                  <h4 className="text-lg font-extrabold text-secondary-900 mb-1">No Active Analytics Dashboard Selected</h4>
                  <p className="text-xs text-secondary-500 max-w-md leading-relaxed">
                    Paste a valid HTTPS Power BI embed link on the left or select a configured dashboard from the saved list to render interactive pie charts, bar graphs, KPIs, slicers and tables here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
