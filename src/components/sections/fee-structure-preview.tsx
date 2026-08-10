import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet,
  Award,
  ArrowRight,
  Beaker,
  Atom,
  GraduationCap,
  Info,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { fadeInUp, staggerContainer } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { scholarshipInfo } from '@/lib/fee-structure-data';

interface CourseFee {
  code: string;
  name: string;
  description: string;
  icon: LucideIcon;
  seats: number;
}

const courses: CourseFee[] = [
  {
    code: 'PCMB',
    name: 'PCMB',
    description: 'Physics, Chemistry, Mathematics & Biology - ideal for medical and engineering aspirants.',
    icon: Beaker,
    seats: 120,
  },
  {
    code: 'PCMC',
    name: 'PCMC',
    description: 'Physics, Chemistry, Mathematics & Computer Science - perfect for engineering and tech careers.',
    icon: Atom,
    seats: 120,
  },
];

export default function FeeStructurePreview() {
  const scholarships = scholarshipInfo;
  const [active, setActive] = useState('PCMB');
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const scrollToCard = (code: string) => {
    setActive(code);
    cardRefs.current[code]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-white to-primary-50/40" aria-labelledby="fee-section-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 text-primary-700 text-sm font-semibold mb-4">
            <Wallet size={16} /> Academic Year 2026-27
          </div>
          <h2 id="fee-section-title" className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-secondary-900 mb-3 tracking-tight">
            Fee Structure 2026-27
          </h2>
          <p className="text-lg md:text-xl font-bold text-primary-800 mb-2">
            Affordable Education with Merit Scholarships
          </p>
          <p className="text-sm md:text-base text-secondary-500 max-w-2xl mx-auto">
            Fee details are available on enquiry. Merit scholarship opportunities are available for eligible SSLC / 10th Board performers.
          </p>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="flex flex-wrap justify-center gap-3 md:gap-4 mb-12"
        >
          {courses.map((course) => (
            <button
              key={course.code}
              onClick={() => scrollToCard(course.code)}
              className={cn(
                'px-6 py-2.5 rounded-full font-semibold text-sm border-2 transition-all duration-300 hover:scale-105',
                active === course.code
                  ? 'bg-primary-600 text-white border-primary-600 shadow-glow'
                  : 'bg-transparent text-primary-700 border-primary-300 hover:bg-primary-50 hover:border-primary-500'
              )}
            >
              {course.code}
            </button>
          ))}
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="grid sm:grid-cols-2 gap-6 mb-12"
        >
          {courses.map((course) => {
            const Icon = course.icon;
            return (
              <motion.div
                key={course.code}
                ref={(el) => { cardRefs.current[course.code] = el; }}
                variants={fadeInUp}
                className={cn(
                  'group bg-white rounded-2xl p-6 shadow-soft border border-secondary-100 flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-glow',
                  active === course.code && 'ring-2 ring-primary-500'
                )}
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center mb-4">
                  <Icon size={26} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-secondary-900 mb-2">{course.name}</h3>
                <p className="text-sm text-secondary-600 mb-4 flex-grow">{course.description}</p>

                <div className="space-y-3 mb-4 text-sm">
                  <div className="rounded-xl bg-primary-50 border border-primary-100 p-3">
                    <div className="flex items-start gap-2">
                      <Info size={16} className="text-primary-700 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-secondary-900 block">Fee details available on enquiry</span>
                        <span className="text-secondary-500 text-xs">Contact the Admissions Office for the latest fee structure.</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-500">Seats Available</span>
                    <span className="font-semibold text-primary-600">{course.seats}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-auto">
                  <a
                    href="/contact"
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors"
                  >
                    Enquire About Fees <ArrowRight size={16} />
                  </a>
                  <a
                    href="/fee-structure"
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary-50 text-primary-700 text-sm font-semibold hover:bg-primary-100 transition-colors"
                  >
                    View Details
                  </a>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="max-w-5xl mx-auto bg-white rounded-2xl shadow-soft border border-primary-100 overflow-hidden mb-10"
        >
          <div className="bg-gradient-primary text-white px-6 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Award size={30} />
              <div>
                <p className="text-accent-200 text-xs font-black uppercase tracking-[0.18em]">Merit Scholarship 2026-27</p>
                <h3 className="text-2xl md:text-3xl font-black">95% & Above</h3>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-xl bg-white/15 border border-white/20 px-4 py-3">
                <p className="text-3xl md:text-4xl font-black">First 25</p>
                <p className="text-xs font-bold uppercase text-white/75">Eligible Students</p>
              </div>
              <div className="rounded-xl bg-accent-500 text-white px-4 py-3 shadow-lg">
                <p className="text-3xl md:text-4xl font-black">Free Seats</p>
                <p className="text-xs font-bold uppercase text-white/80">Subject to Approval</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-5">
            <div className="rounded-2xl bg-accent-50 border border-accent-100 p-5 flex items-start gap-3">
              <Sparkles className="text-accent-600 shrink-0 mt-1" size={22} />
              <div>
                <h4 className="text-lg font-black text-secondary-900">Free-seat benefit for top merit students</h4>
                <p className="text-sm text-secondary-600">Scholarship benefits are based on SSLC / 10th Board examination performance.</p>
              </div>
            </div>

            {scholarships.slice(1).map((tier) => (
              <div key={tier.name} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-secondary-100 last:border-0 last:pb-0">
                <div>
                  <span className="font-bold text-secondary-900 text-base md:text-lg block">{tier.name}</span>
                  <span className="text-secondary-500 text-xs md:text-sm">{tier.eligibility}</span>
                </div>
                <span className="text-secondary-700 text-sm md:text-base font-semibold flex items-center gap-2 sm:text-right">
                  <ArrowRight size={16} className="text-primary-500 shrink-0 hidden sm:block" />
                  {tier.discount}
                </span>
              </div>
            ))}

            <p className="text-sm text-secondary-500 italic pt-2">
              Merit concessions and free-seat benefits are subject to eligibility, availability and approval by the Principal / Management. Terms and conditions may apply.
            </p>
            <p className="text-sm text-secondary-500 italic">
              Scholarship benefits are based on SSLC / 10th Board examination performance.
            </p>
          </div>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="flex flex-col sm:flex-row justify-center gap-4"
        >
          <a
            href="/contact"
            className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white text-primary-700 border-2 border-primary-300 font-semibold hover:bg-primary-50 hover:border-primary-500 transition-all duration-300"
          >
            <GraduationCap size={20} /> Enquire for Fee Details
          </a>
          <a
            href="/admission"
            className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-primary-600 text-white font-semibold shadow-glow hover:bg-primary-700 transition-all duration-300"
          >
            Apply for Admission <ArrowRight size={20} />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
