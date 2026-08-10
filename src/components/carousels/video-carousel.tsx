import { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Maximize2, Minimize2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAutoCarousel } from '@/hooks/use-auto-carousel';
import type { GalleryVideo } from '@/lib/gallery-data';

interface VideoCarouselProps {
  videos: GalleryVideo[];
  interval?: number;
}

type VideoKind = 'mp4' | 'youtube' | 'vimeo';

function detectKind(src: string): VideoKind {
  if (/youtube\.com|youtu\.be/.test(src)) return 'youtube';
  if (/vimeo\.com/.test(src)) return 'vimeo';
  return 'mp4';
}

function youtubeEmbed(src: string): string {
  const m = src.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/);
  const id = m ? m[1] : '';
  return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`;
}

function vimeoEmbed(src: string): string {
  const m = src.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  const id = m ? m[1] : '';
  return `https://player.vimeo.com/video/${id}?autoplay=1`;
}

export default function VideoCarousel({ videos, interval = 5000 }: VideoCarouselProps) {
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [, setHoveredIndex] = useState<number | null>(null);
  const [fullscreenIndex, setFullscreenIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isBrowserFullscreen, setIsBrowserFullscreen] = useState(false);
  const lightboxVideoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { index, next, prev, goTo, handleMouseEnter, handleMouseLeave, handleTouchStart, handleTouchEnd } =
    useAutoCarousel({ totalItems: videos.length, interval, pauseOnHover: true });

  const handleVideoMouseEnter = useCallback((i: number) => {
    setHoveredIndex(i);
    handleMouseEnter();
    const video = videoRefs.current[i];
    if (video) video.play().catch(() => {});
  }, [handleMouseEnter]);

  const handleVideoMouseLeave = useCallback((i: number) => {
    setHoveredIndex(null);
    handleMouseLeave();
    const video = videoRefs.current[i];
    if (video) { video.pause(); video.currentTime = 0; }
  }, [handleMouseLeave]);

  const openLightbox = useCallback((i: number) => {
    setFullscreenIndex(i);
    setIsPlaying(true);
    setIsMuted(false);
  }, []);

  const closeLightbox = useCallback(() => {
    setFullscreenIndex(null);
    setIsPlaying(false);
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  }, []);

  const handleVideoTap = useCallback((i: number) => {
    openLightbox(i);
  }, [openLightbox]);

  const togglePlay = useCallback(() => {
    const v = lightboxVideoRef.current;
    if (!v) return;
    if (v.paused) { v.play().catch(() => {}); setIsPlaying(true); }
    else { v.pause(); setIsPlaying(false); }
  }, []);

  const toggleMute = useCallback(() => {
    const v = lightboxVideoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setIsMuted(v.muted);
  }, []);

  const toggleBrowserFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.().then(() => setIsBrowserFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsBrowserFullscreen(false)).catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (document.fullscreenElement === null) setIsBrowserFullscreen(false);
  }, []);

  useEffect(() => {
    if (fullscreenIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight' && fullscreenIndex < videos.length - 1) {
        setFullscreenIndex(fullscreenIndex + 1); setIsPlaying(true);
      }
      if (e.key === 'ArrowLeft' && fullscreenIndex > 0) {
        setFullscreenIndex(fullscreenIndex - 1); setIsPlaying(true);
      }
      if (e.key === ' ') { e.preventDefault(); togglePlay(); }
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [fullscreenIndex, closeLightbox, togglePlay, videos.length]);

  const current = fullscreenIndex !== null ? videos[fullscreenIndex] : null;
  const kind = current ? detectKind(current.src) : 'mp4';

  return (
    <>
      <div
        className="relative overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        role="region"
        aria-roledescription="carousel"
        aria-label="Video carousel"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {videos.map((video, i) => (
              <div
                key={i}
                className="relative group rounded-2xl overflow-hidden card-shadow cursor-pointer"
                onMouseEnter={() => handleVideoMouseEnter(i)}
                onMouseLeave={() => handleVideoMouseLeave(i)}
                onClick={() => handleVideoTap(i)}
                role="button"
                tabIndex={0}
                aria-label={`Play video: ${video.title}`}
              >
                <video
                  ref={(el) => { videoRefs.current[i] = el; }}
                  src={video.src}
                  poster={video.poster}
                  className="w-full aspect-video object-cover transition-transform duration-500 group-hover:scale-105"
                  loop
                  muted
                  playsInline
                  preload="metadata"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
                  <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="text-primary-700 ml-1" size={28} fill="currentColor" />
                  </div>
                </div>
                <button
                  className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => { e.stopPropagation(); openLightbox(i); }}
                  aria-label={`Open video fullscreen: ${video.title}`}
                >
                  <Maximize2 size={16} />
                </button>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                  <h3 className="text-white font-semibold text-sm md:text-base">{video.title}</h3>
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>

        <button
          onClick={prev}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full glass flex items-center justify-center text-secondary-700 hover:bg-white transition-colors"
          aria-label="Previous videos"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={next}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full glass flex items-center justify-center text-secondary-700 hover:bg-white transition-colors"
          aria-label="Next videos"
        >
          <ChevronRight size={20} />
        </button>

        <div className="flex justify-center gap-2 mt-4" role="tablist" aria-label="Video pagination">
          {videos.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-2 rounded-full transition-all duration-300 ${i === index ? 'w-6 bg-primary-600' : 'w-2 bg-secondary-300 hover:bg-secondary-400'}`}
              role="tab"
              aria-selected={i === index}
              aria-label={`Go to video set ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Lightbox modal */}
      <AnimatePresence>
        {current && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8"
            onClick={closeLightbox}
            role="dialog"
            aria-modal="true"
            aria-label={`Video player: ${current.title}`}
          >
            {/* Blurred dark backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

            {/* Close button */}
            <button
              className="absolute top-4 right-4 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
              aria-label="Close video"
            >
              <X size={24} />
            </button>

            {/* Prev / Next */}
            {fullscreenIndex! > 0 && (
              <button
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                onClick={(e) => { e.stopPropagation(); setFullscreenIndex(fullscreenIndex! - 1); setIsPlaying(true); }}
                aria-label="Previous video"
              >
                <ChevronLeft size={28} />
              </button>
            )}
            {fullscreenIndex! < videos.length - 1 && (
              <button
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                onClick={(e) => { e.stopPropagation(); setFullscreenIndex(fullscreenIndex! + 1); setIsPlaying(true); }}
                aria-label="Next video"
              >
                <ChevronRight size={28} />
              </button>
            )}

            {/* Player */}
            <motion.div
              ref={containerRef}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="relative z-10 w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {kind === 'mp4' ? (
                <video
                  ref={lightboxVideoRef}
                  src={current.src}
                  poster={current.poster}
                  className="w-full h-full object-contain"
                  autoPlay
                  playsInline
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                />
              ) : (
                <iframe
                  src={kind === 'youtube' ? youtubeEmbed(current.src) : vimeoEmbed(current.src)}
                  title={current.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              )}

              {/* Custom controls (MP4 only) */}
              {kind === 'mp4' && (
                <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 px-4 py-3 bg-gradient-to-t from-black/80 to-transparent opacity-90 hover:opacity-100 transition-opacity">
                  <button
                    onClick={togglePlay}
                    className="text-white p-2 rounded-full hover:bg-white/15 transition-colors"
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}
                  </button>
                  <button
                    onClick={toggleMute}
                    className="text-white p-2 rounded-full hover:bg-white/15 transition-colors"
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <VolumeX size={22} /> : <Volume2 size={22} />}
                  </button>
                  <div className="flex-1" />
                  <span className="text-white/90 text-sm font-medium hidden sm:block truncate max-w-[40%]">{current.title}</span>
                  <div className="flex-1" />
                  <button
                    onClick={toggleBrowserFullscreen}
                    className="text-white p-2 rounded-full hover:bg-white/15 transition-colors"
                    aria-label={isBrowserFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                  >
                    {isBrowserFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
