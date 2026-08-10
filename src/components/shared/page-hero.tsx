import { motion } from 'framer-motion';
import { fadeInUp } from '@/lib/motion';

interface PageHeroProps { title: string; subtitle?: string; eyebrow?: string; }

export default function PageHero({ title, subtitle, eyebrow }: PageHeroProps) {
  return (
    <motion.section
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="relative pt-28 pb-16 md:pt-36 md:pb-20 bg-gradient-hero overflow-hidden"
      aria-labelledby="page-hero-title"
    >
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-400 rounded-full blur-3xl" />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {eyebrow && <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-white text-sm font-semibold mb-4 backdrop-blur-sm">{eyebrow}</span>}
        <h1 id="page-hero-title" className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">{title}</h1>
        {subtitle && <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">{subtitle}</p>}
      </div>
    </motion.section>
  );
}
