import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchSiteConfig, upsertSiteConfig } from '@/lib/cms';
import { buildDefaultSiteCmsPayload } from '@/lib/cms-context';
import { getCurrentAdmin, getSiteCmsRow } from '@/lib/api';
import { Settings, User, Database, Shield, RefreshCw, ExternalLink } from 'lucide-react';

export default function AdminSettingsPage() {
  const [email, setEmail] = useState('');
  const [lastCmsUpdate, setLastCmsUpdate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      const [{ user }, data] = await Promise.all([
        getCurrentAdmin().catch(() => ({ user: null })),
        getSiteCmsRow('site_config').catch(() => null),
      ]);
      setEmail(user?.email || '');
      if (data?.updated_at) setLastCmsUpdate(data.updated_at);
      setLoading(false);
    })();
  }, []);

  const seedDefaults = async () => {
    if (!confirm('This will save default CMS content to the database. Existing site_config will be merged with defaults only if empty. Continue?')) return;
    setSeeding(true);
    setMessage(null);
    try {
      const existing = await fetchSiteConfig();
      const payload = existing && Object.keys(existing).length > 0
        ? existing
        : buildDefaultSiteCmsPayload();
      await upsertSiteConfig(payload);
      setMessage({ type: 'success', text: 'Default CMS content saved to database.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Failed to seed defaults.' });
    } finally {
      setSeeding(false);
    }
  };

  if (loading) {
    return <div className="p-8 bg-white rounded-2xl border text-center font-semibold">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-secondary-200/80 shadow-sm">
        <p className="text-xs font-bold text-primary-700 uppercase tracking-widest">Administration</p>
        <h2 className="text-2xl font-black text-secondary-900">Settings</h2>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl border text-sm font-semibold ${message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <section className="bg-white rounded-2xl border border-secondary-200/80 p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-secondary-900 flex items-center gap-2"><User size={18} /> Account Profile</h3>
          <p className="text-sm text-secondary-600">Signed in as <strong>{email || 'Administrator'}</strong></p>
          <p className="text-xs text-secondary-500">Only authorized emails registered in <code className="bg-secondary-100 px-1.5 py-0.5 rounded text-secondary-800 font-mono">admin_users</code> can access this administration portal.</p>
        </section>

        <section className="bg-white rounded-2xl border border-secondary-200/80 p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-secondary-900 flex items-center gap-2"><Database size={18} /> CMS Synchronization</h3>
          <p className="text-sm text-secondary-600">Last website content update: {lastCmsUpdate ? new Date(lastCmsUpdate).toLocaleString('en-IN') : 'Using default built-in configuration'}</p>
          <div className="flex flex-wrap gap-2">
            <Link to="/admin/cms/site-config" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold transition-colors">
              <Settings size={16} /> Open Website CMS
            </Link>
            <button onClick={seedDefaults} disabled={seeding} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-secondary-200 hover:bg-secondary-50 text-sm font-bold disabled:opacity-50 transition-colors">
              <RefreshCw size={16} className={seeding ? 'animate-spin' : ''} />
              {seeding ? 'Saving...' : 'Save Default CMS Content'}
            </button>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-secondary-200/80 p-5 shadow-sm space-y-3 md:col-span-2">
          <h3 className="font-bold text-secondary-900 flex items-center gap-2"><Shield size={18} /> Security & Data Policies</h3>
          <ul className="text-sm text-secondary-600 space-y-2 list-disc pl-5">
            <li>Admin routes require authenticated sessions matched against <code className="bg-secondary-100 px-1.5 py-0.5 rounded text-secondary-800 font-mono">public.admin_users</code>.</li>
            <li>All backend operations enforce server-side validation and sanitized queries.</li>
            <li>Enquiries are logged directly to <code className="bg-secondary-100 px-1.5 py-0.5 rounded text-secondary-800 font-mono">general_enquiries</code>; admission applications log to <code className="bg-secondary-100 px-1.5 py-0.5 rounded text-secondary-800 font-mono">admissions</code>.</li>
          </ul>
          <a href="/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-primary-700 hover:underline pt-2">
            <ExternalLink size={14} /> Open Public Website
          </a>
        </section>
      </div>
    </div>
  );
}
