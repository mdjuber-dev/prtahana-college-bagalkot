import { useState, useEffect, useCallback, useRef } from 'react';

interface UseAutoCarouselOptions {
  totalItems: number;
  interval?: number;
  pauseOnHover?: boolean;
  infinite?: boolean;
  visibleSlides?: number;
}

export function useAutoCarousel({
  totalItems,
  interval = 4000,
  pauseOnHover = true,
  infinite = false,
  visibleSlides = 3,
}: UseAutoCarouselOptions) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [displayIndex, setDisplayIndex] = useState(infinite ? visibleSlides : 0);
  const [animating, setAnimating] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const totalSlides = infinite ? totalItems + visibleSlides * 2 : totalItems;
  const offset = infinite ? visibleSlides : 0;

  const next = useCallback(() => {
    setDisplayIndex((prev) => {
      const next = prev + 1;
      if (infinite && next >= totalItems + offset) {
        setAnimating(false);
        setIndex(totalItems - 1);
        return offset;
      }
      if (infinite) setIndex(next - offset);
      return next;
    });
  }, [totalItems, infinite, offset]);

  const prev = useCallback(() => {
    setDisplayIndex((prev) => {
      const next = prev - 1;
      if (infinite && next < offset) {
        setAnimating(false);
        setIndex(0);
        return totalItems - 1 + offset;
      }
      if (infinite) setIndex(next - offset);
      return next;
    });
  }, [totalItems, infinite, offset]);

  const goTo = useCallback(
    (i: number) => {
      if (infinite) {
        setIndex(i);
        setDisplayIndex(i + offset);
      } else {
        setIndex(i);
      }
    },
    [infinite, offset]
  );

  useEffect(() => {
    if (paused || totalItems <= 1 || !infinite) return;
    intervalRef.current = setInterval(next, interval);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [paused, next, interval, totalItems, infinite]);

  useEffect(() => {
    if (!animating) {
      const timer = setTimeout(() => setAnimating(true), 50);
      return () => clearTimeout(timer);
    }
  }, [animating]);

  const handleMouseEnter = useCallback(() => {
    if (pauseOnHover) setPaused(true);
  }, [pauseOnHover]);

  const handleMouseLeave = useCallback(() => {
    if (pauseOnHover) setPaused(false);
  }, [pauseOnHover]);

  const touchStartX = useRef(0);
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const diff = touchStartX.current - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) next();
        else prev();
      }
    },
    [next, prev]
  );

  return {
    index,
    displayIndex: infinite ? displayIndex : index,
    totalSlides: infinite ? totalSlides : totalItems,
    animating,
    paused,
    next,
    prev,
    goTo,
    handleMouseEnter,
    handleMouseLeave,
    handleTouchStart,
    handleTouchEnd,
  };
}
