import { useState, useEffect, useCallback, useRef } from 'react';

interface UseAutoCarouselOptions {
  totalItems: number;
  interval?: number;
  pauseOnHover?: boolean;
}

export function useAutoCarousel({ totalItems, interval = 4000, pauseOnHover = true }: UseAutoCarouselOptions) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const next = useCallback(() => {
    setIndex((prev) => (prev + 1) % totalItems);
  }, [totalItems]);

  const prev = useCallback(() => {
    setIndex((prev) => (prev - 1 + totalItems) % totalItems);
  }, [totalItems]);

  const goTo = useCallback((i: number) => setIndex(i), []);

  useEffect(() => {
    if (paused || totalItems <= 1) return;
    intervalRef.current = setInterval(next, interval);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [paused, next, interval, totalItems]);

  const handleMouseEnter = useCallback(() => { if (pauseOnHover) setPaused(true); }, [pauseOnHover]);
  const handleMouseLeave = useCallback(() => { if (pauseOnHover) setPaused(false); }, [pauseOnHover]);

  const touchStartX = useRef(0);
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { if (diff > 0) next(); else prev(); }
  }, [next, prev]);

  return { index, paused, next, prev, goTo, handleMouseEnter, handleMouseLeave, handleTouchStart, handleTouchEnd };
}
