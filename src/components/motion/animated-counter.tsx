import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

interface CounterProps { value: number; suffix?: string; label: string; }

export function CounterCard({ value, suffix = '', label }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let raf: number;
    const duration = 2000;
    const start = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(eased * value));
      if (progress < 1) raf = requestAnimationFrame(animate);
      else setDisplay(value);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);
  return <span ref={ref} className="!text-transparent">{display}{suffix}<span className="block text-sm font-normal text-blue-100/70">{label}</span></span>;
}
