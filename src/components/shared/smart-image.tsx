import { useState, useEffect, useRef, type ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { siteConfig } from '@/lib/site-config';
import { getMediaUrl } from '@/lib/media-url';

interface SmartImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'onError'> {
  fallbackSrc?: string;
  aspectClass?: string;
}

const defaultFallback = '/images/about/prathanaclg-pht.png';

export default function SmartImage({
  src,
  alt,
  fallbackSrc = defaultFallback,
  className,
  aspectClass,
  loading = 'lazy',
  ...rest
}: SmartImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setCurrentSrc(src);
    setLoaded(false);
  }, [src]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { rootMargin: '50px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={cn('relative overflow-hidden', !loaded && 'shimmer-bg', aspectClass, className)}
    >
      <img
        ref={ref}
        src={inView ? getMediaUrl(currentSrc) : undefined}
        alt={alt}
        loading={loading}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (currentSrc !== fallbackSrc) {
            setCurrentSrc(fallbackSrc);
            setLoaded(false);
          } else {
            setLoaded(true);
          }
        }}
        className={cn('w-full h-full object-cover transition-opacity duration-500', loaded ? 'opacity-100' : 'opacity-0')}
        {...rest}
      />
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-secondary-100">
          <img
            src={getMediaUrl(siteConfig.logo)}
            alt=""
            aria-hidden="true"
            className="w-12 h-12 object-contain opacity-30"
            width={48}
            height={48}
          />
        </div>
      )}
    </div>
  );
}
