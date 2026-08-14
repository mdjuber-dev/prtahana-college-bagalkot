import { useEffect, useState, useCallback } from 'react';
import { fetchSiteConfig, upsertSiteConfig } from '@/lib/cms';
import { listChatbotKnowledge, syncChatbotKnowledge, listGalleryItems, createGalleryItem, updateGalleryItem, deleteGalleryItem } from '@/lib/api';
import { useCMS, buildDefaultSiteCmsPayload } from '@/lib/cms-context';
import { mergeStoredCmsWithDefaults } from '@/lib/cms-defaults';
import { uploadCmsFile, uploadCmsPdf, resolveUploadCategory } from '@/lib/cms-upload';
import { getMediaUrl } from '@/lib/media-url';
import {
  Building2, BookOpen, FileText, GalleryHorizontal, Home,
  Save, Sparkles, UserCheck, Trophy, MessageSquare, Settings2,
} from 'lucide-react';
import {
  Section, TextField, ToggleField, ImageField, ReorderButtons,
  DeleteButton, AddButton, setPath, reorderList, LeaderEditor,
} from './cms-ui';
import type {
  CmsHeroSlide, CmsAchievementCard, CmsAchievementPoster,
  CmsFeeRow, CmsFacultyMember, CmsNavItem,
} from '@/lib/cms-defaults';

type CMSRecord = Record<string, any>;
type TabId = 'general' | 'home' | 'about' | 'leadership' | 'courses' | 'fees' | 'achievements' | 'gallery' | 'transport' | 'hostel' | 'pamphlet' | 'contact' | 'chatbot' | 'navbar';

const TABS: { id: TabId; label: string; icon: typeof Home; hash: string }[] = [
  { id: 'general', label: 'Branding & Contact', icon: Building2, hash: 'general' },
  { id: 'home', label: 'Home Page', icon: Home, hash: 'home' },
  { id: 'about', label: 'About College', icon: Building2, hash: 'about' },
  { id: 'leadership', label: 'Leadership', icon: UserCheck, hash: 'leadership' },
  { id: 'courses', label: 'Courses', icon: BookOpen, hash: 'courses' },
  { id: 'fees', label: 'Fee Structure', icon: FileText, hash: 'fees' },
  { id: 'achievements', label: 'Achievements', icon: Trophy, hash: 'achievements' },
  { id: 'gallery', label: 'Gallery', icon: GalleryHorizontal, hash: 'gallery' },
  { id: 'transport', label: 'Transport', icon: Building2, hash: 'transport' },
  { id: 'hostel', label: 'Hostel', icon: Building2, hash: 'hostel' },
  { id: 'pamphlet', label: 'Pamphlet', icon: FileText, hash: 'pamphlet' },
  { id: 'contact', label: 'Contact Info', icon: MessageSquare, hash: 'contact' },
  { id: 'navbar', label: 'Navbar & Footer', icon: Settings2, hash: 'navbar' },
  { id: 'chatbot', label: 'Chatbot', icon: Sparkles, hash: 'chatbot' },
];

