import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface LazyImageProps {
  src: string; alt: string; title?: string; className?: string;
  width?: number; height?: number; sizes?: string;
  onClick?: () => void; onKeyDown?: (e: React.KeyboardEvent) => void;
  tabIndex?: number; role?: string; 'aria-label'?: string;
}

export default function LazyImage({ src, alt, title, className, width, height, sizes, onClick, onKeyDown, tabIndex, role, 'aria-label': ariaLabel }: LazyImageProps) {
  const [inView, setInView] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); observer.disconnect(); }
    }, { rootMargin: '50px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={cn('relative overflow-hidden', !loaded && 'shimmer-bg', className)}
      style={width && height ? { aspectRatio: `${width} / ${height}` } : undefined}
    >
      <img
        ref={ref}
        src={inView ? src : undefined}
        alt={alt}
        title={title || alt}
        width={width}
        height={height}
        sizes={sizes}
        loading="lazy"
        decoding="async"
        onClick={onClick}
        onKeyDown={onKeyDown}
        tabIndex={tabIndex}
        role={role}
        aria-label={ariaLabel}
        onLoad={() => setLoaded(true)}
        className={cn('w-full h-full object-cover transition-opacity duration-500', loaded ? 'opacity-100' : 'opacity-0')}
      />
    </div>
  );
}
