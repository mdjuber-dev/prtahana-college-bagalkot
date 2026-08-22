import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, MapPin, ArrowRight, Sparkles } from 'lucide-react';
import { Announcement } from '@/lib/announcement-types';
import { listAnnouncements } from '@/lib/api';
import { getMediaUrl } from '@/lib/media-url';

/** Marks that the popup has already been offered in this browser tab session. */
const SESSION_SHOWN_KEY = 'prarthana_announcement_popup_shown';
/** Permanent per-announcement dismissal. */
const dismissedKey = (id: string) => `prarthana_announcement_dismissed_${id}`;

function safeGet(storage: Storage, key: string): string | null {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(storage: Storage, key: string, value: string) {
  try {
    storage.setItem(key, value);
  } catch {
    /* storage blocked (private mode) — popup simply behaves as non-persistent */
  }
}

/** True for in-app routes that should navigate through the router, not a page reload. */
function isInternalUrl(url: string) {
  return url.startsWith('/') && !url.startsWith('//');
}

/**
 * An announcement is only presentable if it has a title plus something to read.
 * This guards against incomplete/blank rows in the database (e.g. a record saved
 * before its content was filled in) rendering an empty popup to every visitor.
 */
function isPresentable(item: Announcement): boolean {
  const hasTitle = Boolean(item.title && String(item.title).trim());
  const hasBody = Boolean(
    (item.short_description && String(item.short_description).trim()) ||
    (item.full_description && String(item.full_description).trim()),
  );
  return hasTitle && hasBody;
}

export default function AnnouncementPopup() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [visible, setVisible] = useState(false);
  const location = useLocation();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Runs once per mount (NOT per route change) so the popup cannot re-open
  // repeatedly while the visitor browses the site during the same session.
  useEffect(() => {
    if (isAdminRoute) return;
    if (safeGet(sessionStorage, SESSION_SHOWN_KEY)) return;

    let isMounted = true;

    (async () => {
      try {
        const items: Announcement[] = await listAnnouncements(false);
        if (!isMounted || !items?.length) return;

        const notDismissed = items.filter(
          (item) => isPresentable(item) && !safeGet(localStorage, dismissedKey(item.id)),
        );
        if (!notDismissed.length) return;

        // Prefer a featured notice; otherwise fall back to the highest-priority one.
        // The public endpoint already returns only published rows ordered by priority.
        const target = notDismissed.find((item) => item.is_featured) || notDismissed[0];
        if (!target) return;

        setAnnouncement(target);
        timerRef.current = setTimeout(() => {
          if (!isMounted) return;
          setVisible(true);
          safeSet(sessionStorage, SESSION_SHOWN_KEY, '1');
        }, 3000);
      } catch (err) {
        console.warn('Failed to load announcements for popup:', err);
      }
    })();

    return () => {
      isMounted = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const close = useCallback(
    (options: { permanent?: boolean } = {}) => {
      if (options.permanent && announcement) {
        safeSet(localStorage, dismissedKey(announcement.id), 'true');
      }
      safeSet(sessionStorage, SESSION_SHOWN_KEY, '1');
      setVisible(false);
    },
    [announcement],
  );

  // Escape to close + lock background scroll while open.
  useEffect(() => {
    if (!visible) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [visible, close]);

  if (!visible || !announcement || isAdminRoute) return null;

  const ctaUrl = announcement.cta_url?.trim();
  const ctaText = announcement.cta_text?.trim();
  const hasCta = Boolean(ctaUrl && ctaText);
  const ctaClasses =
    'flex-1 py-3 px-5 bg-gradient-accent hover:shadow-lg hover:shadow-accent-500/30 text-white font-bold text-sm rounded-2xl transition-all duration-300 text-center flex items-center justify-center gap-2';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-secondary-950/70 backdrop-blur-sm"
        onClick={() => close()}
      >
        <motion.div
          ref={dialogRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-labelledby="announcement-popup-title"
          initial={{ scale: 0.9, y: 30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden relative focus:outline-none"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-secondary-900 via-primary-950 to-secondary-900 p-6 text-white relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-accent-500/20 rounded-full blur-2xl" aria-hidden="true" />

            <button
              onClick={() => close()}
              className="absolute top-4 right-4 text-white hover:bg-white/20 p-1.5 rounded-xl transition-colors z-30"
              aria-label="Close announcement"
            >
              <X size={20} />
            </button>

            <div className="relative z-10 flex flex-wrap items-center gap-2 mb-3 pr-10">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-accent-500 text-white flex items-center gap-1.5">
                <Sparkles size={12} aria-hidden="true" /> {announcement.category}
              </span>
              {announcement.is_featured && (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-400/25 text-amber-200 border border-amber-400/40">
                  Featured Notice
                </span>
              )}
            </div>

            <h2 id="announcement-popup-title" className="text-xl md:text-2xl font-extrabold text-white leading-tight pr-8">
              {announcement.title}
            </h2>

            {announcement.event_date && (
              <div className="flex flex-wrap items-center gap-4 text-xs text-primary-100 mt-2 font-medium">
                <span className="flex items-center gap-1">
                  <Calendar size={13} className="text-accent-400" aria-hidden="true" />
                  {new Date(announcement.event_date).toLocaleDateString('en-IN', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
                {announcement.venue && (
                  <span className="flex min-w-0 items-center gap-1">
                    <MapPin size={13} className="text-accent-400 shrink-0" aria-hidden="true" />
                    <span className="truncate">{announcement.venue}</span>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Body Content */}
          <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto custom-scrollbar">
            {announcement.image_url && getMediaUrl(announcement.image_url) && (
              <div className="rounded-2xl overflow-hidden border border-slate-200 max-h-52">
                <img
                  src={getMediaUrl(announcement.image_url)}
                  alt={announcement.title}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <p className="text-sm font-medium text-secondary-800 leading-relaxed">
              {announcement.short_description || announcement.full_description}
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {hasCta ? (
                isInternalUrl(ctaUrl!) ? (
                  <Link to={ctaUrl!} onClick={() => close()} className={ctaClasses}>
                    <span>{ctaText}</span>
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                ) : (
                  <a
                    href={ctaUrl!}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => close()}
                    className={ctaClasses}
                  >
                    <span>{ctaText}</span>
                    <ArrowRight size={16} aria-hidden="true" />
                  </a>
                )
              ) : (
                <Link
                  to={`/announcements/${announcement.id}`}
                  onClick={() => close()}
                  className="flex-1 py-3 px-5 bg-gradient-primary hover:shadow-lg text-white font-bold text-sm rounded-2xl transition-all duration-300 text-center flex items-center justify-center gap-2"
                >
                  <span>Read Full Notice</span>
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              )}

              <button
                onClick={() => close({ permanent: true })}
                className="py-3 px-5 bg-slate-100 hover:bg-slate-200 text-secondary-800 font-bold text-sm rounded-2xl transition-colors text-center"
              >
                Don't show again
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
