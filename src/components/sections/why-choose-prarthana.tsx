import { motion } from 'framer-motion';
import { GraduationCap, Atom, Award, Users, Library, Heart } from 'lucide-react';
import SectionTitle from '@/components/shared/section-title';
import { staggerContainer, fadeInUp } from '@/lib/motion';

interface Feature {
  icon: typeof GraduationCap;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: GraduationCap,
    title: 'Expert Faculty',
    description: 'Highly qualified and experienced teachers dedicated to student success and mentorship.',
  },
  {
    icon: Atom,
    title: 'Integrated Coaching',
    description: 'Seamless blend of PU board syllabus with NEET, KCET, and JEE preparation under one roof.',
  },
  {
    icon: Award,
    title: 'Proven Results',
    description: 'Consistent track record of top ranks and selections in competitive examinations.',
  },
  {
    icon: Users,
    title: 'Small Batch Sizes',
    description: 'Personalized attention with limited students per class ensuring individual focus.',
  },
  {
    icon: Library,
    title: 'Modern Facilities',
    description: 'Well-equipped laboratories, digital classrooms, and a comprehensive library.',
  },
  {
    icon: Heart,
    title: 'Holistic Development',
    description: 'Focus on academics, values, and extracurricular activities for all-round growth.',
  },
];

export default function WhyChoosePrarthana() {
  return (
    <section className="py-16 md:py-24 bg-white" aria-labelledby="why-choose-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="Why Choose Us"
          title="Why Choose Prarthana?"
          subtitle="We provide an enriching educational experience that goes beyond textbooks to shape confident, capable, and compassionate individuals."
        />
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={fadeInUp}
                className="group bg-white rounded-2xl p-6 sm:p-7 card-shadow hover:shadow-premium transition-shadow duration-300 border border-secondary-100"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-50 text-primary-600 mb-5 group-hover:bg-gradient-primary group-hover:text-white transition-colors duration-300">
                  <Icon size={28} strokeWidth={2} aria-hidden="true" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-secondary-900 mb-2">{feature.title}</h3>
                <p className="text-sm sm:text-base text-secondary-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
