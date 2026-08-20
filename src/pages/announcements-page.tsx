import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Megaphone, Search, Calendar, MapPin, ArrowRight,
  Clock, ChevronRight, AlertCircle, Loader2
} from 'lucide-react';
import SEOHead from '@/components/shared/seo-head';
import CTASection from '@/components/shared/cta-section';
import { Announcement } from '@/lib/announcement-types';
import { listAnnouncements } from '@/lib/api';
import { getMediaUrl } from '@/lib/media-url';

const CATEGORIES = [
  'All',
  'General Announcement',
  'Event',
  'Admission',
  'Exam',
  'Holiday',
  'Achievement',
  'Notice',
  'Important',
];

function AnnouncementCardImage({
  src,
  alt,
  variant = 'card',
}: {
  src?: string | null;
  alt: string;
  variant?: 'card' | 'featured';
}) {
  const [hasError, setHasError] = useState(false);
  const mediaUrl = getMediaUrl(src);

  if (!mediaUrl || hasError) {
    if (variant === 'featured') {
      return (
        <div className="w-full h-full min-h-[260px] bg-gradient-to-br from-slate-100 via-primary-50/60 to-slate-200 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden border-l border-slate-200/60">
          <div className="w-16 h-16 rounded-3xl bg-white/90 shadow-soft border border-primary-100 flex items-center justify-center text-primary-700 mb-3">
            <Megaphone size={30} className="stroke-[1.75]" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-primary-950">
            Prarthana PU Science College, Bagalkot
          </span>
          <span className="text-xs text-secondary-600 font-bold mt-1">
            Official Campus Bulletin
          </span>
        </div>
      );
    }
    return (
      <div className="w-full h-full bg-gradient-to-br from-slate-100 via-primary-50/50 to-slate-200 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden border-b border-slate-200/60">
        <div className="w-12 h-12 rounded-2xl bg-white/80 shadow-xs border border-primary-100 flex items-center justify-center text-primary-700 mb-2">
          <Megaphone size={22} className="stroke-[1.75]" />
        </div>
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-primary-900/70">
          Prarthana PU Science College
        </span>
        <span className="text-[10px] text-secondary-500 font-semibold mt-0.5">
          Official Notice
        </span>
      </div>
    );
  }

  return (
    <img
      src={mediaUrl}
      alt={alt}
      loading="lazy"
      onError={() => setHasError(true)}
      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
    />
  );
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const data = await listAnnouncements(false);
        setAnnouncements(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load announcements');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredItems = announcements.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      (item.short_description || '').toLowerCase().includes(search.toLowerCase()) ||
      (item.venue || '').toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredAnnouncement = announcements.find((a) => a.is_featured);

  return (
    <>
      <SEOHead />

      {/* Hero Header */}
      <section className="relative pt-32 pb-20 bg-gradient-hero text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-accent-300 text-xs font-extrabold uppercase tracking-wider backdrop-blur-md">
              <Megaphone size={14} /> Official Campus Bulletins & News
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
              College Announcements & Events
            </h1>
            <p className="text-base md:text-lg text-primary-100 font-medium leading-relaxed">
              Official updates regarding admissions, academic schedules, examinations, campus achievements, and upcoming events at Prarthana PU Science College, Bagalkot.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-16 bg-slate-50 min-h-[600px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Featured Banner (if available) */}
          {!loading && featuredAnnouncement && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl border border-primary-100 shadow-soft overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0"
            >
              <div className="lg:col-span-7 p-8 md:p-10 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-accent-500 text-white uppercase tracking-wider">
                      Featured Notice
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary-50 text-primary-800 border border-primary-100">
                      {featuredAnnouncement.category}
                    </span>
                  </div>

                  <h2 className="text-2xl md:text-3xl font-extrabold text-secondary-900 leading-snug">
                    {featuredAnnouncement.title}
                  </h2>

                  <p className="text-sm text-secondary-600 font-medium leading-relaxed line-clamp-3">
                    {featuredAnnouncement.short_description || featuredAnnouncement.full_description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                  {featuredAnnouncement.event_date && (
                    <div className="flex items-center gap-2 text-xs font-bold text-secondary-700">
                      <Calendar size={16} className="text-primary-600" />
                      <span>
                        {new Date(featuredAnnouncement.event_date).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  )}

                  <Link
                    to={`/announcements/${featuredAnnouncement.id}`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-primary hover:shadow-lg text-white font-extrabold text-xs rounded-2xl transition-all"
                  >
                    Read Full Notice <ArrowRight size={16} />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-5 relative min-h-[260px] bg-slate-100 group">
                <AnnouncementCardImage
                  src={featuredAnnouncement.image_url}
                  alt={featuredAnnouncement.title}
                  variant="featured"
                />
              </div>
            </motion.div>
          )}

          {/* Filter & Search Controls */}
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search announcements by keyword..."
                  className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl border border-slate-200 text-xs font-semibold text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 shadow-xs transition-all placeholder-secondary-400"
                />
              </div>

              {/* Counter */}
              <p className="text-xs font-bold text-secondary-500">
                Showing <span className="text-primary-700">{filteredItems.length}</span> announcement(s)
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-primary-900 text-white shadow-md shadow-primary-900/20'
                      : 'bg-white text-secondary-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Announcements Grid */}
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <Loader2 size={36} className="animate-spin text-primary-600 mx-auto" />
              <p className="text-xs font-bold text-secondary-500">Fetching latest college bulletins...</p>
            </div>
          ) : error ? (
            <div className="py-16 text-center text-rose-600 space-y-3 bg-white rounded-3xl p-8 border border-rose-100">
              <AlertCircle size={36} className="mx-auto" />
              <p className="text-sm font-bold">{error}</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
              <Megaphone size={48} className="mx-auto text-secondary-300 stroke-1" />
              <h3 className="text-lg font-bold text-secondary-800">No Announcements Available</h3>
              <p className="text-xs text-secondary-500 max-w-md mx-auto">
                No active announcements match your criteria at the moment. Please check back soon or clear your search term.
              </p>
              {search && (
                <button
                  onClick={() => {
                    setSearch('');
                    setSelectedCategory('All');
                  }}
                  className="px-5 py-2.5 bg-primary-50 text-primary-700 font-bold text-xs rounded-xl hover:bg-primary-100 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-3xl border border-slate-200/80 shadow-soft overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group hover:-translate-y-1"
                >
                  {/* Card Image / Fallback */}
                  <div className="relative h-48 bg-slate-100 overflow-hidden">
                    <AnnouncementCardImage src={item.image_url} alt={item.title} variant="card" />
                    <div className="absolute top-3 left-3 z-10">
                      <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-white/90 text-primary-900 backdrop-blur-md shadow-xs border border-white/50">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      {/* Date & Location */}
                      <div className="flex items-center gap-3 text-xs text-secondary-500 font-semibold">
                        {item.event_date ? (
                          <span className="flex items-center gap-1">
                            <Calendar size={13} className="text-primary-600" />
                            {new Date(item.event_date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-secondary-400">
                            <Clock size={13} />
                            {new Date(item.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        )}

                        {item.venue && (
                          <span className="flex items-center gap-1 text-secondary-500 truncate max-w-[130px]">
                            <MapPin size={12} className="shrink-0 text-accent-500" />
                            <span className="truncate">{item.venue}</span>
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-secondary-900 group-hover:text-primary-600 transition-colors line-clamp-2 leading-snug">
                        {item.title}
                      </h3>

                      <p className="text-xs text-secondary-600 font-medium line-clamp-3 leading-relaxed">
                        {item.short_description || item.full_description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <Link
                        to={`/announcements/${item.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-extrabold text-primary-600 hover:text-primary-800 transition-colors group-hover:translate-x-0.5 transition-transform"
                      >
                        Read Details <ChevronRight size={15} />
                      </Link>

                      {item.cta_text && (
                        <span className="text-[10px] font-bold text-accent-600 bg-accent-50 px-2.5 py-1 rounded-full border border-accent-100">
                          Action Required
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <CTASection />
    </>
  );
}
