import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase-config';
import { fetchSiteConfig, upsertSiteConfig } from '@/lib/cms';
import { buildDefaultSiteCmsPayload } from '@/lib/cms-context';
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
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        setEmail(user?.email || '');
        const { data } = await supabase.from('site_cms').select('updated_at').eq('key', 'site_config').maybeSingle();
        if (data?.updated_at) setLastCmsUpdate(data.updated_at);
      }
      setLoading(false);
    })();
  }, []);

  const seedDefaults = async () => {
    if (!confirm('This will upsert default CMS content into Supabase. Existing site_config will be merged with defaults only if empty. Continue?')) return;
    setSeeding(true);
    setMessage(null);
    try {
      const existing = await fetchSiteConfig();
      const payload = existing && Object.keys(existing).length > 0
        ? existing
        : buildDefaultSiteCmsPayload();
      await upsertSiteConfig(payload);
      setMessage({ type: 'success', text: 'Default CMS content saved to Supabase.' });
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
      <div className="bg-white p-5 rounded-2xl border shadow-soft">
        <p className="text-xs font-bold text-primary-700 uppercase tracking-widest">Administration</p>
        <h2 className="text-2xl font-extrabold text-secondary-900">Settings</h2>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl border text-sm font-semibold ${message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <section className="bg-white rounded-2xl border p-5 shadow-soft space-y-4">
          <h3 className="font-bold text-secondary-900 flex items-center gap-2"><User size={18} /> Account</h3>
          <p className="text-sm text-secondary-600">Signed in as <strong>{email || 'Unknown'}</strong></p>
          <p className="text-xs text-secondary-500">To change your password, use <strong>Forgot password</strong> on the login page. Only emails listed in <code className="bg-secondary-100 px-1 rounded">admin_users</code> can access this dashboard.</p>
        </section>

        <section className="bg-white rounded-2xl border p-5 shadow-soft space-y-4">
          <h3 className="font-bold text-secondary-900 flex items-center gap-2"><Database size={18} /> CMS Database</h3>
          <p className="text-sm text-secondary-600">Last website content update: {lastCmsUpdate ? new Date(lastCmsUpdate).toLocaleString('en-IN') : 'Not saved yet (using built-in defaults)'}</p>
          <div className="flex flex-wrap gap-2">
            <Link to="/admin/cms/site-config" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-900 text-white text-sm font-bold">
              <Settings size={16} /> Open Website CMS
            </Link>
            <button onClick={seedDefaults} disabled={seeding} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold disabled:opacity-50">
              <RefreshCw size={16} className={seeding ? 'animate-spin' : ''} />
              {seeding ? 'Saving...' : 'Save Defaults to Supabase'}
            </button>
          </div>
        </section>

        <section className="bg-white rounded-2xl border p-5 shadow-soft space-y-3 md:col-span-2">
          <h3 className="font-bold text-secondary-900 flex items-center gap-2"><Shield size={18} /> Security</h3>
          <ul className="text-sm text-secondary-600 space-y-2 list-disc pl-5">
            <li>Admin routes require Supabase Auth + membership in <code className="bg-secondary-100 px-1 rounded">public.admin_users</code>.</li>
            <li>CMS writes use Row Level Security — no service-role keys in the browser.</li>
            <li>Power BI: use public &quot;Publish to web&quot; embed URLs only; private Azure credentials stay server-side.</li>
            <li>Popup enquiries → <code className="bg-secondary-100 px-1 rounded">general_enquiries</code>; full admissions → <code className="bg-secondary-100 px-1 rounded">admissions</code> (separate flows).</li>
          </ul>
          <a href="/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-primary-700 hover:underline">
            <ExternalLink size={14} /> View public website
          </a>
        </section>
      </div>
    </div>
  );
}
