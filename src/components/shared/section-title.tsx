import { motion } from 'framer-motion';
import { fadeInUp } from '@/lib/motion';
import { cn } from '@/lib/utils';

interface SectionTitleProps { eyebrow?: string; title: string; subtitle?: string; center?: boolean; className?: string; }

export default function SectionTitle({ eyebrow, title, subtitle, center = true, className }: SectionTitleProps) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      className={cn(center && 'text-center mx-auto', 'max-w-3xl', className)}
    >
      {eyebrow && <span className="inline-block px-4 py-1.5 rounded-full bg-primary-50 text-primary-700 text-sm font-semibold mb-4">{eyebrow}</span>}
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-secondary-900 mb-4">{title}</h2>
      {subtitle && <p className="text-base md:text-lg text-secondary-600 leading-relaxed">{subtitle}</p>}
    </motion.div>
  );
}
