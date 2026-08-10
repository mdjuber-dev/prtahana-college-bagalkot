import { motion } from 'framer-motion';
import { ArrowRight, Camera, Heart, Sparkles, Users } from 'lucide-react';
import { fadeInUp, staggerContainer } from '@/lib/motion';
import GradientButton from '@/components/shared/gradient-button';

const highlights = [
  { icon: Users, label: 'Cultural Events', description: 'Annual day, cultural fest & celebrations' },
  { icon: Sparkles, label: 'Science Exhibitions', description: 'Showcasing student innovations & projects' },
  { icon: Heart, label: 'Sports & Wellness', description: 'Sports day, yoga & fitness activities' },
];

export default function CampusExperience() {
  return (
    <section
      className="relative py-16 md:py-24 bg-gradient-to-br from-primary-800 via-primary-700 to-secondary-900 overflow-hidden"
      aria-label="Campus experience"
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-accent-500/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-primary-400/15 rounded-full blur-3xl" />
      </div>

      {/* Subtle pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="flex flex-col items-center text-center"
        >
          {/* Badge */}
          <motion.div variants={fadeInUp}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-500/20 border border-accent-400/30 text-accent-300 text-sm font-semibold mb-6">
              <Camera className="w-4 h-4" />
              Campus Life
            </span>
          </motion.div>

          {/* Title */}
          <motion.h2
            variants={fadeInUp}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4"
          >
            Experience Life at Prarthana
          </motion.h2>

          {/* Description */}
          <motion.p
            variants={fadeInUp}
            className="max-w-2xl text-base md:text-lg text-secondary-200 mb-10 leading-relaxed"
          >
            Beyond academics, our campus is a vibrant community where students grow, explore and
            create memories. From cultural events to sports and science exhibitions, there is
            always something exciting happening at Prarthana PU Science College.
          </motion.p>

          {/* Highlights */}
          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl mb-10"
          >
            {highlights.map((item) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.label}
                  variants={fadeInUp}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:bg-white/15 transition-all duration-300"
                >
                  <div className="w-12 h-12 mx-auto rounded-xl bg-accent-500/20 flex items-center justify-center mb-3">
                    <Icon className="w-6 h-6 text-accent-400" />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-1">
                    {item.label}
                  </h3>
                  <p className="text-sm text-secondary-300">
                    {item.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>

          {/* CTA */}
          <motion.div variants={fadeInUp}>
            <GradientButton to="/gallery" variant="accent" size="lg" ariaLabel="View campus gallery">
              View Gallery
              <ArrowRight className="ml-2 w-5 h-5" />
            </GradientButton>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
