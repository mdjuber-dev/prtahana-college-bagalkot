import { motion } from 'framer-motion';
import { Award, Users, BookOpen, Target } from 'lucide-react';
import { staggerContainer, fadeInUp } from '@/lib/motion';

interface Highlight {
  icon: typeof Award;
  stat: string;
  label: string;
}

const highlights: Highlight[] = [
  { icon: Award, stat: '10+', label: 'Years of Excellence' },
  { icon: Users, stat: '500+', label: 'Happy Students' },
  { icon: BookOpen, stat: '3', label: 'Science Streams' },
  { icon: Target, stat: '95%', label: 'Success Rate' },
];

export default function QuickHighlights() {
  return (
    <section className="py-16 md:py-20 bg-white" aria-labelledby="quick-highlights-title">
      <h2 id="quick-highlights-title" className="sr-only">Quick Highlights</h2>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {highlights.map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                variants={fadeInUp}
                className="bg-white rounded-2xl p-5 sm:p-7 card-shadow hover:shadow-premium transition-shadow duration-300 text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-primary text-white mb-4">
                  <Icon size={24} strokeWidth={2} aria-hidden="true" />
                </div>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-secondary-900 mb-1">
                  {item.stat}
                </p>
                <p className="text-sm sm:text-base text-secondary-600 font-medium">{item.label}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
