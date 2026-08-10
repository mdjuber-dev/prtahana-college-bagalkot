import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, Stethoscope, FlaskConical } from 'lucide-react';
import { staggerContainer, fadeInUp } from '@/lib/motion';

interface Counter {
  icon: typeof Users;
  target: number;
  suffix: string;
  label: string;
}

const counters: Counter[] = [
  { icon: Users, target: 500, suffix: '+', label: 'Students Enrolled' },
  { icon: TrendingUp, target: 95, suffix: '%', label: 'Board Results' },
  { icon: Stethoscope, target: 200, suffix: '+', label: 'NEET Selections' },
  { icon: FlaskConical, target: 150, suffix: '+', label: 'KCET Selections' },
];

function useCountUp(target: number, inView: boolean, duration = 2000): number {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let startTime: number | null = null;
    let rafId: number;
    const animate = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // easeOutExpo for a premium feel
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(eased * target));
      if (progress < 1) rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [inView, target, duration]);
  return count;
}

function CounterCard({ counter, inView }: { counter: Counter; inView: boolean }) {
  const Icon = counter.icon;
  const value = useCountUp(counter.target, inView);
  return (
    <motion.div
      variants={fadeInUp}
      className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 sm:p-8 text-center border border-white/20 hover:bg-white/15 transition-colors duration-300"
    >
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-accent-400 text-secondary-900 mb-4">
        <Icon size={28} strokeWidth={2} aria-hidden="true" />
      </div>
      <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2">
        {value}
        {counter.suffix}
      </p>
      <p className="text-sm sm:text-base text-primary-100 font-medium">{counter.label}</p>
    </motion.div>
  );
}

export default function AchievementCounters() {
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-16 md:py-24 bg-gradient-primary relative overflow-hidden"
      aria-labelledby="achievement-counters-title"
    >
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-10" aria-hidden="true">
        <div className="absolute top-0 right-0 w-72 h-72 bg-accent-400 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary-300 rounded-full blur-3xl" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="text-center mb-10 md:mb-14"
        >
          <h2 id="achievement-counters-title" className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Our Impact in Numbers
          </h2>
          <p className="text-base md:text-lg text-primary-100 max-w-2xl mx-auto">
            Measurable results that reflect our commitment to academic excellence and student success.
          </p>
        </motion.div>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {counters.map((counter) => (
            <CounterCard key={counter.label} counter={counter} inView={inView} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
