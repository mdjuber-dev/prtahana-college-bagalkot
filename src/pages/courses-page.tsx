import { motion } from 'framer-motion';
import {
  Atom, Calculator, Microscope, FlaskConical, Monitor, BookOpen,
  Clock, Users, Trophy, FileText, Target, CheckCircle2, GraduationCap,
} from 'lucide-react';
import PageHero from '@/components/shared/page-hero';
import SectionTitle from '@/components/shared/section-title';
import CTASection from '@/components/shared/cta-section';
import { fadeInUp, staggerContainer } from '@/lib/motion';
import { useCMS } from '@/lib/cms-context';

const courses = [
  {
    code: 'PCMB',
    title: 'Physics, Chemistry, Mathematics & Biology',
    description: 'An ideal combination for students aspiring to pursue careers in both medical and engineering fields.',
    subjects: [
      { icon: Atom, name: 'Physics' },
      { icon: FlaskConical, name: 'Chemistry' },
      { icon: Calculator, name: 'Mathematics' },
      { icon: Microscope, name: 'Biology' },
    ],
    careerPaths: ['MBBS & Medical', 'Engineering (B.Tech)', 'BSc Research', 'Biotechnology'],
    coaching: 'Includes integrated coaching for NEET, KCET & JEE',
    color: 'from-primary-700 via-primary-600 to-primary-800',
  },
  {
    code: 'PCMC',
    title: 'Physics, Chemistry, Mathematics & Computer Science',
    description: 'Perfect for students targeting engineering and technology-driven careers with a focus on computing.',
    subjects: [
      { icon: Atom, name: 'Physics' },
      { icon: FlaskConical, name: 'Chemistry' },
      { icon: Calculator, name: 'Mathematics' },
      { icon: Monitor, name: 'Computer Science' },
    ],
    careerPaths: ['B.E. / B.Tech', 'BSc Computer Science', 'BCA', 'Data Science'],
    coaching: 'Includes integrated coaching for NEET, KCET & JEE',
    color: 'from-accent-500 via-accent-600 to-primary-700',
  },
];

const coachingFeatures = [
  { icon: Target, title: 'Integrated Coaching', description: 'NEET, KCET, and JEE preparation seamlessly integrated with the PU board curriculum.' },
  { icon: Users, title: 'Expert Faculty', description: 'Highly qualified and experienced teachers dedicated to student success.' },
  { icon: FileText, title: 'Comprehensive Study Material', description: 'Well-researched notes, question banks, and reference materials for every subject.' },
  { icon: Clock, title: 'Regular Mock Tests', description: 'Weekly tests and full-length mock exams that simulate real exam conditions.' },
  { icon: Trophy, title: 'Performance Tracking', description: 'Individual progress monitoring with detailed analytics and parent-teacher meetings.' },
  { icon: CheckCircle2, title: 'Doubt Clearing Sessions', description: 'Dedicated sessions where students get one-on-one help with difficult topics.' },
];

