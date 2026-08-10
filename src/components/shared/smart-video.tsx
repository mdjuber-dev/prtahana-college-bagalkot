import { useState, useRef, useEffect } from 'react';
import { Play, VideoOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SmartVideoProps {
  src: string;
  poster?: string;
  title: string;
  className?: string;
}

export default function SmartVideo({ src, poster, title, className }: SmartVideoProps) {
  const [inView, setInView] = useState(false);
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { rootMargin: '100px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (failed) {
    return (
      <div className={cn('relative rounded-2xl overflow-hidden bg-secondary-100 aspect-video flex flex-col items-center justify-center', className)}>
        {poster && (
          <img
            src={poster}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover opacity-40"
            loading="lazy"
            decoding="async"
          />
        )}
        <div className="relative z-10 text-center px-4">
          <VideoOff className="mx-auto text-secondary-400 mb-2" size={32} />
          <p className="text-sm font-medium text-secondary-500">Video unavailable.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative rounded-2xl overflow-hidden bg-secondary-100', !loaded && 'shimmer-bg', className)}>
      <video
        ref={ref}
        src={inView ? src : undefined}
        poster={poster}
        controls
        preload="none"
        onLoadedData={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className="w-full aspect-video object-cover"
        aria-label={title}
      />
      {!loaded && inView && !failed && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
          <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center">
            <Play className="text-primary-700 ml-1" size={24} fill="currentColor" />
          </div>
        </div>
      )}
    </div>
  );
}
