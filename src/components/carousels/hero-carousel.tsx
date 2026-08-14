import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAutoCarousel } from '@/hooks/use-auto-carousel';
import { getMediaUrl } from '@/lib/media-url';

interface HeroSlide { src: string; alt: string; title: string; }
interface HeroCarouselProps {
  slides: HeroSlide[];
  interval?: number;
  children?: React.ReactNode;
}

export default function HeroCarousel({ slides, interval = 4000, children }: HeroCarouselProps) {
  const { index, next, prev, goTo, handleMouseEnter, handleMouseLeave, handleTouchStart, handleTouchEnd } =
    useAutoCarousel({ totalItems: slides.length, interval, pauseOnHover: true });

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-roledescription="carousel"
      aria-label="Campus highlights"
    >
      <AnimatePresence mode="sync">
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
          className="absolute inset-0"
          style={{ willChange: 'opacity, transform' }}
        >
          <img
            src={getMediaUrl(slides[index].src)}
            alt={slides[index].alt}
            className="w-full h-full object-cover"
            loading={index === 0 ? 'eager' : 'lazy'}
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900/80 via-primary-800/60 to-secondary-900/70" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 h-full flex flex-col justify-center">{children}</div>

      <button
        onClick={prev}
        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full glass flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={next}
        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full glass flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight size={24} />
      </button>

      <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2" role="tablist" aria-label="Carousel pagination">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`h-2 rounded-full transition-all duration-300 ${i === index ? 'w-8 bg-accent-400' : 'w-2 bg-white/50 hover:bg-white/80'}`}
            role="tab"
            aria-selected={i === index}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
