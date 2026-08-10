import { motion } from 'framer-motion';
import { Library, FlaskConical, Monitor, Trophy, Home, Bus } from 'lucide-react';
import SectionTitle from '@/components/shared/section-title';
import { staggerContainer, fadeInUp } from '@/lib/motion';

interface Facility {
  icon: typeof Library;
  title: string;
  description: string;
}

const facilities: Facility[] = [
  {
    icon: Library,
    title: 'Library',
    description: 'A vast collection of books, journals, and digital resources for research and self-study.',
  },
  {
    icon: FlaskConical,
    title: 'Laboratories',
    description: 'Modern, well-equipped science labs for Physics, Chemistry, and Biology practicals.',
  },
  {
    icon: Monitor,
    title: 'Smart Classrooms',
    description: 'Tech-enabled classrooms with digital learning tools for an immersive experience.',
  },
  {
    icon: Trophy,
    title: 'Sports',
    description: 'Sports facilities promoting physical fitness, teamwork, and healthy competition.',
  },
  {
    icon: Home,
    title: 'Hostel',
    description: 'Safe and comfortable hostel accommodation with nutritious meals and supervision.',
  },
  {
    icon: Bus,
    title: 'Transport',
    description: 'Reliable bus service connecting the campus to nearby towns and neighborhoods.',
  },
];

export default function CampusFacilities() {
  return (
    <section
      className="py-16 md:py-24 bg-white relative overflow-hidden"
      aria-labelledby="campus-facilities-title"
    >
      <div
        className="absolute inset-0 opacity-[0.028] pointer-events-none bg-center bg-cover"
        style={{ backgroundImage: "url('/classroom-2.jpg')" }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white via-white/60 to-white pointer-events-none" aria-hidden="true" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionTitle
          eyebrow="Our Infrastructure"
          title="Campus Facilities"
          subtitle="World-class amenities designed to support every aspect of student learning and well-being."
        />
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {facilities.map((facility) => {
            const Icon = facility.icon;
            return (
              <motion.div
                key={facility.title}
                variants={fadeInUp}
                className="group flex gap-4 bg-secondary-50 rounded-2xl p-6 card-shadow hover:shadow-premium transition-shadow duration-300"
              >
                <div className="shrink-0">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-accent text-white group-hover:scale-110 transition-transform duration-300">
                    <Icon size={26} strokeWidth={2} aria-hidden="true" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-secondary-900 mb-1.5">{facility.title}</h3>
                  <p className="text-sm text-secondary-600 leading-relaxed">{facility.description}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
