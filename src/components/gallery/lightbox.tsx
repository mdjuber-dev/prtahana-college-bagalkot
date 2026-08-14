import { useEffect, useCallback, useRef, useState } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMediaUrl } from '@/lib/media-url';

interface LightboxProps {
  images: { src: string; alt: string; title: string }[];
  index: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export default function Lightbox({ images, index, onClose, onNavigate }: LightboxProps) {
  const isOpen = index !== null;
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const touchStartX = useRef(0);
  const touchStartPan = useRef({ x: 0, y: 0 });
  const isPanning = useRef(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft' && index !== null && index > 0) { onNavigate(index - 1); setZoom(1); setPan({ x: 0, y: 0 }); }
    if (e.key === 'ArrowRight' && index !== null && index < images.length - 1) { onNavigate(index + 1); setZoom(1); setPan({ x: 0, y: 0 }); }
    if (e.key === '+' || e.key === '=') setZoom((z) => Math.min(z + 0.5, 4));
    if (e.key === '-') setZoom((z) => Math.max(z - 0.5, 1));
  }, [isOpen, index, images.length, onClose, onNavigate]);

  useEffect(() => { window.addEventListener('keydown', handleKeyDown); return () => window.removeEventListener('keydown', handleKeyDown); }, [handleKeyDown]);
  useEffect(() => { document.body.style.overflow = isOpen ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [isOpen]);
  useEffect(() => { setZoom(1); setPan({ x: 0, y: 0 }); }, [index]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoom > 1) {
      touchStartX.current = e.touches[0].clientX;
      touchStartPan.current = pan;
      isPanning.current = true;
    } else {
      touchStartX.current = e.touches[0].clientX;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (zoom > 1 && isPanning.current) {
      isPanning.current = false;
      return;
    }
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && index !== null && index < images.length - 1) { onNavigate(index + 1); setZoom(1); setPan({ x: 0, y: 0 }); }
      else if (diff < 0 && index !== null && index > 0) { onNavigate(index - 1); setZoom(1); setPan({ x: 0, y: 0 }); }
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY < 0) setZoom((z) => Math.min(z + 0.25, 4));
    else setZoom((z) => Math.max(z - 0.25, 1));
  };

  return (
    <AnimatePresence>
      {isOpen && index !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] bg-black/95 flex items-center justify-center p-4"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
        >
          {/* Close */}
          <button
            className="absolute top-4 right-4 text-white p-2 rounded-full hover:bg-white/10 transition-colors z-20"
            onClick={onClose}
            aria-label="Close lightbox"
          >
            <X size={28} />
          </button>

          {/* Zoom controls */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            <button
              className="text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              onClick={(e) => { e.stopPropagation(); setZoom((z) => Math.min(z + 0.5, 4)); }}
              aria-label="Zoom in"
            >
              <ZoomIn size={22} />
            </button>
            <button
              className="text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              onClick={(e) => { e.stopPropagation(); setZoom((z) => Math.max(z - 0.5, 1)); setPan({ x: 0, y: 0 }); }}
              aria-label="Zoom out"
            >
              <ZoomOut size={22} />
            </button>
          </div>

          {/* Prev */}
          {index > 0 && (
            <button
              className="absolute left-2 md:left-4 text-white p-2 rounded-full hover:bg-white/10 transition-colors z-20"
              onClick={(e) => { e.stopPropagation(); onNavigate(index - 1); setZoom(1); setPan({ x: 0, y: 0 }); }}
              aria-label="Previous image"
            >
              <ChevronLeft size={36} />
            </button>
          )}

          {/* Next */}
          {index < images.length - 1 && (
            <button
              className="absolute right-2 md:right-4 text-white p-2 rounded-full hover:bg-white/10 transition-colors z-20"
              onClick={(e) => { e.stopPropagation(); onNavigate(index + 1); setZoom(1); setPan({ x: 0, y: 0 }); }}
              aria-label="Next image"
            >
              <ChevronRight size={36} />
            </button>
          )}

          {/* Image */}
          <motion.figure
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="max-w-5xl max-h-[85vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onWheel={handleWheel}
          >
            <img
              src={getMediaUrl(images[index].src)}
              alt={images[index].alt}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
              loading="lazy"
              style={{
                transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                transition: 'transform 0.2s ease-out',
                cursor: zoom > 1 ? 'grab' : 'pointer',
              }}
              draggable={false}
            />
            <figcaption className="text-white text-sm md:text-base mt-3 text-center">
              {images[index].title}
              <span className="ml-2 text-white/50 text-xs">({index + 1} / {images.length})</span>
            </figcaption>
          </motion.figure>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
