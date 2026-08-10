import { motion } from 'framer-motion';
import { ArrowRight, BookOpen } from 'lucide-react';
import HeroCarousel from '@/components/carousels/hero-carousel';
import GradientButton from '@/components/shared/gradient-button';
import { heroImages } from '@/data/hero-images';
import { fadeInUp } from '@/lib/motion';
import { useCMS } from '@/lib/cms-context';

const stats = [
  { value: '2015', label: 'Established' },
  { value: '500+', label: 'Students' },
  { value: '95%', label: 'Results' },
  { value: '100+', label: 'Faculty' },
];

export default function HeroSection() {
  const cms = useCMS();
  const config = cms.siteConfig;
  const slides = cms.heroImages?.length ? cms.heroImages : heroImages;
  const title = cms.hero?.title || config.name;
  const subtitle = cms.hero?.subtitle || 'Best PU Science College in Bagalkot, Karnataka';
  const badge = cms.hero?.badge || 'Integrated Coaching for NEET, KCET & JEE | Admissions Open 2026-27';

  return (
    <section className="relative h-screen min-h-[600px] w-full overflow-hidden" aria-labelledby="hero-title">
      <HeroCarousel slides={slides} interval={4000}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.img
            src={config.logo}
            alt={`${config.name} logo`}
            className="w-20 h-20 md:w-24 md:h-24 mx-auto rounded-full object-contain mb-6 border-4 border-white/20 bg-white/10"
            width={96}
            height={96}
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
          />
          <motion.h1
            id="hero-title"
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
          >
            {title}
          </motion.h1>
          <motion.p
            className="text-lg md:text-2xl text-white/90 mb-2"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
          >
            {subtitle}
          </motion.p>
          <motion.p
            className="text-sm md:text-lg text-accent-300 mb-8"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
          >
            {badge}
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.4 }}
          >
            <GradientButton to="/admission" size="lg" variant="accent">Apply Now <ArrowRight className="ml-2 inline" size={20} /></GradientButton>
            <GradientButton to="/courses" size="lg" variant="white"><BookOpen className="mr-2 inline" size={20} /> Explore Courses</GradientButton>
          </motion.div>
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 max-w-3xl mx-auto"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.5 }}
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl md:text-3xl font-bold text-accent-400">{stat.value}</p>
                <p className="text-xs md:text-sm text-white/70">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </HeroCarousel>
    </section>
  );
}
