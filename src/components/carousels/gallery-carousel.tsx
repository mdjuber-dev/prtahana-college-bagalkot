import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAutoCarousel } from '@/hooks/use-auto-carousel';
import LazyImage from '@/components/gallery/lazy-image';

interface GalleryCarouselProps {
  images: { src: string; alt: string; title: string; width?: number; height?: number }[];
  onImageClick?: (index: number) => void;
  interval?: number;
}

export default function GalleryCarousel({ images, onImageClick, interval = 3000 }: GalleryCarouselProps) {
  const VISIBLE = 3;
  const {
    index,
    displayIndex,
    animating,
    next,
    prev,
    goTo,
    handleMouseEnter,
    handleMouseLeave,
    handleTouchStart,
    handleTouchEnd,
  } = useAutoCarousel({ totalItems: images.length, interval, pauseOnHover: true, infinite: true, visibleSlides: VISIBLE });

  const clonesEnd = images.slice(-VISIBLE);
  const clonesStart = images.slice(0, VISIBLE);
  const trackItems = [...clonesStart, ...images, ...clonesEnd];

  return (
    <div
      className="relative overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-roledescription="carousel"
      aria-label="Gallery carousel"
    >
      <motion.div
        className="flex gap-4"
        animate={{ x: `calc(-${displayIndex} * (100% / 3 + 1rem * 100 / 3))` }}
        transition={{ type: 'tween', duration: animating ? 0.6 : 0, ease: [0.4, 0, 0.2, 1] }}
        style={{ willChange: 'transform' }}
      >
        {trackItems.map((image, i) => (
          <div
            key={i}
            className="flex-shrink-0 cursor-pointer"
            style={{ width: 'calc(100% / 3 - 1rem)' }}
            onClick={() => {
              const realIndex = i < VISIBLE ? images.length + i : i >= images.length + VISIBLE ? i - images.length - VISIBLE : i - VISIBLE;
              onImageClick?.(realIndex);
            }}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); const realIndex = i < VISIBLE ? images.length + i : i >= images.length + VISIBLE ? i - images.length - VISIBLE : i - VISIBLE; onImageClick?.(realIndex); } }}
            tabIndex={0}
            role="button"
            aria-label={`View image: ${image.title}`}
          >
            <LazyImage
              src={image.src}
              alt={image.alt}
              title={image.title}
              width={image.width || 800}
              height={image.height || 600}
              sizes="(max-width: 768px) 100vw, 33vw"
              className="aspect-[4/3] rounded-xl hover:scale-[1.02] transition-transform duration-300"
            />
          </div>
        ))}
      </motion.div>

      <button
        onClick={prev}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full glass flex items-center justify-center text-secondary-700 hover:bg-white transition-colors"
        aria-label="Previous images"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={next}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full glass flex items-center justify-center text-secondary-700 hover:bg-white transition-colors"
        aria-label="Next images"
      >
        <ChevronRight size={20} />
      </button>

      <div className="flex justify-center gap-2 mt-4" role="tablist" aria-label="Gallery pagination">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`h-2 rounded-full transition-all duration-300 ${i === index ? 'w-6 bg-primary-600' : 'w-2 bg-secondary-300 hover:bg-secondary-400'}`}
            role="tab"
            aria-selected={i === index}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
