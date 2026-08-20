import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, MapPin, ArrowRight, Sparkles } from 'lucide-react';
import { Announcement } from '@/lib/announcement-types';
import { listAnnouncements } from '@/lib/api';
import { getMediaUrl } from '@/lib/media-url';

export default function AnnouncementPopup() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [visible, setVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Never show on admin pages
    if (location.pathname.startsWith('/admin')) return;

    let isMounted = true;

    async function checkFeaturedAnnouncement() {
      try {
        const items: Announcement[] = await listAnnouncements(false);
        if (!items || items.length === 0) return;

        // Find highest priority featured announcement that hasn't been dismissed yet
        const target = items.find((item) => {
          if (!item.is_featured && item.status !== 'published') return false;
          const dismissedKey = `prarthana_announcement_dismissed_${item.id}`;
          return !localStorage.getItem(dismissedKey);
        }) || items.find((item) => {
          const dismissedKey = `prarthana_announcement_dismissed_${item.id}`;
          return !localStorage.getItem(dismissedKey);
        });

        if (target && isMounted) {
          setAnnouncement(target);

          // 3-second delay after initial load
          const timer = setTimeout(() => {
            if (isMounted) setVisible(true);
          }, 3000);

          return () => clearTimeout(timer);
        }
      } catch (err) {
        console.warn('Failed to load announcements for popup:', err);
      }
    }

    checkFeaturedAnnouncement();

    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  const handleClose = () => {
    if (announcement) {
      localStorage.setItem(`prarthana_announcement_dismissed_${announcement.id}`, 'true');
    }
    setVisible(false);
  };

  if (!visible || !announcement || location.pathname.startsWith('/admin')) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-secondary-950/70 backdrop-blur-md"
        onClick={handleClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="announcement-popup-title"
      >
        <motion.div
          initial={{ scale: 0.9, y: 30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-white/20 relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-secondary-900 via-primary-950 to-secondary-900 p-6 text-white relative overflow-hidden">
            {/* Background Glow Effect */}
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-accent-500/20 rounded-full blur-2xl" />

            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-white/70 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors z-10"
              aria-label="Close announcement"
            >
              <X size={20} />
            </button>

            <div className="relative z-10 flex items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-accent-500 text-white shadow-xs flex items-center gap-1.5">
                <Sparkles size={12} /> {announcement.category}
              </span>
              {announcement.is_featured && (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Featured Notice
                </span>
              )}
            </div>

            <h2 id="announcement-popup-title" className="text-xl md:text-2xl font-black text-white leading-tight pr-6">
              {announcement.title}
            </h2>

            {announcement.event_date && (
              <div className="flex items-center gap-4 text-xs text-primary-200 mt-2 font-medium">
                <span className="flex items-center gap-1">
                  <Calendar size={13} className="text-accent-400" />
                  {new Date(announcement.event_date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
                {announcement.venue && (
                  <span className="flex items-center gap-1 truncate">
                    <MapPin size={13} className="text-accent-400 shrink-0" />
                    <span className="truncate">{announcement.venue}</span>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Body Content */}
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
            {announcement.image_url && getMediaUrl(announcement.image_url) && (
              <div className="rounded-2xl overflow-hidden border border-slate-100 max-h-52 shadow-xs">
                <img
                  src={getMediaUrl(announcement.image_url)}
                  alt={announcement.title}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <p className="text-sm font-medium text-secondary-700 leading-relaxed">
              {announcement.short_description || announcement.full_description}
            </p>

            {/* CTA / Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {announcement.cta_text && announcement.cta_url ? (
                <a
                  href={announcement.cta_url}
                  onClick={handleClose}
                  className="flex-1 py-3 px-5 bg-gradient-accent hover:shadow-lg hover:shadow-accent-500/30 text-white font-extrabold text-sm rounded-2xl transition-all duration-300 text-center flex items-center justify-center gap-2"
                >
                  <span>{announcement.cta_text}</span>
                  <ArrowRight size={16} />
                </a>
              ) : (
                <Link
                  to={`/announcements/${announcement.id}`}
                  onClick={handleClose}
                  className="flex-1 py-3 px-5 bg-gradient-primary hover:shadow-lg text-white font-extrabold text-sm rounded-2xl transition-all duration-300 text-center flex items-center justify-center gap-2"
                >
                  <span>Read Full Notice</span>
                  <ArrowRight size={16} />
                </Link>
              )}

              <button
                onClick={handleClose}
                className="py-3 px-5 bg-slate-100 hover:bg-slate-200 text-secondary-700 font-bold text-sm rounded-2xl transition-colors text-center"
              >
                Dismiss
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
