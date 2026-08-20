import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Calendar, MapPin, ArrowLeft, ArrowRight, Clock, Download,
  Share2, AlertCircle, Loader2, CheckCircle2
} from 'lucide-react';
import SEOHead from '@/components/shared/seo-head';
import CTASection from '@/components/shared/cta-section';
import { Announcement } from '@/lib/announcement-types';
import { getAnnouncement } from '@/lib/api';
import { getMediaUrl } from '@/lib/media-url';

export default function AnnouncementDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchDetail() {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await getAnnouncement(id);
        if (!data) {
          setError('Announcement not found or no longer available.');
        } else {
          setAnnouncement(data);
          document.title = `${data.title} | Prarthana PU Science College Bagalkot`;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load announcement details.');
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [id]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: announcement?.title || 'College Announcement',
        text: announcement?.short_description || '',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  if (loading) {
    return (
      <div className="pt-36 pb-20 text-center space-y-4">
        <Loader2 size={40} className="animate-spin text-primary-600 mx-auto" />
        <p className="text-sm font-bold text-secondary-600">Loading announcement notice details...</p>
      </div>
    );
  }

  if (error || !announcement) {
    return (
      <div className="pt-36 pb-20 max-w-xl mx-auto px-4 text-center space-y-6">
        <div className="bg-white rounded-3xl p-10 shadow-soft border border-slate-200 space-y-4">
          <AlertCircle size={48} className="text-rose-500 mx-auto" />
          <h2 className="text-2xl font-extrabold text-secondary-900">Notice Not Found</h2>
          <p className="text-sm text-secondary-600 font-medium">
            {error || 'The requested announcement is not available or has been archived.'}
          </p>
          <Link
            to="/announcements"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-primary text-white text-xs font-extrabold rounded-2xl shadow-md"
          >
            <ArrowLeft size={16} /> Back to Announcements
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead />

      {/* Header Banner */}
      <section className="relative pt-32 pb-16 bg-gradient-hero text-white overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
          <Link
            to="/announcements"
            className="inline-flex items-center gap-2 text-xs font-bold text-primary-200 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} /> Back to All Announcements
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-accent-500 text-white uppercase tracking-wider">
              {announcement.category}
            </span>
            {announcement.is_featured && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                Featured Bulletin
              </span>
            )}
          </div>

          <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
            {announcement.title}
          </h1>

          {/* Schedule Metadata */}
          <div className="flex flex-wrap items-center gap-6 text-xs text-primary-200 font-semibold pt-2 border-t border-white/10">
            {announcement.event_date && (
              <span className="flex items-center gap-1.5">
                <Calendar size={15} className="text-accent-400" />
                Event Date:{' '}
                <strong className="text-white">
                  {new Date(announcement.event_date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </strong>
              </span>
            )}

            {announcement.event_time && (
              <span className="flex items-center gap-1.5">
                <Clock size={15} className="text-accent-400" />
                Time: <strong className="text-white">{announcement.event_time}</strong>
              </span>
            )}

            {announcement.venue && (
              <span className="flex items-center gap-1.5">
                <MapPin size={15} className="text-accent-400" />
                Venue: <strong className="text-white">{announcement.venue}</strong>
              </span>
            )}

            <span className="flex items-center gap-1.5">
              <Clock size={15} className="text-primary-300" />
              Published:{' '}
              {new Date(announcement.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-slate-50 min-h-[500px]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft overflow-hidden p-6 sm:p-10 space-y-8">
            {/* Banner Image */}
            {announcement.image_url && getMediaUrl(announcement.image_url) && (
              <div className="rounded-2xl overflow-hidden border border-slate-100 max-h-[450px] shadow-xs">
                <img
                  src={getMediaUrl(announcement.image_url)}
                  alt={announcement.title}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Short Description Quote Box */}
            {announcement.short_description && (
              <div className="p-5 rounded-2xl bg-primary-50/70 border-l-4 border-primary-600 text-sm font-semibold text-primary-950 leading-relaxed">
                {announcement.short_description}
              </div>
            )}

            {/* Full Detailed Description */}
            <div className="prose max-w-none text-secondary-800 text-sm md:text-base leading-relaxed space-y-4 font-normal">
              {(announcement.full_description || announcement.short_description || '')
                .split('\n\n')
                .map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
            </div>

            {/* Attachments & Downloads */}
            {announcement.attachment_url && (
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center shrink-0">
                    <Download size={22} />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-secondary-900">Official Document Attachment</h4>
                    <p className="text-xs text-secondary-500">Download syllabus, timetable, or guidelines document</p>
                  </div>
                </div>

                <a
                  href={announcement.attachment_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 bg-primary-900 hover:bg-primary-950 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2 shrink-0"
                >
                  <Download size={14} /> Download File
                </a>
              </div>
            )}

            {/* Action Bar Footer */}
            <div className="pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <button
                onClick={handleShare}
                className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-secondary-700 font-bold text-xs transition-colors flex items-center justify-center gap-2"
              >
                {copied ? <CheckCircle2 size={16} className="text-emerald-600" /> : <Share2 size={16} />}
                <span>{copied ? 'Link Copied!' : 'Share Announcement'}</span>
              </button>

              {announcement.cta_text && announcement.cta_url && (
                <a
                  href={announcement.cta_url}
                  className="px-6 py-3 bg-gradient-accent hover:shadow-lg text-white font-extrabold text-xs rounded-2xl transition-all text-center flex items-center justify-center gap-2"
                >
                  <span>{announcement.cta_text}</span>
                  <ArrowRight size={16} />
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