export default function CoursesPage() {
  const cms = useCMS();
  const { pcmbDesc, pcmcDesc, pcmbCareers, pcmcCareers } = cms.coursesConfig;
  const coursesWithCms = courses.map((course) => ({
    ...course,
    description: course.code === 'PCMB' ? (pcmbDesc || course.description) : (pcmcDesc || course.description),
    careerPaths: course.code === 'PCMB'
      ? (pcmbCareers ? pcmbCareers.split(',').map((s) => s.trim()) : course.careerPaths)
      : (pcmcCareers ? pcmcCareers.split(',').map((s) => s.trim()) : course.careerPaths),
  }));

  return (
    <>
      <PageHero
        eyebrow="Academics"
        title="Our Courses"
        subtitle="Choose from our specialised PU Science combinations with integrated coaching for NEET, KCET & JEE."
      />

      {/* Course Cards */}
      <section className="py-16 md:py-24 relative overflow-hidden" aria-labelledby="courses-title">
        <div className="absolute inset-0 opacity-[0.025] pointer-events-none" style={{ backgroundImage: 'url(/images/campus/campus-3.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <SectionTitle
            eyebrow="PU Science Combinations"
            title="Choose Your Path"
            subtitle="We offer two carefully designed course combinations, each aligned with specific career goals."
          />
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="grid lg:grid-cols-2 gap-8 mt-12 max-w-5xl mx-auto"
          >
            {coursesWithCms.map((course) => (
              <motion.div
                key={course.code}
                variants={fadeInUp}
                className="bg-white rounded-3xl overflow-hidden card-shadow hover:shadow-premium transition-all duration-500 flex flex-col border border-primary-100/60 group hover:-translate-y-1"
              >
                {/* Header */}
                <div className={`bg-gradient-to-br ${course.color} p-8 text-white relative overflow-hidden`}>
                  <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-white/5 blur-3xl pointer-events-none" aria-hidden="true" />
                  <div className="absolute right-6 bottom-6 opacity-10">
                    {course.code === 'PCMB' ? <Microscope size={120} strokeWidth={1} /> : <Monitor size={120} strokeWidth={1} />}
                  </div>
                  <div className="relative">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-white/20 backdrop-blur-sm border border-white/30 mb-3">
                      {course.code === 'PCMB' ? 'Medical & Engineering' : 'Engineering & Technology'}
                    </span>
                    <h3 className="text-4xl md:text-5xl font-black mb-2 tracking-tight">{course.code}</h3>
                    <p className="text-white/90 text-base leading-relaxed max-w-sm">{course.title}</p>
                  </div>
                </div>
                {/* Body */}
                <div className="p-8 flex flex-col flex-grow">
                  <p className="text-secondary-700 text-[15px] leading-relaxed mb-7">{course.description}</p>

                  {/* Subjects */}
                  <h4 className="text-xs font-extrabold text-secondary-900 uppercase tracking-[0.16em] mb-4 flex items-center gap-2">
                    <BookOpen size={14} className="text-primary-600" /> Key Subjects
                  </h4>
                  <div className="grid grid-cols-2 gap-3 mb-7">
                    {course.subjects.map((subject) => {
                      const Icon = subject.icon;
                      return (
                        <div key={subject.name} className="flex items-center gap-3 bg-gradient-to-br from-secondary-50 to-primary-50/50 rounded-xl p-3.5 border border-primary-100/50 hover:border-primary-200 transition-colors">
                          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm">
                            <Icon className="text-primary-600" size={20} />
                          </div>
                          <span className="text-sm font-bold text-secondary-800">{subject.name}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Career Paths */}
                  <h4 className="text-xs font-extrabold text-secondary-900 uppercase tracking-[0.16em] mb-4 flex items-center gap-2">
                    <GraduationCap size={14} className="text-accent-600" /> Career Paths
                  </h4>
                  <ul className="space-y-2.5 mb-7">
                    {course.careerPaths.map((path) => (
                      <li key={path} className="flex items-center gap-3 text-sm text-secondary-700 font-medium">
                        <span className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="text-primary-600 shrink-0" size={12} />
                        </span>
                        {path}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto pt-5 border-t border-secondary-100 flex items-center gap-3">
                    <div className="flex-1 p-3 rounded-xl bg-gradient-to-r from-primary-50 to-accent-50/60 border border-primary-100/50">
                      <p className="text-xs font-bold text-primary-800 flex items-center gap-1.5">
                        <Trophy size={13} className="text-accent-600" />
                        {course.coaching}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Integrated Coaching Features */}
      <section className="py-16 md:py-24 bg-secondary-50" aria-labelledby="features-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Why Choose Us"
            title="Integrated Coaching Features"
            subtitle="Our courses come with comprehensive coaching support designed to help students excel in both board and competitive exams."
          />
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12"
          >
            {coachingFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  variants={fadeInUp}
                  className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-glow transition-shadow duration-300"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center mb-5">
                    <Icon className="text-white" size={28} />
                  </div>
                  <h3 className="text-lg font-bold text-secondary-900 mb-2">{feature.title}</h3>
                  <p className="text-secondary-600 text-sm leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      <CTASection
        title="Ready to Choose Your Course?"
        subtitle="Talk to our academic counsellors to find the best combination for your career goals."
      />
    </>
  );
}
