import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  Award,
  Info,
  Check,
  FileText,
  Wallet,
  Home,
  Bus,
  Shirt,
  Building2,
  UtensilsCrossed,
  Wifi,
  ShieldCheck,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import PageHero from '@/components/shared/page-hero';
import SectionTitle from '@/components/shared/section-title';
import CTASection from '@/components/shared/cta-section';
import { scholarshipInfo } from '@/lib/fee-structure-data';
import { fadeInUp, staggerContainer } from '@/lib/motion';
import { cn } from '@/lib/utils';

type Stream = 'pcmb' | 'pcmc';

const streams: { key: Stream; label: string; description: string }[] = [
  { key: 'pcmb', label: 'PCMB', description: 'Physics, Chemistry, Mathematics & Biology' },
  { key: 'pcmc', label: 'PCMC', description: 'Physics, Chemistry, Mathematics & Computer Science' },
];

const publicFeeNotes = [
  'Fee structure and applicable charges are available from the college admissions office.',
  'Contact the college admissions office for detailed fee information and instalment guidance.',
  'Scholarship benefits are based on SSLC / 10th Board examination performance.',
  'Merit concessions and free-seat benefits are subject to eligibility, availability and Principal / Management approval.',
];

export default function FeeStructurePage() {
  const scholarships = scholarshipInfo;
  const [activeStream, setActiveStream] = useState<Stream>('pcmb');
  const selectedStream = streams.find((stream) => stream.key === activeStream) || streams[0];

  return (
    <>
      <PageHero
        eyebrow="Admissions 2026-27"
        title="Fee Structure"
        subtitle="Fee details are available on enquiry from the college admissions office. Merit scholarship opportunities are available for eligible students."
      />

      <section className="py-16 md:py-24 relative overflow-hidden" aria-labelledby="fee-title">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url(/images/classrooms/classroom-5.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-12 md:mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 text-primary-700 text-sm font-bold mb-4 border border-primary-100">
                <Wallet size={15} /> Academic Year 2026-27
              </span>
              <h2 id="fee-title" className="text-4xl md:text-5xl lg:text-6xl font-black text-secondary-900 mb-4 tracking-tight">
                Fee Structure <span className="text-gradient-accent">2026-27</span>
              </h2>
              <p className="text-xl md:text-2xl font-semibold text-primary-700 mb-3">
                Affordable Education with Merit Scholarships
              </p>
              <p className="text-secondary-500 text-base md:text-lg max-w-2xl mx-auto">
                Public fee amounts are available through the admissions office enquiry process for PCMB and PCMC streams.
              </p>
            </motion.div>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mt-10 mb-8" role="tablist" aria-label="Course streams">
            {streams.map((stream) => (
              <button
                key={stream.key}
                role="tab"
                aria-selected={activeStream === stream.key}
                aria-label={`Show fee enquiry details for ${stream.label}`}
                onClick={() => setActiveStream(stream.key)}
                className={cn(
                  'px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300',
                  activeStream === stream.key
                    ? 'bg-gradient-primary text-white shadow-glow'
                    : 'bg-white text-secondary-700 hover:bg-primary-50 hover:text-primary-900 shadow-soft'
                )}
              >
                {stream.label}
              </button>
            ))}
          </div>

          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="mb-12 bg-white rounded-3xl shadow-soft border border-primary-100/70 overflow-hidden"
          >
            <div className="bg-gradient-primary p-6 md:p-7">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center shrink-0">
                    <FileText className="text-white" size={26} aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-accent-300 text-xs font-bold uppercase tracking-[0.18em] mb-1">Fee Details</p>
                    <h3 className="text-xl md:text-2xl font-extrabold text-white mb-0.5">Contact College for Fee Details</h3>
                    <p className="text-primary-100 text-sm md:text-base max-w-xl">
                      Fee structure and applicable charges are available from the college admissions office.
                    </p>
                  </div>
                </div>

                <a
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white text-primary-800 font-black text-sm hover:bg-primary-50 transition-colors shadow-soft"
                >
                  Enquire for Fee Details <ArrowRight size={18} />
                </a>
              </div>
            </div>

            <div className="p-6 md:p-7 grid lg:grid-cols-[1.1fr_0.9fr] gap-6">
              <div className="rounded-2xl bg-primary-50 border border-primary-100 p-5 md:p-6">
                <div className="flex items-center gap-2 mb-2">
                  <GraduationCap size={18} className="text-primary-700" />
                  <p className="text-xs font-bold uppercase tracking-wider text-primary-700">{selectedStream.label}</p>
                </div>
                <h4 className="text-2xl font-black text-secondary-900 mb-2">{selectedStream.description}</h4>
                <p className="text-sm text-secondary-600 leading-relaxed">
                  Admissions office staff will share the latest applicable fee structure, available payment guidance, and scholarship eligibility details for this stream.
                </p>
              </div>

              <div className="relative rounded-2xl bg-gradient-accent p-5 md:p-6 text-white overflow-hidden shadow-lg shadow-accent-500/30">
                <div className="relative">
                  <div className="flex items-center gap-2 mb-3">
                    <Award size={18} className="text-accent-100" />
                    <p className="text-xs font-bold uppercase tracking-wider text-accent-100">Merit Scholarship 2026-27</p>
                  </div>
                  <p className="text-4xl md:text-5xl font-black text-white tracking-tight">95% & Above</p>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="rounded-xl bg-white/15 border border-white/20 p-3">
                      <p className="text-2xl font-black">First 25</p>
                      <p className="text-xs font-bold uppercase text-white/75">Eligible Students</p>
                    </div>
                    <div className="rounded-xl bg-white text-accent-700 p-3">
                      <p className="text-2xl font-black">Free Seats</p>
                      <p className="text-xs font-bold uppercase text-accent-600">With Approval</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="mt-14 max-w-5xl mx-auto"
          >
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-100 mb-3">
                <Building2 className="text-primary-800" size={24} />
              </div>
              <h3 className="text-2xl md:text-3xl font-extrabold text-secondary-900 mb-2">Optional Services & Facilities</h3>
              <p className="text-secondary-500 text-base max-w-2xl mx-auto">Enhance your college experience with premium optional facilities. Applicable charges are shared through admissions enquiry.</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-primary-100/60 hover:shadow-soft hover:border-primary-200 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                    <Home className="text-white" size={22} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-secondary-900">Hostel Facility</h4>
                    <p className="text-accent-600 font-bold text-sm">Separate for Boys & Girls</p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-secondary-600 mb-4">
                  <li className="flex items-start gap-2"><ShieldCheck className="text-primary-500 shrink-0 mt-0.5" size={14} /> Security and warden supervision</li>
                  <li className="flex items-start gap-2"><UtensilsCrossed className="text-primary-500 shrink-0 mt-0.5" size={14} /> Nutritious meals</li>
                  <li className="flex items-start gap-2"><Wifi className="text-primary-500 shrink-0 mt-0.5" size={14} /> Wi-Fi and study rooms</li>
                </ul>
                <div className="pt-3 border-t border-secondary-100 flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-secondary-500">Facility Charges</span>
                  <span className="font-black text-primary-800 text-right">Available on enquiry</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-primary-100/60 hover:shadow-soft hover:border-primary-200 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-500 to-orange-600 flex items-center justify-center">
                    <Bus className="text-white" size={22} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-secondary-900">Transport Service</h4>
                    <p className="text-primary-600 font-bold text-sm">City & Nearby Routes</p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-secondary-600 mb-4">
                  <li className="flex items-start gap-2"><ShieldCheck className="text-primary-500 shrink-0 mt-0.5" size={14} /> GPS-tracked buses</li>
                  <li className="flex items-start gap-2"><Check className="text-primary-500 shrink-0 mt-0.5" size={14} /> Experienced drivers and conductors</li>
                  <li className="flex items-start gap-2"><Check className="text-primary-500 shrink-0 mt-0.5" size={14} /> Bagalkot and nearby routes</li>
                </ul>
                <div className="pt-3 border-t border-secondary-100 flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-secondary-500">Facility Charges</span>
                  <span className="font-black text-primary-800 text-right">Available on enquiry</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-primary-100/60 hover:shadow-soft hover:border-primary-200 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center">
                    <Shirt className="text-white" size={22} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-secondary-900">College Uniform</h4>
                    <p className="text-secondary-500 font-bold text-sm">Prescribed dress code</p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-secondary-600 mb-4">
                  <li className="flex items-start gap-2"><Check className="text-primary-500 shrink-0 mt-0.5" size={14} /> Shirts / blouses</li>
                  <li className="flex items-start gap-2"><Check className="text-primary-500 shrink-0 mt-0.5" size={14} /> Pants / skirts</li>
                  <li className="flex items-start gap-2"><Check className="text-primary-500 shrink-0 mt-0.5" size={14} /> Premium quality fabric</li>
                </ul>
                <div className="pt-3 border-t border-secondary-100 flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-secondary-500">Facility Charges</span>
                  <span className="font-black text-primary-800 text-right">Available on enquiry</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-primary-50/60" aria-labelledby="scholarships-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Merit Scholarship 2026-27"
            title="Scholarships Available"
            subtitle="The 95% and above free-seat benefit is the main merit highlight for eligible SSLC / 10th Board performers."
          />

          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="mt-12 rounded-3xl bg-gradient-primary text-white p-6 md:p-8 shadow-glow"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
                  <Sparkles size={28} className="text-accent-200" />
                </div>
                <div>
                  <p className="text-accent-200 text-xs font-black uppercase tracking-[0.18em] mb-2">Main Highlight</p>
                  <h3 className="text-4xl md:text-6xl font-black tracking-tight">95% & Above</h3>
                  <p className="text-primary-100 mt-2">First 25 eligible students qualify for free-seat consideration.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="rounded-2xl bg-white/15 border border-white/20 px-5 py-4">
                  <p className="text-3xl md:text-5xl font-black">First 25</p>
                  <p className="text-xs font-bold uppercase text-white/75">Eligible Students</p>
                </div>
                <div className="rounded-2xl bg-accent-500 px-5 py-4 shadow-lg">
                  <p className="text-3xl md:text-5xl font-black">Free Seats</p>
                  <p className="text-xs font-bold uppercase text-white/80">Subject to Approval</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="grid sm:grid-cols-3 gap-6 mt-8"
          >
            {scholarships.slice(1).map((scholarship) => (
              <motion.div
                key={scholarship.name}
                variants={fadeInUp}
                className="bg-white rounded-2xl p-6 shadow-soft border border-primary-100/50"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-accent flex items-center justify-center mb-4">
                  <Award className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-black text-secondary-900 mb-2">{scholarship.name}</h3>
                <p className="text-sm text-secondary-600 mb-4">{scholarship.eligibility}</p>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-700 text-primary-50 text-xs font-bold">
                  <Check size={14} /> {scholarship.discount}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-24" aria-labelledby="notes-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                <Info className="text-primary-800" size={24} />
              </div>
              <h2 id="notes-title" className="text-2xl md:text-3xl font-bold text-secondary-900">
                Important Fee Notes
              </h2>
            </div>
            <motion.ul
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              className="space-y-4"
            >
              {publicFeeNotes.map((note) => (
                <motion.li
                  key={note}
                  variants={fadeInUp}
                  className="flex items-start gap-3 bg-white rounded-xl p-4 shadow-soft border border-secondary-100"
                >
                  <GraduationCap className="text-primary-600 shrink-0 mt-0.5" size={20} />
                  <span className="text-sm text-secondary-700 leading-relaxed">{note}</span>
                </motion.li>
              ))}
            </motion.ul>
          </div>
        </div>
      </section>

      <CTASection
        title="Questions About Fees?"
        subtitle="Contact the college admissions office for detailed fee information, scholarship eligibility and instalment guidance."
      />
    </>
  );
}
