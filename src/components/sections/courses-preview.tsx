import { motion } from 'framer-motion';
import { Atom, ArrowRight, BookOpen, Dna, Cpu, FlaskConical, Compass, Target, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import SectionTitle from '@/components/shared/section-title';
import { staggerContainer, fadeInUp } from '@/lib/motion';
import { useCMS } from '@/lib/cms-context';

interface Course {
  icon: typeof Atom;
  code: string;
  title: string;
  tagline: string;
  description: string;
  keySubjects: string[];
  careerDirection: string[];
  exams: string[];
}

const courses: Course[] = [
  {
    icon: Dna,
    code: 'PCMB',
    tagline: 'Medical & Engineering Excellence',
    title: 'Physics · Chemistry · Maths · Biology',
    description:
      'The gold standard science stream for students targeting top medical and engineering entrance exams. Builds the strongest scientific foundation for dual career pathways.',
    keySubjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
    careerDirection: ['MBBS / Medical Professional', 'Engineering', 'Research & Development', 'Life Sciences'],
    exams: ['NEET UG', 'KCET', 'JEE Mains', 'JEE Advanced'],
  },
  {
    icon: Cpu,
    code: 'PCMC',
    tagline: 'Engineering & Technology Innovators',
    title: 'Physics · Chemistry · Maths · Computer Science',
    description:
      'Future-focused stream for aspiring engineers, software developers and technology leaders. Combines rigorous science with practical computing skills.',
    keySubjects: ['Physics', 'Chemistry', 'Mathematics', 'Computer Science'],
    careerDirection: ['BTech / BE Engineering', 'Software Development', 'AI & Data Science', 'Computer Applications'],
    exams: ['JEE Mains', 'JEE Advanced', 'KCET', 'COMED-K'],
  },
];

export default function CoursesPreview() {
  const cms = useCMS();
  const { pcmbDesc, pcmcDesc, pcmbCareers, pcmcCareers } = cms.coursesConfig;
  const coursesWithCms = courses.map((course) => ({
    ...course,
    description: course.code === 'PCMB' ? (pcmbDesc || course.description) : (pcmcDesc || course.description),
    careerDirection: course.code === 'PCMB'
      ? (pcmbCareers ? pcmbCareers.split(',').map((s) => s.trim()) : course.careerDirection)
      : (pcmcCareers ? pcmcCareers.split(',').map((s) => s.trim()) : course.careerDirection),
  }));

  return (
    <section className="py-16 md:py-24 bg-primary-50 relative overflow-hidden" aria-labelledby="courses-preview-title">
      <div
        className="absolute inset-0 opacity-[0.032] pointer-events-none bg-center bg-cover"
        style={{ backgroundImage: "url('/campus-3.jpg')" }}
        aria-hidden="true"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionTitle
          eyebrow="Our Flagship Streams"
          title="Choose Your Path"
          subtitle="We offer two carefully designed course combinations, each aligned with specific career goals. Both streams include fully integrated coaching for top competitive entrance exams."
        />
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="mt-12 grid lg:grid-cols-2 gap-8"
        >
          {coursesWithCms.map((course) => {
            const Icon = course.icon;
            return (
              <motion.article
                key={course.code}
                variants={fadeInUp}
                className="group bg-white rounded-3xl overflow-hidden card-shadow hover:shadow-premium transition-all duration-500 flex flex-col border border-primary-100/60"
              >
                {/* Header band */}
                <div className="bg-gradient-primary p-7 sm:p-8 relative overflow-hidden">
                  <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/5 blur-3xl pointer-events-none" aria-hidden="true" />
                  <div className="flex items-start justify-between gap-4 relative">
                    <div>
                      <p className="text-accent-300 text-xs font-bold tracking-[0.18em] uppercase mb-2">{course.tagline}</p>
                      <h3 className="text-2xl md:text-3xl font-extrabold text-white leading-tight mb-1.5">{course.code}</h3>
                      <p className="text-primary-100 text-sm md:text-base font-medium">{course.title}</p>
                    </div>
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 text-white shrink-0">
                      <Icon size={32} strokeWidth={2} aria-hidden="true" />
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="p-7 sm:p-8 flex flex-col flex-1 space-y-6">
                  <p className="text-sm md:text-base text-secondary-700 leading-relaxed">
                    {course.description}
                  </p>

                  <div className="space-y-5">
                    {/* Key subjects */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <FlaskConical className="text-primary-700" size={18} aria-hidden="true" />
                        <h4 className="text-sm font-bold uppercase tracking-wider text-primary-900">Key Subjects</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {course.keySubjects.map((sub) => (
                          <span key={sub} className="inline-flex items-center px-3.5 py-1.5 rounded-lg bg-primary-50 text-primary-800 text-xs font-semibold border border-primary-100">
                            <BookOpen size={12} className="mr-1.5 opacity-70" /> {sub}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Exams */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Target className="text-accent-600" size={18} aria-hidden="true" />
                        <h4 className="text-sm font-bold uppercase tracking-wider text-secondary-800">Target Entrance Exams</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {course.exams.map((exam) => (
                          <span key={exam} className="inline-flex items-center px-3.5 py-1.5 rounded-lg bg-gradient-accent text-white text-xs font-bold shadow-sm">
                            {exam}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Career direction */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Compass className="text-primary-700" size={18} aria-hidden="true" />
                        <h4 className="text-sm font-bold uppercase tracking-wider text-primary-900">Career Direction</h4>
                      </div>
                      <ul className="grid sm:grid-cols-2 gap-2">
                        {course.careerDirection.map((c) => (
                          <li key={c} className="flex items-start gap-2 text-sm text-secondary-700">
                            <GraduationCap className="text-primary-500 shrink-0 mt-0.5" size={14} aria-hidden="true" />
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-auto pt-2">
                    <Link
                      to="/admission"
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white bg-gradient-accent hover:shadow-lg hover:shadow-accent-500/30 transition-all duration-300 hover:-translate-y-0.5"
                      aria-label={`Apply for ${course.code} admission`}
                    >
                      Apply for {course.code}
                      <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                    <Link
                      to="/courses"
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-primary-900 bg-primary-100 hover:bg-primary-200 transition-colors"
                      aria-label={`Learn more about ${course.code}`}
                    >
                      Learn More
                    </Link>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </motion.div>

        <p className="text-center text-sm text-secondary-500 mt-10">
          Looking for additional streams? <Link to="/courses" className="text-primary-700 font-semibold underline underline-offset-2 hover:text-primary-900">View all courses →</Link>
        </p>
      </div>
    </section>
  );
}
