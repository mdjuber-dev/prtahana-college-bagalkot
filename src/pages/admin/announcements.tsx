import { useEffect, useState } from 'react';
import {
  Megaphone, Plus, Search, Filter, Eye, Edit3, Trash2, CheckCircle2,
  AlertCircle, Star, Calendar, MapPin, Link2, Upload, Loader2, X, RefreshCw,
  Tag
} from 'lucide-react';
import { Announcement, AnnouncementCategory, AnnouncementStatus } from '@/lib/announcement-types';
import { createAnnouncement, deleteAnnouncement, listAnnouncements, updateAnnouncement, uploadFile } from '@/lib/api';
import { getMediaUrl } from '@/lib/media-url';

const CATEGORIES: AnnouncementCategory[] = [
  'General Announcement',
  'Event',
  'Admission',
  'Exam',
  'Holiday',
  'Achievement',
  'Notice',
  'Important',
];

interface FormState {
  title: string;
  short_description: string;
  full_description: string;
  category: AnnouncementCategory;
  event_date: string;
  start_date: string;
  end_date: string;
  event_time: string;
  venue: string;
  image_url: string;
  attachment_url: string;
  cta_text: string;
  cta_url: string;
  status: AnnouncementStatus;
  is_featured: boolean;
  priority: number;
}

