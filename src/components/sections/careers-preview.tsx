import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Briefcase, GraduationCap, Users } from 'lucide-react';
import { fadeInUp } from '@/lib/motion';

export default function CareersPreview() {
  return (
    <section className="py-16 md:py-20 bg-white" aria-labelledby="careers-preview-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="rounded-3xl bg-gradient-to-br from-primary-900 to-primary-950 text-white p-6 md:p-10 shadow-soft overflow-hidden relative"
        >
          <div className="relative grid lg:grid-cols-[1fr_auto] gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-accent-300 text-xs font-bold mb-4 border border-white/15">
                <Briefcase size={14} /> Careers
              </div>
              <h2 id="careers-preview-title" className="text-3xl md:text-4xl font-black mb-3">Join Our Team</h2>
              <p className="text-primary-100 max-w-2xl leading-relaxed">
                We are always looking for passionate educators and talented professionals who want to help shape the next generation of learners.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-3">
              <div className="rounded-2xl bg-white/10 border border-white/15 p-4 flex items-center gap-3">
                <GraduationCap className="text-accent-300" size={24} />
                <span className="font-bold">Teaching Roles</span>
              </div>
              <div className="rounded-2xl bg-white/10 border border-white/15 p-4 flex items-center gap-3">
                <Users className="text-accent-300" size={24} />
                <span className="font-bold">Staff Opportunities</span>
              </div>
            </div>
          </div>
          <div className="relative mt-8">
            <Link
              to="/careers"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent-500 text-white font-black hover:bg-accent-600 transition-colors shadow-lg"
            >
              View Career Opportunities <ArrowRight size={18} />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
