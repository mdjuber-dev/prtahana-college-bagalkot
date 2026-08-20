import { useState, useEffect } from 'react';
import { uploadFile, listMediaAssets, deleteMediaAsset, replaceMediaAsset } from '@/lib/api';
import { Upload, Copy, Check, FileText, Search, ExternalLink, Trash2, RefreshCw, GalleryHorizontal } from 'lucide-react';
import { getMediaUrl } from '@/lib/media-url';
import AdminPageHeader from '@/components/admin/ui/AdminPageHeader';

interface MediaItem {
  id: string;
  name: string;
  url: string;
  category: string;
  uploadedAt: string;
}

export default function AdminMediaLibrary() {
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [items, setItems] = useState<MediaItem[]>([]);

  const loadMedia = async () => {
    setLoading(true);
    try {
      const media = await listMediaAssets(category);
      setItems(media);
    } catch (err) {
      console.error('Failed to load media assets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadMedia();
  }, [category]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        await uploadFile(files[i], category === 'all' ? 'misc' : category);
      }
      await loadMedia();
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Upload failed. Please check file size and format.');
    } finally {
      setUploading(false);
    }
  };

  const handleCopy = (id: string, path: string) => {
    const fullUrl = getMediaUrl(path);
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) return;
    try {
      await deleteMediaAsset(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert('Failed to delete asset: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleReplace = async (id: string, file: File) => {
    try {
      const updated = await replaceMediaAsset(id, file);
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updated } : item)));
    } catch (err) {
      alert('Failed to replace asset: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const filtered = items.filter((item) => {
    const matchesCategory = category === 'all' || item.category.toLowerCase() === category.toLowerCase();
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Institutional Media Library"
        subtitle="Upload, organize, replace, and manage persistent database-stored assets for the public website."
        icon={GalleryHorizontal}
        badge="Asset Repository"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => void loadMedia()}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all backdrop-blur-md border border-white/10 flex items-center gap-2"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
            <label className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer">
              <Upload size={14} />
              <span>{uploading ? 'Uploading...' : 'Upload Media Asset'}</span>
              <input type="file" multiple onChange={handleUpload} disabled={uploading} className="hidden" />
            </label>
          </div>
        }
      />

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          {['all', 'gallery', 'homepage', 'courses', 'achievements', 'documents', 'career-applications', 'misc'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-all ${
                category === cat
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'bg-slate-100 text-secondary-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary-400" />
          <input
            type="text"
            placeholder="Search media assets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 outline-none focus:border-primary-500 transition-all placeholder-secondary-400"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-sm text-secondary-500 font-medium">Loading database media assets...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-secondary-300">
          <FileText size={36} className="mx-auto text-secondary-400 mb-2" />
          <p className="text-sm font-bold text-secondary-800">No media items found</p>
          <p className="text-xs text-secondary-500 mt-1">Upload images or documents to persist them in the production database.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-secondary-200/80 shadow-sm overflow-hidden group hover:shadow-md transition-all flex flex-col">
              <div className="h-36 bg-slate-100 relative flex items-center justify-center overflow-hidden">
                {item.name.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i) || item.url.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i) ? (
                  <img src={getMediaUrl(item.url)} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                ) : (
                  <FileText size={36} className="text-secondary-400" />
                )}
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/60 text-white backdrop-blur-sm">
                  {item.category}
                </span>
              </div>

              <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-bold text-secondary-900 truncate" title={item.name}>{item.name}</p>
                  <p className="text-[10px] text-secondary-400 mt-0.5">{new Date(item.uploadedAt).toLocaleDateString()}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                  <button
                    onClick={() => handleCopy(item.id, item.url)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary-600 hover:text-primary-700"
                    title="Copy Public URL"
                  >
                    {copiedId === item.id ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    {copiedId === item.id ? 'Copied' : 'Copy'}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <label className="text-secondary-400 hover:text-primary-600 cursor-pointer" title="Replace File">
                      <RefreshCw size={13} />
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) void handleReplace(item.id, f);
                        }}
                      />
                    </label>
                    <a href={getMediaUrl(item.url)} target="_blank" rel="noopener noreferrer" className="text-secondary-400 hover:text-secondary-700" title="Open Asset">
                      <ExternalLink size={13} />
                    </a>
                    <button
                      onClick={() => void handleDelete(item.id, item.name)}
                      className="text-secondary-400 hover:text-rose-600 transition-colors"
                      title="Delete Asset"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
