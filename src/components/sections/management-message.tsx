import { motion } from 'framer-motion';
import { Quote, Sparkles } from 'lucide-react';
import { fadeInUp, slideInLeft, slideInRight } from '@/lib/motion';
import SectionTitle from '@/components/shared/section-title';

export default function ManagementMessage() {
  return (
    <section
      className="relative py-16 md:py-24 bg-gradient-to-br from-secondary-900 via-primary-800 to-primary-700 overflow-hidden"
      aria-label="Principal's message"
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-primary-400/10 rounded-full blur-3xl" />
      </div>

      {/* Subtle dot pattern */}
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
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-center">
          {/* Left column - photo placeholder */}
          <motion.div
            variants={slideInLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="lg:col-span-2 flex justify-center"
          >
            <div className="relative">
              {/* Photo placeholder */}
              <div className="w-64 h-64 md:w-72 md:h-72 rounded-2xl overflow-hidden bg-gradient-to-br from-primary-400/20 to-accent-400/20 border border-white/20 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center">
                  <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center mb-4">
                    <span className="text-3xl font-bold text-white">SH</span>
                  </div>
                  <p className="text-sm text-secondary-200">Principal's Photo</p>
                </div>
              </div>

              {/* Accent ring */}
              <div className="absolute inset-0 rounded-2xl border-2 border-accent-400/30" />

              {/* Floating badge */}
              <div className="absolute -bottom-4 -right-4 bg-accent-500 rounded-xl shadow-glow p-3">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>

          {/* Right column - message */}
          <motion.div
            variants={slideInRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="lg:col-span-3"
          >
            <SectionTitle
              eyebrow="Principal's Message"
              title="Inspiring Excellence, Shaping Futures"
              center={false}
              className="[&_h2]:text-white [&_p]:text-secondary-200 [&_span]:bg-accent-500/20 [&_span]:text-accent-300 [&_span]:border-accent-400/30"
            />

            <div className="mt-6 relative">
              <Quote className="absolute -top-3 -left-3 w-12 h-12 text-accent-400/30" />

              <blockquote className="text-base md:text-lg text-secondary-200 leading-relaxed pl-8">
                &ldquo;Welcome to Prarthana PU Science College, where we transform dreams into
                reality. Education is not just about passing exams; it is about building
                character, developing critical thinking and nurturing a lifelong love for
                learning. Our dedicated faculty and staff work tirelessly to ensure that every
                student who walks through our doors leaves with the knowledge, skills and
                confidence to succeed in their chosen path. Together, we are building a
                community of learners who will shape the future of our nation.&rdquo;
              </blockquote>
            </div>

            <div className="mt-6 pl-8">
              <p className="text-lg font-bold text-white">Dr. Suresh Hiremath</p>
              <p className="text-sm text-accent-300 font-medium">
                Principal, Prarthana PU Science College, Bagalkot
              </p>
            </div>

            {/* Stats inline */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="mt-8 flex flex-wrap gap-6 pl-8"
            >
              <div>
                <p className="text-2xl font-bold text-accent-400">10+</p>
                <p className="text-xs text-secondary-300">Years of Experience</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-accent-400">5000+</p>
                <p className="text-xs text-secondary-300">Students Mentored</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-accent-400">100%</p>
                <p className="text-xs text-secondary-300">Dedication</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
