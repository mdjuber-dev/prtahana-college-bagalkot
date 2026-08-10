import { useState, useRef, useEffect, useCallback } from 'react';

interface MarqueeCarouselProps {
  children: React.ReactNode;
  speed?: number;
  pauseOnHover?: boolean;
}

export default function MarqueeCarousel({ children, speed = 40, pauseOnHover = true }: MarqueeCarouselProps) {
  const [paused, setPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const offsetRef = useRef(0);
  const halfWidthRef = useRef(0);

  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const firstHalf = track.children[0] as HTMLElement | undefined;
    if (!firstHalf) return;
    halfWidthRef.current = firstHalf.offsetWidth;
  }, []);

  useEffect(() => {
    measure();
    const handleResize = () => measure();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [measure]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    if (halfWidthRef.current === 0) {
      const measureTimer = setTimeout(() => measure(), 100);
      return () => clearTimeout(measureTimer);
    }

    const animate = () => {
      if (!paused && halfWidthRef.current > 0) {
        offsetRef.current -= speed / 60;
        if (Math.abs(offsetRef.current) >= halfWidthRef.current) {
          offsetRef.current += halfWidthRef.current;
        }
        track.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [speed, paused, measure]);

  return (
    <div
      className="relative overflow-hidden"
      onMouseEnter={() => pauseOnHover && setPaused(true)}
      onMouseLeave={() => pauseOnHover && setPaused(false)}
      aria-roledescription="marquee"
      aria-label="Achievers marquee"
    >
      <div ref={trackRef} className="marquee-track" style={{ transform: 'translate3d(0, 0, 0)' }}>
        <div className="flex shrink-0">{children}</div>
        <div className="flex shrink-0" aria-hidden="true">{children}</div>
      </div>
    </div>
  );
}