const emptyFormState: FormState = {
  title: '',
  short_description: '',
  full_description: '',
  category: 'General Announcement',
  event_date: '',
  start_date: '',
  end_date: '',
  event_time: '',
  venue: '',
  image_url: '',
  attachment_url: '',
  cta_text: '',
  cta_url: '',
  status: 'published',
  is_featured: false,
  priority: 0,
};

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'priority'>('priority');

  // Modals & Active state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Announcement | null>(null);
  const [previewItem, setPreviewItem] = useState<Announcement | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form handling
  const [form, setForm] = useState<FormState>(emptyFormState);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchItems = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const data = await listAnnouncements(true);
      setAnnouncements(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch announcements');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleOpenCreate = () => {
    setEditingItem(null);
    setForm(emptyFormState);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Announcement) => {
    setEditingItem(item);
    setForm({
      title: item.title || '',
      short_description: item.short_description || '',
      full_description: item.full_description || '',
      category: item.category || 'General Announcement',
      event_date: item.event_date ? item.event_date.split('T')[0] : '',
      start_date: item.start_date ? item.start_date.split('T')[0] : '',
      end_date: item.end_date ? item.end_date.split('T')[0] : '',
      event_time: item.event_time || '',
      venue: item.venue || '',
      image_url: item.image_url || '',
      attachment_url: item.attachment_url || '',
      cta_text: item.cta_text || '',
      cta_url: item.cta_url || '',
      status: item.status || 'published',
      is_featured: item.is_featured || false,
      priority: item.priority || 0,
    });
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImg(true);
    try {
      const url = await uploadFile(file, 'announcements');
      setForm((prev) => ({ ...prev, image_url: url }));
      showNotification('success', 'Banner image uploaded successfully!');
    } catch (err) {
      showNotification('error', 'Failed to upload image. ' + (err instanceof Error ? err.message : ''));
    } finally {
      setUploadingImg(false);
    }
  };

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingDoc(true);
    try {
      const url = await uploadFile(file, 'documents');
      setForm((prev) => ({ ...prev, attachment_url: url }));
      showNotification('success', 'Attachment file uploaded successfully!');
    } catch (err) {
      showNotification('error', 'Failed to upload document. ' + (err instanceof Error ? err.message : ''));
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      showNotification('error', 'Announcement Title is required');
      return;
    }

    setSubmitting(true);
    try {
      const payload = form as unknown as Record<string, unknown>;
      if (editingItem) {
        await updateAnnouncement(editingItem.id, payload);
        showNotification('success', 'Announcement updated successfully');
      } else {
        await createAnnouncement(payload);
        showNotification('success', 'New announcement published/created');
      }
      setIsModalOpen(false);
      fetchItems(true);
    } catch (err) {
      showNotification('error', err instanceof Error ? err.message : 'Failed to save announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (item: Announcement) => {
    const newStatus: AnnouncementStatus = item.status === 'published' ? 'draft' : 'published';
    try {
      await updateAnnouncement(item.id, { status: newStatus });
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === item.id ? { ...a, status: newStatus } : a))
      );
      showNotification('success', `Status changed to ${newStatus}`);
    } catch (err) {
      showNotification('error', 'Failed to toggle status');
    }
  };

  const handleToggleFeatured = async (item: Announcement) => {
    const newFeatured = !item.is_featured;
    try {
      await updateAnnouncement(item.id, { is_featured: newFeatured });
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === item.id ? { ...a, is_featured: newFeatured } : a))
      );
      showNotification('success', newFeatured ? 'Marked as Featured' : 'Removed from Featured');
    } catch (err) {
      showNotification('error', 'Failed to update featured flag');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAnnouncement(id);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      showNotification('success', 'Announcement deleted successfully');
      setDeletingId(null);
    } catch (err) {
      showNotification('error', 'Failed to delete announcement');
    }
  };

  // Filtered & Sorted items
  const filteredItems = announcements
    .filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        (item.short_description || '').toLowerCase().includes(search.toLowerCase()) ||
        (item.venue || '').toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      if (sortOrder === 'priority') {
        if (b.priority !== a.priority) return b.priority - a.priority;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortOrder === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });

  // Stats calculation
  const totalCount = announcements.length;
  const publishedCount = announcements.filter((a) => a.status === 'published').length;
  const draftCount = announcements.filter((a) => a.status === 'draft').length;
  const featuredCount = announcements.filter((a) => a.is_featured).length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-sm font-semibold border ${
            notification.type === 'success'
              ? 'bg-emerald-600 text-white border-emerald-500'
              : 'bg-rose-600 text-white border-rose-500'
          }`}
        >
          {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-secondary-900 via-secondary-800 to-primary-950 p-6 md:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 border border-secondary-700/60">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/20 border border-primary-400/30 text-primary-300 text-xs font-bold uppercase tracking-wider mb-3">
            <Megaphone size={14} /> Institutional CMS
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Announcements & Events CMS
          </h1>
          <p className="text-secondary-300 text-sm mt-1.5 leading-relaxed">
            Manage college notices, upcoming events, entrance exam alerts, holidays, and featured campus updates in real-time.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 shrink-0">
          <button
            onClick={() => fetchItems(true)}
            disabled={refreshing}
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md border border-white/10"
            title="Refresh Data"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleOpenCreate}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white font-bold text-sm shadow-lg shadow-accent-600/30 transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={18} />
            <span>Create Announcement</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
            <Megaphone size={22} />
          </div>
          <div>
            <span className="text-2xl font-black text-secondary-900 leading-none">{totalCount}</span>
            <p className="text-xs font-semibold text-secondary-500 mt-1">Total Items</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <span className="text-2xl font-black text-emerald-600 leading-none">{publishedCount}</span>
            <p className="text-xs font-semibold text-secondary-500 mt-1">Published</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Edit3 size={22} />
          </div>
          <div>
            <span className="text-2xl font-black text-amber-600 leading-none">{draftCount}</span>
            <p className="text-xs font-semibold text-secondary-500 mt-1">Drafts</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Star size={22} />
          </div>
          <div>
            <span className="text-2xl font-black text-indigo-600 leading-none">{featuredCount}</span>
            <p className="text-xs font-semibold text-secondary-500 mt-1">Featured Popups</p>
          </div>
        </div>
      </div>

      {/* Filter & Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, description, or venue..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder-secondary-400"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-secondary-500 font-semibold">
            <Filter size={14} /> Filter:
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-secondary-700 focus:outline-none focus:border-primary-500"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-secondary-700 focus:outline-none focus:border-primary-500"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
            <option value="archived">Archived</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-secondary-700 focus:outline-none focus:border-primary-500"
          >
            <option value="priority">Sort: Highest Priority</option>
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
          </select>
        </div>
      </div>

      {/* Main Table / Data View */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-secondary-400 space-y-3">
            <Loader2 size={32} className="animate-spin mx-auto text-primary-600" />
            <p className="text-xs font-semibold">Loading announcements database...</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center text-rose-600 space-y-3">
            <AlertCircle size={36} className="mx-auto" />
            <p className="text-sm font-bold">{error}</p>
            <button
              onClick={() => fetchItems()}
              className="px-4 py-2 bg-slate-100 text-secondary-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition-colors"
            >
              Retry Loading
            </button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-20 text-center text-secondary-500 space-y-3">
            <Megaphone size={40} className="mx-auto text-secondary-300 stroke-1" />
            <h3 className="text-base font-bold text-secondary-800">No Announcements Found</h3>
            <p className="text-xs text-secondary-500 max-w-sm mx-auto">
              {search || categoryFilter !== 'all' || statusFilter !== 'all'
                ? 'No items match your current filter criteria. Try resetting search or category filters.'
                : 'Click "Create Announcement" above to add your first college notice or event.'}
            </p>
            {search && (
              <button
                onClick={() => {
                  setSearch('');
                  setCategoryFilter('all');
                  setStatusFilter('all');
                }}
                className="px-4 py-2 bg-primary-50 text-primary-700 text-xs font-bold rounded-xl hover:bg-primary-100 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-secondary-500">
                  <th className="py-4 px-6">Announcement Title</th>
                  <th className="py-4 px-4">Category</th>
                  <th className="py-4 px-4">Event Date / Venue</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4 text-center">Featured</th>
                  <th className="py-4 px-4 text-center">Priority</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors group">
                    {/* Title + Short Desc */}
                    <td className="py-4 px-6 max-w-xs md:max-w-md">
                      <div className="flex items-start gap-3">
                        {item.image_url && getMediaUrl(item.image_url) ? (
                          <img
                            src={getMediaUrl(item.image_url)}
                            alt=""
                            className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-200 shadow-xs"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-secondary-100 text-secondary-500 flex items-center justify-center shrink-0 font-bold text-sm">
                            <Tag size={16} />
                          </div>
                        )}
                        <div className="min-w-0">
                          <span className="block font-bold text-secondary-900 text-sm group-hover:text-primary-600 transition-colors truncate">
                            {item.title}
                          </span>
                          {item.short_description && (
                            <p className="text-secondary-500 text-xs line-clamp-1 mt-0.5">
                              {item.short_description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category Badge */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 text-secondary-700 border border-slate-200">
                        {item.category}
                      </span>
                    </td>

                    {/* Event Date / Venue */}
                    <td className="py-4 px-4 whitespace-nowrap text-secondary-600">
                      {item.event_date ? (
                        <div className="flex items-center gap-1.5 font-medium text-secondary-800">
                          <Calendar size={13} className="text-primary-600 shrink-0" />
                          <span>{new Date(item.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      ) : (
                        <span className="text-secondary-400 font-normal">No specific date</span>
                      )}
                      {item.venue && (
                        <div className="flex items-center gap-1 text-[11px] text-secondary-400 mt-0.5 truncate max-w-[150px]">
                          <MapPin size={11} className="shrink-0" />
                          <span className="truncate">{item.venue}</span>
                        </div>
                      )}
                    </td>

                    {/* Status Badge & Toggle */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(item)}
                        className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-all inline-flex items-center gap-1.5 ${
                          item.status === 'published'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : item.status === 'draft'
                            ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                            : 'bg-slate-100 text-secondary-600 border-slate-200 hover:bg-slate-200'
                        }`}
                        title="Click to toggle publish status"
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.status === 'published' ? 'bg-emerald-500' : item.status === 'draft' ? 'bg-amber-500' : 'bg-secondary-400'
                          }`}
                        />
                        <span className="capitalize">{item.status}</span>
                      </button>
                    </td>

                    {/* Featured Toggle */}
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleToggleFeatured(item)}
                        className={`p-1.5 rounded-xl transition-all ${
                          item.is_featured
                            ? 'bg-amber-100 text-amber-600 hover:bg-amber-200 shadow-xs'
                            : 'text-slate-300 hover:text-amber-500 hover:bg-slate-100'
                        }`}
                        title={item.is_featured ? 'Featured on Homepage Popup (Click to remove)' : 'Click to Feature on Homepage Popup'}
                      >
                        <Star size={18} className={item.is_featured ? 'fill-amber-500' : ''} />
                      </button>
                    </td>

                    {/* Priority Order */}
                    <td className="py-4 px-4 text-center font-bold text-secondary-700 whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 bg-slate-100 rounded-md text-xs border border-slate-200 font-mono">
                        {item.priority}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setPreviewItem(item)}
                          className="p-2 rounded-xl text-secondary-500 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                          title="Preview Announcement"
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-2 rounded-xl text-secondary-500 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                          title="Edit Announcement"
                        >
                          <Edit3 size={16} />
                        </button>

                        <button
                          onClick={() => setDeletingId(item.id)}
                          className="p-2 rounded-xl text-secondary-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Announcement"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden my-auto border border-slate-200">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-secondary-900 to-secondary-800 text-white flex items-center justify-between">
              <div>
                <span className="text-xs text-primary-400 font-bold uppercase tracking-wider">
                  {editingItem ? 'Edit Item' : 'New Publishing Entry'}
                </span>
                <h2 className="text-xl font-black text-white">
                  {editingItem ? 'Edit Announcement' : 'Create New Announcement'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-secondary-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitForm} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {/* Section 1: Basic Information */}
              <div className="space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-primary-700 flex items-center gap-1.5 pb-1 border-b border-slate-100">
                  <Tag size={14} /> Section 1: Basic Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-secondary-700 mb-1">
                      Announcement Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="e.g. Admissions Open 2026-27 or Annual Sports Day"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-secondary-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-secondary-700 mb-1">Category</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value as AnnouncementCategory })}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-secondary-800 bg-white focus:border-primary-500"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-secondary-700 mb-1">Short Description (Summary for cards & popup)</label>
                  <textarea
                    rows={2}
                    value={form.short_description}
                    onChange={(e) => setForm({ ...form, short_description: e.target.value })}
                    placeholder="Brief 1-2 sentence overview to show on initial popup modal and card previews..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-secondary-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-secondary-700 mb-1">Full Detailed Description</label>
                  <textarea
                    rows={4}
                    value={form.full_description}
                    onChange={(e) => setForm({ ...form, full_description: e.target.value })}
                    placeholder="Complete detailed announcement content for the full detail page..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-secondary-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Section 2: Schedule & Location */}
              <div className="space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-primary-700 flex items-center gap-1.5 pb-1 border-b border-slate-100">
                  <Calendar size={14} /> Section 2: Schedule & Location Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-secondary-700 mb-1">Event / Target Date</label>
                    <input
                      type="date"
                      value={form.event_date}
                      onChange={(e) => setForm({ ...form, event_date: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-secondary-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-secondary-700 mb-1">Start Date (Optional)</label>
                    <input
                      type="date"
                      value={form.start_date}
                      onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-secondary-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-secondary-700 mb-1">End Date (Optional)</label>
                    <input
                      type="date"
                      value={form.end_date}
                      onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-secondary-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-secondary-700 mb-1">Event Time (Optional)</label>
                    <input
                      type="text"
                      value={form.event_time}
                      onChange={(e) => setForm({ ...form, event_time: e.target.value })}
                      placeholder="e.g. 10:00 AM IST onwards"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-secondary-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-secondary-700 mb-1">Venue / Location (Optional)</label>
                    <input
                      type="text"
                      value={form.venue}
                      onChange={(e) => setForm({ ...form, venue: e.target.value })}
                      placeholder="e.g. Main Auditorium, Bagalkot Campus"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-secondary-900"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Media & Attachments */}
              <div className="space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-primary-700 flex items-center gap-1.5 pb-1 border-b border-slate-100">
                  <Upload size={14} /> Section 3: Banner Image & File Attachments
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Image Upload */}
                  <div>
                    <label className="block text-xs font-bold text-secondary-700 mb-1">Banner Image URL</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={form.image_url}
                        onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                        placeholder="https://... or upload file"
                        className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-secondary-900"
                      />
                      <label className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-secondary-700 font-bold text-xs rounded-xl cursor-pointer transition-colors flex items-center gap-1 shrink-0">
                        {uploadingImg ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                        <span>Upload</span>
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                    </div>
                    {form.image_url && getMediaUrl(form.image_url) && (
                      <div className="mt-2 relative rounded-xl overflow-hidden h-24 border border-slate-200">
                        <img src={getMediaUrl(form.image_url)} alt="Banner Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  {/* Attachment Upload */}
                  <div>
                    <label className="block text-xs font-bold text-secondary-700 mb-1">Document Attachment URL (PDF/Doc)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={form.attachment_url}
                        onChange={(e) => setForm({ ...form, attachment_url: e.target.value })}
                        placeholder="PDF document link..."
                        className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-secondary-900"
                      />
                      <label className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-secondary-700 font-bold text-xs rounded-xl cursor-pointer transition-colors flex items-center gap-1 shrink-0">
                        {uploadingDoc ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                        <span>Upload</span>
                        <input type="file" accept=".pdf,.doc,.docx" onChange={handleDocUpload} className="hidden" />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4: Publishing & Priority */}
              <div className="space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-primary-700 flex items-center gap-1.5 pb-1 border-b border-slate-100">
                  <Star size={14} /> Section 4: Publishing Status & Priority
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <div>
                    <label className="block text-xs font-bold text-secondary-700 mb-1">Publishing Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value as AnnouncementStatus })}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-secondary-900 bg-white"
                    >
                      <option value="published">Published (Live on Public Site)</option>
                      <option value="draft">Draft (Admin Only)</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-secondary-700 mb-1">Display Priority Number</label>
                    <input
                      type="number"
                      value={form.priority}
                      onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold text-secondary-900"
                    />
                    <span className="text-[10px] text-secondary-400 mt-1 block">Higher number appears first</span>
                  </div>

                  <div className="pt-3">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.is_featured}
                        onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                        className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-xs font-bold text-secondary-800">
                        Show in Homepage Popup Modal ⭐
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Section 5: Call to Action */}
              <div className="space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-primary-700 flex items-center gap-1.5 pb-1 border-b border-slate-100">
                  <Link2 size={14} /> Section 5: Call to Action (CTA Button)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-secondary-700 mb-1">CTA Button Text (Optional)</label>
                    <input
                      type="text"
                      value={form.cta_text}
                      onChange={(e) => setForm({ ...form, cta_text: e.target.value })}
                      placeholder="e.g. Apply Now, View Timetable, Download PDF"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-secondary-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-secondary-700 mb-1">CTA Target URL (Optional)</label>
                    <input
                      type="text"
                      value={form.cta_url}
                      onChange={(e) => setForm({ ...form, cta_url: e.target.value })}
                      placeholder="e.g. /admission or https://..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-secondary-900"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-secondary-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-md shadow-primary-700/20 transition-all flex items-center gap-2"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                  <span>{editingItem ? 'Save Changes' : 'Publish Announcement'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="bg-gradient-to-r from-primary-900 to-primary-950 p-6 text-white relative">
              <button
                onClick={() => setPreviewItem(null)}
                className="absolute top-4 right-4 text-white/70 hover:text-white p-1 rounded-lg"
              >
                <X size={20} />
              </button>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-accent-500 text-white uppercase tracking-wider">
                {previewItem.category}
              </span>
              <h3 className="text-xl font-extrabold text-white mt-2 leading-snug">{previewItem.title}</h3>
              {previewItem.event_date && (
                <p className="text-xs text-primary-200 mt-1 flex items-center gap-1">
                  <Calendar size={13} /> {new Date(previewItem.event_date).toLocaleDateString()}
                </p>
              )}
            </div>
            <div className="p-6 space-y-4">
              {previewItem.image_url && getMediaUrl(previewItem.image_url) && (
                <img src={getMediaUrl(previewItem.image_url)} alt="" className="w-full h-44 object-cover rounded-2xl border" />
              )}
              <p className="text-xs font-semibold text-secondary-800 leading-relaxed">
                {previewItem.short_description || previewItem.full_description}
              </p>
              {previewItem.venue && (
                <p className="text-xs text-secondary-500 flex items-center gap-1.5">
                  <MapPin size={14} className="text-primary-600" /> Venue: {previewItem.venue}
                </p>
              )}
              {previewItem.cta_text && (
                <a
                  href={previewItem.cta_url || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="block w-full text-center py-2.5 bg-gradient-accent text-white text-xs font-bold rounded-xl shadow-md"
                >
                  {previewItem.cta_text} →
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 size={28} />
            </div>
            <h3 className="text-lg font-extrabold text-secondary-900">Delete Announcement?</h3>
            <p className="text-xs text-secondary-500">
              Are you sure you want to permanently delete this announcement? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 bg-slate-100 text-secondary-700 text-xs font-bold rounded-xl hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                className="px-5 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl hover:bg-rose-700 shadow-md shadow-rose-600/30"
              >
                Delete Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
