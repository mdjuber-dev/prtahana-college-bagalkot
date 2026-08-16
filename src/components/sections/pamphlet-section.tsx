import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  ZoomIn,
  X,
  Download,
  FileText,
  Maximize2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import SectionTitle from '@/components/shared/section-title';
import { fadeInUp, staggerContainer } from '@/lib/motion';
import { useCMS } from '@/lib/cms-context';
import { getMediaUrl } from '@/lib/media-url';

type PamphletSide = 'front' | 'back';

const fallbackPamphletImages: Record<PamphletSide, { src: string; alt: string }> = {
  front: {
    src: '/prathanaclg-pht.png',
    alt: 'Prarthana PU Science College campus',
  },
  back: {
    src: '/frontpagepamplet.jpeg',
    alt: 'Prarthana PU Science College management and facilities',
  },
};

function PamphletCard({
  side,
  onView,
}: {
  side: PamphletSide;
  onView: () => void;
}) {
  const cms = useCMS();
  const cmsImg = side === 'front' ? cms.pamphlet?.frontImage : cms.pamphlet?.backImage;
  const defaultImg = side === 'front' ? '/frontpagepamplet.jpeg' : '/backpagepamplet.jpeg';
  const fallback = fallbackPamphletImages[side];
  const label = side === 'front' ? 'PAMPHLET FRONT SIDE' : 'PAMPHLET BACK SIDE';
  const subLabel = side === 'front' ? 'Cover · Courses, Admissions & College Overview' : 'Inside · Facilities, Fees & Contact Details';

  const [imgSrc, setImgSrc] = useState<string>(cmsImg || defaultImg);
  const handleError = () => {
    if (imgSrc !== fallback.src) setImgSrc(fallback.src);
  };

  useEffect(() => {
    setImgSrc(cmsImg || defaultImg);
  }, [cmsImg, defaultImg]);

  return (
    <motion.div
      variants={fadeInUp}
      className="group relative flex flex-col h-full"
    >
      <div className="relative flex-1 rounded-3xl overflow-hidden bg-gradient-to-br from-primary-50 via-white to-accent-50/40 border border-primary-100/70 card-shadow flex flex-col">
        {/* Top accent bar */}
        <div
          className={`h-1.5 w-full ${side === 'front' ? 'bg-gradient-primary' : 'bg-gradient-accent'
            }`}
          aria-hidden="true"
        />

        {/* Card header */}
        <div className="px-5 sm:px-6 pt-5 pb-4 border-b border-primary-100/70">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center ${side === 'front'
                  ? 'bg-gradient-primary'
                  : 'bg-gradient-accent'
                  }`}
              >
                <FileText className="text-white" size={20} />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-secondary-500">
                  College Pamphlet
                </p>
                <p
                  className={`text-base font-extrabold ${side === 'front' ? 'text-primary-900' : 'text-accent-700'
                    }`}
                >
                  {label}
                </p>
              </div>
            </div>
            <div
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${side === 'front'
                ? 'bg-primary-100 text-primary-800'
                : 'bg-accent-100 text-accent-800'
                }`}
            >
              <BookOpen size={12} />
              Admissions 2026-27
            </div>
          </div>
          <p className="mt-1 text-xs text-secondary-500 ml-14">{subLabel}</p>
        </div>

        {/* Image area */}
        <div className="relative flex-1 p-4 sm:p-6">
          <div
            className="relative w-full rounded-2xl overflow-hidden bg-white border border-secondary-200/70 shadow-inner"
            style={{ aspectRatio: '3 / 4' }}
          >
            <img
              src={getMediaUrl(imgSrc)}
              alt={`${label} - Prarthana PU Science College`}
              onError={handleError}
              className="absolute inset-0 w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
              loading="lazy"
              decoding="async"
            />
            {/* Hover overlay */}
            <button
              onClick={onView}
              aria-label={`View full ${label}`}
              className="absolute inset-0 bg-primary-900/0 group-hover:bg-primary-900/30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-primary-900 font-bold text-sm shadow-soft">
                <ZoomIn size={16} />
                Zoom Preview
              </span>
            </button>
          </div>
        </div>

        {/* Action buttons */}
        <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-1 border-t border-primary-100/70">
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={onView}
              className={`inline-flex items-center justify-center gap-1.5 px-3 py-3 rounded-xl font-bold text-sm transition-all duration-300 hover:-translate-y-0.5 ${side === 'front'
                ? 'text-white bg-gradient-primary hover:shadow-lg hover:shadow-primary-700/25'
                : 'text-white bg-gradient-accent hover:shadow-lg hover:shadow-accent-500/30'
                }`}
            >
              <Maximize2 size={15} />
              View Full Image
            </button>
              <a
                href={getMediaUrl(imgSrc)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-3 py-3 rounded-xl font-bold text-sm text-secondary-800 bg-secondary-100 hover:bg-secondary-200 transition-colors border border-secondary-200"
              >
              <Download size={15} />
              Open / Save
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function PamphletSection() {
  const cms = useCMS();
  const [zoomOpen, setZoomOpen] = useState(false);
  const [zoomSide, setZoomSide] = useState<PamphletSide>('front');

  const openZoom = (side: PamphletSide) => {
    setZoomSide(side);
    setZoomOpen(true);
  };
  const closeZoom = () => setZoomOpen(false);

  const zoomImgSrc =
    zoomSide === 'front'
      ? cms.pamphlet?.frontImage || '/frontpagepamplet.jpeg'
      : cms.pamphlet?.backImage || '/backpagepamplet.jpeg';
  const zoomFallback = fallbackPamphletImages[zoomSide].src;
  const [zoomImg, setZoomImg] = useState(zoomImgSrc);

  useEffect(() => {
    if (zoomOpen) {
      setZoomImg(zoomImgSrc);
    }
  }, [zoomSide, zoomOpen, zoomImgSrc]);

  return (
    <section className="py-16 md:py-24 bg-white relative overflow-hidden" aria-labelledby="pamphlet-title">
      <div className="absolute top-20 right-0 w-80 h-80 rounded-full bg-primary-50 blur-3xl opacity-70 pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-20 left-0 w-80 h-80 rounded-full bg-accent-50 blur-3xl opacity-70 pointer-events-none" aria-hidden="true" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <SectionTitle
          eyebrow="College Brochure"
          title="Explore Our College Pamphlet"
          subtitle="Browse both sides of our official pamphlet — front cover and detailed inside — to learn about courses, facilities, faculty, and everything that makes Prarthana PU Science College the right choice."
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-6xl mx-auto"
        >
          <PamphletCard side="front" onView={() => openZoom('front')} />
          <PamphletCard side="back" onView={() => openZoom('back')} />
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-10 max-w-3xl mx-auto text-center"
        >
          <div className="inline-flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-primary-50 to-accent-50 border border-primary-100/60 w-full sm:w-auto">
            <p className="text-sm text-secondary-700 font-medium px-2">
              Ready to begin your journey with us?
            </p>
            <div className="flex flex-wrap gap-2.5 justify-center">
              <Link
                to="/admission"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-white bg-gradient-accent hover:shadow-lg hover:shadow-accent-500/30 transition-all duration-300 hover:-translate-y-0.5"
              >
                Apply for Admission
              </Link>
              <Link
                to="/courses"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-primary-900 bg-white hover:bg-primary-50 transition-colors border border-primary-200"
              >
                Explore Courses
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Zoom / Lightbox Modal */}
      <AnimatePresence>
        {zoomOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label={`${zoomSide === 'front' ? 'Front' : 'Back'} pamphlet zoom view`}
            onClick={closeZoom}
          >
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 }}
              onClick={closeZoom}
              aria-label="Close zoom view"
              className="absolute top-4 right-4 md:top-6 md:right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center justify-center transition-colors"
            >
              <X size={22} />
            </motion.button>

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-5xl max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 right-0 z-10 p-3 md:p-4 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent">
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold backdrop-blur-sm border ${zoomSide === 'front'
                      ? 'bg-white text-primary-900'
                      : 'bg-accent-500 text-white border-accent-400'
                      }`}
                  >
                    <FileText size={12} />
                    Pamphlet {zoomSide === 'front' ? 'Front' : 'Back'} Side
                  </span>
                  <span className="hidden sm:inline text-white/80 text-xs">
                    Admissions 2026-27
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={getMediaUrl(zoomImg)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 text-white hover:bg-white/20 border border-white/15 backdrop-blur-sm transition-colors"
                  >
                    <Download size={12} />
                    Save
                  </a>
                </div>
              </div>
              <img
                src={getMediaUrl(zoomImg)}
                onError={() => setZoomImg(zoomFallback)}
                alt={`Prarthana PU Science College Pamphlet ${zoomSide === 'front' ? 'Front' : 'Back'} Side`}
                className="w-full max-h-[85vh] object-contain bg-white"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