export default function AdminSiteConfig() {
  const cms = useCMS();
  const [data, setData] = useState<CMSRecord>(buildDefaultSiteCmsPayload());
  const [activeTab, setActiveTab] = useState<TabId>('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [newTopic, setNewTopic] = useState('');
  const [newKeywords, setNewKeywords] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [posterTab, setPosterTab] = useState<'NEET' | 'KCET' | 'JEE'>('NEET');
  const [initialChatbotIds, setInitialChatbotIds] = useState<string[]>([]);
  const [adminGalleryItems, setAdminGalleryItems] = useState<any[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);

  const loadAdminGallery = useCallback(async () => {
    setGalleryLoading(true);
    try {
      const items = await listGalleryItems(true);
      setAdminGalleryItems(items);
    } catch (err) {
      console.error('Failed to load gallery items:', err);
    } finally {
      setGalleryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'gallery') {
      void loadAdminGallery();
    }
  }, [activeTab, loadAdminGallery]);

  const handleAddGalleryItem = async () => {
    try {
      await createGalleryItem({
        src: '',
        title: '',
        category: 'Campus',
        type: 'image',
        is_active: true,
        sort_order: adminGalleryItems.length + 1,
      });
      await loadAdminGallery();
      await cms.refresh();
      setMessage({ type: 'success', text: 'Gallery item added.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Failed to add gallery item: ' + (err?.message || String(err)) });
    }
  };

  const handleUpdateGalleryItem = async (id: string, updates: Record<string, unknown>) => {
    try {
      await updateGalleryItem(id, updates);
      await loadAdminGallery();
      await cms.refresh();
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Failed to update gallery item: ' + (err?.message || String(err)) });
    }
  };

  const handleDeleteGalleryItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this gallery item?')) return;
    try {
      await deleteGalleryItem(id);
      await loadAdminGallery();
      await cms.refresh();
      setMessage({ type: 'success', text: 'Gallery item deleted.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Failed to delete gallery item: ' + (err?.message || String(err)) });
    }
  };

  const handleReorderGalleryItem = async (index: number, direction: 'up' | 'down') => {
    const items = [...adminGalleryItems];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= items.length) return;
    [items[index], items[swapIndex]] = [items[swapIndex], items[index]];
    const reordered = items.map((item, i) => ({ ...item, sort_order: i + 1 }));
    try {
      await Promise.all(reordered.map((item) => updateGalleryItem(item.id, { sort_order: item.sort_order })));
      await loadAdminGallery();
      await cms.refresh();
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Failed to reorder gallery items: ' + (err?.message || String(err)) });
    }
  };

  const handleGalleryUpload = async (id: string | null, file?: File | null): Promise<string | null> => {
    if (!file) return null;
    setUploading(true);
    const { url, error } = await uploadCmsFile(file, 'gallery');
    setUploading(false);
    if (error) { setMessage({ type: 'error', text: error }); return null; }
    if (id) {
      await handleUpdateGalleryItem(id, { src: url });
    }
    return url;
  };

  const loadCmsData = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const [stored, chatbotResult] = await Promise.all([
        fetchSiteConfig(),
        listChatbotKnowledge().then((data) => ({ data })).catch(() => ({ data: null })),
      ]);

      const merged = mergeStoredCmsWithDefaults(stored);
      const knowledgeRows = (chatbotResult.data as any[]) || [];

      if (knowledgeRows.length) {
        merged.chatbotKnowledge = knowledgeRows.map((row, i) => ({
          id: row.id,
          topic: row.topic,
          keywords: row.keywords || [],
          answer: row.answer,
          category: row.category || 'General',
          is_active: true,
          display_order: row.sort_order ?? i + 1,
        }));
        setInitialChatbotIds(knowledgeRows.map((row) => row.id));
      } else {
        setInitialChatbotIds([]);
      }

      setData(merged);
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Failed to load CMS: ' + (err?.message || String(err)) });
      setData(buildDefaultSiteCmsPayload());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const hash = window.location.hash.replace('#', '') as TabId;
    if (TABS.some((t) => t.id === hash)) setActiveTab(hash);
    const onHash = () => {
      const h = window.location.hash.replace('#', '') as TabId;
      if (TABS.some((t) => t.id === h)) setActiveTab(h);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    void loadCmsData();
  }, [loadCmsData]);

  const setValue = useCallback((path: string, value: any) => {
    setData((d) => setPath(d, path, value));
  }, []);

  const handleUploadImage = async (category: string, file?: File | null): Promise<string | null> => {
    if (!file) return null;
    setUploading(true);
    const { url, error } = await uploadCmsFile(file, category);
    setUploading(false);
    if (error) { setMessage({ type: 'error', text: error }); return null; }
    return url;
  };

  const handleFieldUpload = async (path: string, file?: File | null) => {
    const url = await handleUploadImage(resolveUploadCategory(path), file);
    if (url) { setValue(path, url); setMessage({ type: 'success', text: 'File uploaded successfully.' }); }
  };

  const syncChatbotToDb = async (knowledge: any[]) => {
    const keptIds = await syncChatbotKnowledge(knowledge, initialChatbotIds);
    setInitialChatbotIds(keptIds);
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const { chatbotKnowledge, galleryItems, galleryVideos, ...cmsPayload } = data;
      await upsertSiteConfig(cmsPayload);
      await syncChatbotToDb(Array.isArray(chatbotKnowledge) ? chatbotKnowledge : []);
      await cms.refresh();
      await loadCmsData();
      setMessage({ type: 'success', text: 'All CMS changes saved successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Save failed: ' + (err?.message || String(err)) });
    } finally {
      setSaving(false);
    }
  };

  const heroSlides: CmsHeroSlide[] = data.heroSlides || [];
  const achievementCards: CmsAchievementCard[] = data.achievementCards || [];
  const posterGalleries: Record<'NEET' | 'KCET' | 'JEE', CmsAchievementPoster[]> = data.posterGalleries || { NEET: [], KCET: [], JEE: [] };
  const feeRows: CmsFeeRow[] = data.feeRows || [];
  const faculty: CmsFacultyMember[] = data.faculty || [];
  const navItems: CmsNavItem[] = data.navItems || [];
  const chatbotKnowledge = data.chatbotKnowledge || [];
  const scholarships: { name: string; eligibility: string; discount: string; note?: string }[] = data.scholarships || [];
  const feeNotes: string[] = data.feeNotes || [];

  if (loading) return <div className="p-8 bg-white rounded-2xl border text-center font-semibold">Loading Website CMS...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border shadow-soft">
        <div>
          <p className="text-xs font-bold text-primary-700 uppercase tracking-widest">Website Content Control</p>
          <h2 className="text-2xl font-extrabold text-secondary-900">Website CMS Portal</h2>
        </div>
        <button onClick={handleSaveAll} disabled={saving || uploading} className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-primary text-white font-bold text-sm rounded-xl hover:shadow-glow transition-all disabled:opacity-50">
          <Save size={18} />{saving ? 'Saving...' : 'Save All CMS Changes'}
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl border text-sm font-semibold ${message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <div className="flex flex-wrap gap-2 bg-white p-2 rounded-2xl border shadow-sm">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => { setActiveTab(t.id); window.location.hash = t.hash; }}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl font-bold text-xs transition-all ${activeTab === t.id ? 'bg-primary-900 text-white shadow-sm' : 'text-secondary-600 hover:bg-secondary-100'}`}>
              <Icon size={14} /><span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {activeTab === 'general' && (
        <Section title="Branding, Logo & Contact">
          <div className="grid md:grid-cols-2 gap-4">
            <TextField label="College Full Name" value={data?.siteConfig?.name} onChange={(v) => setValue('siteConfig.name', v)} />
            <TextField label="College Short Name" value={data?.siteConfig?.shortName} onChange={(v) => setValue('siteConfig.shortName', v)} />
            <TextField label="Official Email" value={data?.siteConfig?.email} onChange={(v) => setValue('siteConfig.email', v)} />
            <TextField label="Phone Number" value={data?.siteConfig?.phone} onChange={(v) => setValue('siteConfig.phone', v)} />
            <TextField label="Phone Display Label" value={data?.siteConfig?.phoneDisplay} onChange={(v) => setValue('siteConfig.phoneDisplay', v)} />
            <TextField label="WhatsApp Helpline" value={data?.siteConfig?.whatsapp} onChange={(v) => setValue('siteConfig.whatsapp', v)} />
            <TextField label="Full Physical Address" value={data?.siteConfig?.address?.full} onChange={(v) => setValue('siteConfig.address.full', v)} textarea />
            <TextField label="Google Maps Embed Link" value={data?.siteConfig?.mapsEmbed} onChange={(v) => setValue('siteConfig.mapsEmbed', v)} />
            <TextField label="Facebook URL" value={data?.siteConfig?.social?.facebook} onChange={(v) => setValue('siteConfig.social.facebook', v)} />
            <TextField label="Instagram URL" value={data?.siteConfig?.social?.instagram} onChange={(v) => setValue('siteConfig.social.instagram', v)} />
            <TextField label="YouTube URL" value={data?.siteConfig?.social?.youtube} onChange={(v) => setValue('siteConfig.social.youtube', v)} />
            <TextField label="Office Hours" value={data?.siteConfig?.officeHours || 'Mon–Sat, 9:00 AM – 5:30 PM'} onChange={(v) => setValue('siteConfig.officeHours', v)} />
            <ImageField label="College Official Logo" value={data?.siteConfig?.logo} onUpload={(f) => handleFieldUpload('siteConfig.logo', f)} />
          </div>
        </Section>
      )}

      {activeTab === 'home' && (
        <>
          <Section title="Hero Slides (max 2 displayed)">
            <AddButton label="Add Hero Slide" onClick={() => {
              const slides = [...heroSlides, { id: `hero-${Date.now()}`, src: '', image: '', title: '', alt: '', is_active: true, display_order: heroSlides.length + 1 }];
              setValue('heroSlides', slides);
            }} />
            <div className="space-y-3 mt-4">
              {heroSlides.map((slide, idx) => (
                <div key={slide.id} className="p-4 border rounded-xl grid md:grid-cols-[auto_1fr] gap-3">
                  <ReorderButtons disableUp={idx === 0} disableDown={idx === heroSlides.length - 1}
                    onUp={() => setValue('heroSlides', reorderList(heroSlides, idx, 'up'))}
                    onDown={() => setValue('heroSlides', reorderList(heroSlides, idx, 'down'))} />
                  <div className="grid md:grid-cols-2 gap-3">
                    <TextField label="Title" value={slide.title} onChange={(v) => { const u = [...heroSlides]; u[idx] = { ...u[idx], title: v }; setValue('heroSlides', u); }} />
                    <TextField label="Alt Text" value={slide.alt} onChange={(v) => { const u = [...heroSlides]; u[idx] = { ...u[idx], alt: v }; setValue('heroSlides', u); }} />
                    <ImageField label="Hero Image" value={slide.src} onUpload={async (f) => { const url = await handleUploadImage('hero', f); if (url) { const u = [...heroSlides]; u[idx] = { ...u[idx], src: url, image: url }; setValue('heroSlides', u); } }} />
                    <ToggleField label="Active" checked={slide.is_active !== false} onChange={(v) => { const u = [...heroSlides]; u[idx] = { ...u[idx], is_active: v }; setValue('heroSlides', u); }} />
                    <DeleteButton onClick={() => setValue('heroSlides', heroSlides.filter((_, i) => i !== idx))} />
                  </div>
                </div>
              ))}
            </div>
          </Section>
          <Section title="Home Page Content">
            <div className="grid md:grid-cols-2 gap-4">
              <TextField label="Hero Main Title" value={data?.hero?.title} onChange={(v) => setValue('hero.title', v)} />
              <TextField label="Hero Subtitle" value={data?.hero?.subtitle} onChange={(v) => setValue('hero.subtitle', v)} />
              <TextField label="Hero Badge Text" value={data?.hero?.badge} onChange={(v) => setValue('hero.badge', v)} />
              <TextField label="About Section Title" value={data?.about?.title || data?.about?.pageTitle} onChange={(v) => setValue('about.title', v)} />
              <TextField label="About Content" value={data?.about?.description} onChange={(v) => setValue('about.description', v)} textarea />
            </div>
          </Section>
          <Section title="Admission Enquiry Popup">
            <div className="grid md:grid-cols-2 gap-4">
              <ToggleField label="Popup Enabled" checked={data?.popup?.enabled !== false} onChange={(v) => setValue('popup.enabled', v)} />
              <TextField label="Popup Title" value={data?.popup?.title} onChange={(v) => setValue('popup.title', v)} />
              <TextField label="Popup Subtitle" value={data?.popup?.subtitle} onChange={(v) => setValue('popup.subtitle', v)} />
              <TextField label="Scroll Trigger (%)" value={String(data?.popup?.scrollTriggerPercent ?? 35)} onChange={(v) => setValue('popup.scrollTriggerPercent', Number(v) || 35)} />
              <ImageField label="Popup Logo" value={data?.popup?.logo} onUpload={(f) => handleFieldUpload('popup.logo', f)} />
            </div>
          </Section>
        </>
      )}

      {activeTab === 'about' && (
        <Section title="About College Page">
          <div className="grid md:grid-cols-2 gap-4">
            <TextField label="Page Title" value={data?.about?.pageTitle} onChange={(v) => setValue('about.pageTitle', v)} />
            <TextField label="Subtitle" value={data?.about?.subtitle} onChange={(v) => setValue('about.subtitle', v)} />
            <TextField label="Description" value={data?.about?.description} onChange={(v) => setValue('about.description', v)} textarea />
            <TextField label="College Story" value={data?.about?.story} onChange={(v) => setValue('about.story', v)} textarea />
            <TextField label="Vision" value={data?.visionMission?.vision} onChange={(v) => setValue('visionMission.vision', v)} textarea />
            <TextField label="Mission" value={data?.visionMission?.mission} onChange={(v) => setValue('visionMission.mission', v)} textarea />
            <TextField label="Values" value={data?.visionMission?.values} onChange={(v) => setValue('visionMission.values', v)} />
            <ImageField label="About Page Image" value={data?.about?.image} onUpload={(f) => handleFieldUpload('about.image', f)} />
            <ToggleField label="Page Visible" checked={data?.about?.is_active !== false} onChange={(v) => setValue('about.is_active', v)} />
          </div>
        </Section>
      )}

      {activeTab === 'leadership' && (
        <Section title="Leadership & Faculty">
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            <LeaderEditor title="President / Chairman" prefix="leadership.president" data={data} setValue={setValue} upload={handleFieldUpload} />
            <LeaderEditor title="Principal" prefix="leadership.principal" data={data} setValue={setValue} upload={handleFieldUpload} />
          </div>
          <AddButton label="Add Faculty Member" onClick={() => setValue('faculty', [...faculty, { id: `fac-${Date.now()}`, name: '', designation: '', qualification: '', department: '', bio: '', photo: '', is_active: true, display_order: faculty.length + 1 }])} />
          <div className="space-y-3 mt-4">
            {faculty.map((f, idx) => (
              <div key={f.id} className="p-4 border rounded-xl grid md:grid-cols-2 gap-3">
                <TextField label="Name" value={f.name} onChange={(v) => { const u = [...faculty]; u[idx] = { ...u[idx], name: v }; setValue('faculty', u); }} />
                <TextField label="Designation" value={f.designation} onChange={(v) => { const u = [...faculty]; u[idx] = { ...u[idx], designation: v }; setValue('faculty', u); }} />
                <TextField label="Qualification" value={f.qualification} onChange={(v) => { const u = [...faculty]; u[idx] = { ...u[idx], qualification: v }; setValue('faculty', u); }} />
                <TextField label="Department" value={f.department} onChange={(v) => { const u = [...faculty]; u[idx] = { ...u[idx], department: v }; setValue('faculty', u); }} />
                <TextField label="Bio" value={f.bio} onChange={(v) => { const u = [...faculty]; u[idx] = { ...u[idx], bio: v }; setValue('faculty', u); }} textarea />
                <ImageField label="Photo" value={f.photo} onUpload={async (file) => { const url = await handleUploadImage('faculty', file); if (url) { const u = [...faculty]; u[idx] = { ...u[idx], photo: url }; setValue('faculty', u); } }} />
                <ToggleField label="Active" checked={f.is_active !== false} onChange={(v) => { const u = [...faculty]; u[idx] = { ...u[idx], is_active: v }; setValue('faculty', u); }} />
                <DeleteButton onClick={() => setValue('faculty', faculty.filter((_, i) => i !== idx))} />
              </div>
            ))}
          </div>
        </Section>
      )}

      {activeTab === 'courses' && (
        <Section title="Science Courses (PCMB & PCMC)">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-4 border rounded-xl space-y-3 bg-secondary-50">
              <h4 className="font-bold text-primary-900">PCMB Stream</h4>
              <TextField label="Description" value={data?.coursesConfig?.pcmbDesc} onChange={(v) => setValue('coursesConfig.pcmbDesc', v)} textarea />
              <TextField label="Career Paths" value={data?.coursesConfig?.pcmbCareers} onChange={(v) => setValue('coursesConfig.pcmbCareers', v)} />
            </div>
            <div className="p-4 border rounded-xl space-y-3 bg-secondary-50">
              <h4 className="font-bold text-primary-900">PCMC Stream</h4>
              <TextField label="Description" value={data?.coursesConfig?.pcmcDesc} onChange={(v) => setValue('coursesConfig.pcmcDesc', v)} textarea />
              <TextField label="Career Paths" value={data?.coursesConfig?.pcmcCareers} onChange={(v) => setValue('coursesConfig.pcmcCareers', v)} />
            </div>
          </div>
        </Section>
      )}

      {activeTab === 'fees' && (
        <>
          <Section title="Merit Scholarships & Concessions (2026-27)">
            <p className="text-xs text-secondary-500 mb-4">These values appear on the Home page and Fee Structure page. Do not invent other policies.</p>
            <div className="space-y-4">
              {scholarships.map((sch, idx) => (
                <div key={`sch-${idx}`} className="p-4 border rounded-xl grid md:grid-cols-2 gap-3 bg-secondary-50/50">
                  <TextField label="Tier Name" value={sch.name} onChange={(v) => { const u = [...scholarships]; u[idx] = { ...u[idx], name: v }; setValue('scholarships', u); }} />
                  <TextField label="Benefit / Concession" value={sch.discount} onChange={(v) => { const u = [...scholarships]; u[idx] = { ...u[idx], discount: v }; setValue('scholarships', u); }} />
                  <TextField label="Eligibility" value={sch.eligibility} onChange={(v) => { const u = [...scholarships]; u[idx] = { ...u[idx], eligibility: v }; setValue('scholarships', u); }} textarea />
                  <TextField label="Policy Note" value={sch.note || ''} onChange={(v) => { const u = [...scholarships]; u[idx] = { ...u[idx], note: v }; setValue('scholarships', u); }} />
                  <DeleteButton onClick={() => setValue('scholarships', scholarships.filter((_, i) => i !== idx))} />
                </div>
              ))}
            </div>
            <AddButton label="Add Scholarship Tier" onClick={() => setValue('scholarships', [...scholarships, { name: '', eligibility: '', discount: '', note: 'Subject to college policy and Principal/Management approval.' }])} />
          </Section>
          <Section title="Fee Notes">
            {feeNotes.map((note, idx) => (
              <div key={`note-${idx}`} className="flex gap-2 mb-2">
                <textarea value={note} onChange={(e) => { const u = [...feeNotes]; u[idx] = e.target.value; setValue('feeNotes', u); }} rows={2} className="flex-1 p-2 border rounded-xl text-sm" />
                <DeleteButton onClick={() => setValue('feeNotes', feeNotes.filter((_, i) => i !== idx))} />
              </div>
            ))}
            <AddButton label="Add Fee Note" onClick={() => setValue('feeNotes', [...feeNotes, ''])} />
          </Section>
          <Section title="Fee Rows">
            <AddButton label="Add Fee Row" onClick={() => setValue('feeRows', [...feeRows, { id: `fee-${Date.now()}`, academicYear: '2026-27', course: 'PCMB', feeTitle: '', amount: '', description: '', is_active: true, display_order: feeRows.length + 1 }])} />
            <div className="overflow-auto mt-4">
              <table className="w-full text-sm border">
                <thead className="bg-secondary-50"><tr><th className="p-2">Year</th><th className="p-2">Course</th><th className="p-2">Title</th><th className="p-2">Amount</th><th className="p-2">Active</th><th className="p-2">Actions</th></tr></thead>
                <tbody>
                  {feeRows.map((row, idx) => (
                    <tr key={row.id} className="border-t">
                      <td className="p-2"><input value={row.academicYear} onChange={(e) => { const u = [...feeRows]; u[idx] = { ...u[idx], academicYear: e.target.value }; setValue('feeRows', u); }} className="w-full p-1 border rounded" /></td>
                      <td className="p-2"><select value={row.course} onChange={(e) => { const u = [...feeRows]; u[idx] = { ...u[idx], course: e.target.value }; setValue('feeRows', u); }} className="w-full p-1 border rounded"><option>PCMB</option><option>PCMC</option><option>Both</option></select></td>
                      <td className="p-2"><input value={row.feeTitle} onChange={(e) => { const u = [...feeRows]; u[idx] = { ...u[idx], feeTitle: e.target.value }; setValue('feeRows', u); }} className="w-full p-1 border rounded" /></td>
                      <td className="p-2"><input value={row.amount} onChange={(e) => { const u = [...feeRows]; u[idx] = { ...u[idx], amount: e.target.value }; setValue('feeRows', u); }} className="w-full p-1 border rounded" /></td>
                      <td className="p-2"><input type="checkbox" checked={row.is_active !== false} onChange={(e) => { const u = [...feeRows]; u[idx] = { ...u[idx], is_active: e.target.checked }; setValue('feeRows', u); }} /></td>
                      <td className="p-2"><DeleteButton onClick={() => setValue('feeRows', feeRows.filter((_, i) => i !== idx))} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        </>
      )}

      {activeTab === 'achievements' && (
        <>
          <Section title="ALL Tab — Student Topper Cards (20)">
            <AddButton label="Add Topper Card" onClick={() => setValue('achievementCards', [...achievementCards, { id: `ach-${Date.now()}`, name: '', rank: '', score: '', course: 'PCMB', year: '2026', photo: '', is_active: true, display_order: achievementCards.length + 1 }])} />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
              {achievementCards.map((card, idx) => (
                <div key={card.id} className="p-3 border rounded-xl space-y-2 text-xs">
                  {card.photo && <img src={getMediaUrl(card.photo)} alt="" className="w-full h-24 object-cover rounded-lg" />}
                  <input value={card.name} placeholder="Student Name" onChange={(e) => { const u = [...achievementCards]; u[idx] = { ...u[idx], name: e.target.value }; setValue('achievementCards', u); }} className="w-full p-2 border rounded" />
                  <input value={card.rank} placeholder="Rank" onChange={(e) => { const u = [...achievementCards]; u[idx] = { ...u[idx], rank: e.target.value }; setValue('achievementCards', u); }} className="w-full p-2 border rounded" />
                  <input value={card.score} placeholder="Score" onChange={(e) => { const u = [...achievementCards]; u[idx] = { ...u[idx], score: e.target.value }; setValue('achievementCards', u); }} className="w-full p-2 border rounded" />
                  <select value={card.course} onChange={(e) => { const u = [...achievementCards]; u[idx] = { ...u[idx], course: e.target.value }; setValue('achievementCards', u); }} className="w-full p-2 border rounded"><option>PCMB</option><option>PCMC</option></select>
                  <input type="file" accept="image/*" onChange={async (e) => { const url = await handleUploadImage('achievements', e.target.files?.[0]); if (url) { const u = [...achievementCards]; u[idx] = { ...u[idx], photo: url }; setValue('achievementCards', u); } }} className="text-xs" />
                  <div className="flex justify-between"><ToggleField label="Active" checked={card.is_active !== false} onChange={(v) => { const u = [...achievementCards]; u[idx] = { ...u[idx], is_active: v }; setValue('achievementCards', u); }} /><DeleteButton onClick={() => setValue('achievementCards', achievementCards.filter((_, i) => i !== idx))} /></div>
                </div>
              ))}
            </div>
          </Section>
          <Section title="NEET / KCET / JEE Poster Galleries">
            <div className="flex gap-2 mb-4">{(['NEET', 'KCET', 'JEE'] as const).map((tab) => (
              <button key={tab} onClick={() => setPosterTab(tab)} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${posterTab === tab ? 'bg-primary-900 text-white' : 'bg-secondary-100'}`}>{tab}</button>
            ))}</div>
            <AddButton label={`Add ${posterTab} Poster`} onClick={() => {
              const posters = posterGalleries[posterTab] || [];
              setValue('posterGalleries', { ...posterGalleries, [posterTab]: [...posters, { id: `poster-${Date.now()}`, src: '', title: '', alt: '', year: '2026', is_active: true, display_order: posters.length + 1 }] });
            }} />
            <div className="grid sm:grid-cols-2 gap-3 mt-4">
              {(posterGalleries[posterTab] || []).map((poster, idx) => (
                <div key={poster.id} className="p-3 border rounded-xl space-y-2">
                  {poster.src && <img src={getMediaUrl(poster.src)} alt="" className="w-full h-32 object-contain bg-secondary-50 rounded" />}
                  <input value={poster.title} placeholder="Title" onChange={(e) => { const list = [...(posterGalleries[posterTab] || [])]; list[idx] = { ...list[idx], title: e.target.value }; setValue('posterGalleries', { ...posterGalleries, [posterTab]: list }); }} className="w-full p-2 border rounded text-xs" />
                  <input value={poster.year || ''} placeholder="Year" onChange={(e) => { const list = [...(posterGalleries[posterTab] || [])]; list[idx] = { ...list[idx], year: e.target.value }; setValue('posterGalleries', { ...posterGalleries, [posterTab]: list }); }} className="w-full p-2 border rounded text-xs" />
                  <input type="file" accept="image/*" onChange={async (e) => { const url = await handleUploadImage(`posters-${posterTab}`, e.target.files?.[0]); if (url) { const list = [...(posterGalleries[posterTab] || [])]; list[idx] = { ...list[idx], src: url, alt: list[idx].title || posterTab }; setValue('posterGalleries', { ...posterGalleries, [posterTab]: list }); } }} className="text-xs" />
                  <DeleteButton onClick={() => setValue('posterGalleries', { ...posterGalleries, [posterTab]: (posterGalleries[posterTab] || []).filter((_, i) => i !== idx) })} />
                </div>
              ))}
            </div>
          </Section>
        </>
      )}

      {activeTab === 'gallery' && (
        <Section title="Gallery — Images & Videos">
          {galleryLoading ? (
            <div className="text-center py-8 text-sm text-secondary-500 font-medium">Loading gallery items...</div>
          ) : (
            <>
              <AddButton label="Add Gallery Item" onClick={handleAddGalleryItem} />
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                {adminGalleryItems.map((item, idx) => (
                  <div key={item.id} className="p-3 border rounded-xl space-y-2">
                    {item.src && item.type === 'image' && <img src={getMediaUrl(item.src)} alt="" className="w-full h-24 object-cover rounded" />}
                    {item.type === 'video' && item.src && <video src={getMediaUrl(item.src)} poster={getMediaUrl(item.poster)} className="w-full h-24 object-cover rounded" controls preload="none" />}
                    <input value={item.title} placeholder="Title" onChange={(e) => { const u = [...adminGalleryItems]; u[idx] = { ...u[idx], title: e.target.value }; setAdminGalleryItems(u); }} onBlur={(e) => handleUpdateGalleryItem(item.id, { title: e.target.value })} className="w-full p-2 border rounded text-xs" />
                    <select value={item.category} onChange={(e) => handleUpdateGalleryItem(item.id, { category: e.target.value })} className="w-full p-2 border rounded text-xs"><option>Campus</option><option>Laboratories</option><option>Classrooms</option><option>Library</option><option>Events</option><option>Videos</option></select>
                    <select value={item.type} onChange={(e) => handleUpdateGalleryItem(item.id, { type: e.target.value })} className="w-full p-2 border rounded text-xs"><option value="image">Image</option><option value="video">Video</option></select>
                    {item.type === 'image' ? (
                      <div className="space-y-2">
                        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={async (e) => { const url = await handleGalleryUpload(item.id, e.target.files?.[0]); if (url) { const u = [...adminGalleryItems]; u[idx] = { ...u[idx], src: url }; setAdminGalleryItems(u); } }} className="text-xs" />
                        <input value={item.src} placeholder="Image URL" onChange={(e) => { const u = [...adminGalleryItems]; u[idx] = { ...u[idx], src: e.target.value }; setAdminGalleryItems(u); }} onBlur={(e) => handleUpdateGalleryItem(item.id, { src: e.target.value })} className="w-full p-2 border rounded text-xs" />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <input value={item.src} placeholder="Video URL" onChange={(e) => { const u = [...adminGalleryItems]; u[idx] = { ...u[idx], src: e.target.value }; setAdminGalleryItems(u); }} onBlur={(e) => handleUpdateGalleryItem(item.id, { src: e.target.value })} className="w-full p-2 border rounded text-xs" />
                        <input type="file" accept="video/mp4,video/webm" onChange={async (e) => { const url = await handleGalleryUpload(item.id, e.target.files?.[0]); if (url) { const u = [...adminGalleryItems]; u[idx] = { ...u[idx], src: url, type: 'video' }; setAdminGalleryItems(u); } }} className="text-xs" />
                        <input value={item.poster || ''} placeholder="Poster URL" onChange={(e) => { const u = [...adminGalleryItems]; u[idx] = { ...u[idx], poster: e.target.value }; setAdminGalleryItems(u); }} onBlur={(e) => handleUpdateGalleryItem(item.id, { poster: e.target.value })} className="w-full p-2 border rounded text-xs" />
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <ToggleField label="Active" checked={item.is_active !== false} onChange={(v) => handleUpdateGalleryItem(item.id, { is_active: v })} />
                      <DeleteButton onClick={() => handleDeleteGalleryItem(item.id)} />
                    </div>
                    <div className="flex items-center gap-2">
                      <ReorderButtons disableUp={idx === 0} disableDown={idx === adminGalleryItems.length - 1}
                        onUp={() => handleReorderGalleryItem(idx, 'up')}
                        onDown={() => handleReorderGalleryItem(idx, 'down')} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </Section>
      )}

      {activeTab === 'transport' && (
        <Section title="Transport">
          <div className="grid md:grid-cols-2 gap-4">
            <TextField label="Title" value={data?.transport?.title} onChange={(v) => setValue('transport.title', v)} />
            <TextField label="Contact" value={data?.transport?.contact} onChange={(v) => setValue('transport.contact', v)} />
            <TextField label="Description" value={data?.transport?.description} onChange={(v) => setValue('transport.description', v)} textarea />
            <TextField label="Routes" value={data?.transport?.routes} onChange={(v) => setValue('transport.routes', v)} textarea />
            <TextField label="Timings" value={data?.transport?.timings} onChange={(v) => setValue('transport.timings', v)} />
            <ToggleField label="Active" checked={data?.transport?.is_active !== false} onChange={(v) => setValue('transport.is_active', v)} />
          </div>
        </Section>
      )}

      {activeTab === 'hostel' && (
        <Section title="Hostel">
          <div className="grid md:grid-cols-2 gap-4">
            <TextField label="Title" value={data?.hostel?.title} onChange={(v) => setValue('hostel.title', v)} />
            <TextField label="Contact" value={data?.hostel?.contact} onChange={(v) => setValue('hostel.contact', v)} />
            <TextField label="Description" value={data?.hostel?.description} onChange={(v) => setValue('hostel.description', v)} textarea />
            <TextField label="Facilities" value={data?.hostel?.facilities} onChange={(v) => setValue('hostel.facilities', v)} textarea />
            <TextField label="Rules" value={data?.hostel?.rules} onChange={(v) => setValue('hostel.rules', v)} textarea />
            <ToggleField label="Active" checked={data?.hostel?.is_active !== false} onChange={(v) => setValue('hostel.is_active', v)} />
          </div>
        </Section>
      )}

      {activeTab === 'pamphlet' && (
        <Section title="College Pamphlet">
          <div className="grid md:grid-cols-2 gap-6">
            <ImageField label="Front Side Image" value={data?.pamphlet?.frontImage} onUpload={(f) => handleFieldUpload('pamphlet.frontImage', f)} />
            <ImageField label="Back Side Image" value={data?.pamphlet?.backImage} onUpload={(f) => handleFieldUpload('pamphlet.backImage', f)} />
            <label className="block">
              <span className="text-xs font-bold uppercase text-secondary-700">Upload PDF Pamphlet</span>
              <input type="file" accept="application/pdf" onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setUploading(true);
                const { url, error } = await uploadCmsPdf(file, 'pamphlet');
                setUploading(false);
                if (url) { setValue('pamphlet.pdfUrl', url); setMessage({ type: 'success', text: 'Pamphlet PDF uploaded.' }); }
                else setMessage({ type: 'error', text: error || 'Upload failed' });
              }} className="mt-2 text-xs" />
            </label>
            {data?.pamphlet?.pdfUrl && <a href={data.pamphlet.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-primary-700 underline text-sm">Preview / Download Active Pamphlet</a>}
            <ToggleField label="Pamphlet Active" checked={data?.pamphlet?.is_active !== false} onChange={(v) => setValue('pamphlet.is_active', v)} />
          </div>
        </Section>
      )}

      {activeTab === 'contact' && (
        <Section title="Contact Information (used in Navbar, Footer & Contact page)">
          <p className="text-xs text-secondary-500 mb-2">Edit contact details in the Branding & Contact tab. This section controls footer description and copyright.</p>
          <div className="grid md:grid-cols-2 gap-4">
            <TextField label="Footer Description" value={data?.footer?.text} onChange={(v) => setValue('footer.text', v)} textarea />
            <TextField label="Copyright Text" value={data?.footer?.copyright} onChange={(v) => setValue('footer.copyright', v)} />
          </div>
        </Section>
      )}

      {activeTab === 'navbar' && (
        <Section title="Navbar & Footer Navigation">
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <TextField label="Navbar CTA Text" value={data?.navbar?.ctaText} onChange={(v) => setValue('navbar.ctaText', v)} />
            <TextField label="Navbar CTA Link" value={data?.navbar?.ctaLink} onChange={(v) => setValue('navbar.ctaLink', v)} />
          </div>
          <h4 className="font-bold text-sm mb-2">Navigation Items</h4>
          {navItems.map((item, idx) => (
            <div key={`${item.path}-${idx}`} className="flex flex-wrap gap-2 items-center p-2 border rounded-lg mb-2">
              <input value={item.label} onChange={(e) => { const u = [...navItems]; u[idx] = { ...u[idx], label: e.target.value }; setValue('navItems', u); }} className="p-2 border rounded flex-1 min-w-[120px]" placeholder="Label" />
              <input value={item.path} onChange={(e) => { const u = [...navItems]; u[idx] = { ...u[idx], path: e.target.value }; setValue('navItems', u); }} className="p-2 border rounded flex-1 min-w-[120px]" placeholder="Path" />
              <ToggleField label="Visible" checked={item.is_active !== false} onChange={(v) => { const u = [...navItems]; u[idx] = { ...u[idx], is_active: v }; setValue('navItems', u); }} />
            </div>
          ))}
        </Section>
      )}

      {activeTab === 'chatbot' && (
        <Section title="Chatbot Knowledge Base">
          <TextField label="Welcome Message" value={data?.chatbot?.welcomeMessage} onChange={(v) => setValue('chatbot.welcomeMessage', v)} textarea />
          <div className="p-4 bg-secondary-50 rounded-2xl border space-y-3 mt-4">
            <h4 className="font-bold text-sm">Add FAQ Entry</h4>
            <input value={newTopic} onChange={(e) => setNewTopic(e.target.value)} placeholder="Topic" className="p-2.5 border rounded-xl text-xs w-full" />
            <input value={newKeywords} onChange={(e) => setNewKeywords(e.target.value)} placeholder="Keywords (comma separated)" className="p-2.5 border rounded-xl text-xs w-full" />
            <textarea value={newAnswer} onChange={(e) => setNewAnswer(e.target.value)} placeholder="Answer" rows={3} className="w-full p-2.5 border rounded-xl text-xs" />
            <AddButton label="Add Knowledge Item" onClick={() => {
              if (!newTopic.trim() || !newAnswer.trim()) { setMessage({ type: 'error', text: 'Topic and Answer required.' }); return; }
              const item = { id: `kb-${Date.now()}`, topic: newTopic.trim(), keywords: newKeywords.split(',').map((k) => k.trim()).filter(Boolean), answer: newAnswer.trim(), category: 'General', is_active: true, display_order: chatbotKnowledge.length + 1 };
              setValue('chatbotKnowledge', [item, ...chatbotKnowledge]);
              setNewTopic(''); setNewKeywords(''); setNewAnswer('');
            }} />
          </div>
          <div className="space-y-3 mt-4">
            {chatbotKnowledge.map((item: any, idx: number) => (
              <div key={item.id} className="p-4 border rounded-xl space-y-2">
                <div className="flex justify-between"><strong className="text-sm">{item.topic}</strong><DeleteButton onClick={() => setValue('chatbotKnowledge', chatbotKnowledge.filter((_: any, i: number) => i !== idx))} /></div>
                <p className="text-xs text-secondary-500">Keywords: {(item.keywords || []).join(', ')}</p>
                <p className="text-xs bg-secondary-50 p-2 rounded">{item.answer}</p>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
