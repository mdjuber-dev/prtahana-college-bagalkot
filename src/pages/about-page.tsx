import { motion } from 'framer-motion';
import {
  Target, Eye, Heart, BookOpen, Users, Award, Lightbulb, ShieldCheck,
  GraduationCap, Trophy, Calendar, CheckCircle2,
} from 'lucide-react';
import PageHero from '@/components/shared/page-hero';
import SectionTitle from '@/components/shared/section-title';
import CTASection from '@/components/shared/cta-section';
import { useCMS } from '@/lib/cms-context';
import { fadeInUp, staggerContainer } from '@/lib/motion';
import { aboutImages } from '@/data/about-images';
import { getMediaUrl } from '@/lib/media-url';

const coreValues = [
  { icon: BookOpen, title: 'Academic Excellence', description: 'Rigorous curriculum and dedicated teaching that help every student reach their full potential.' },
  { icon: Lightbulb, title: 'Innovation in Learning', description: 'Modern teaching methods, smart classrooms, and technology-driven education.' },
  { icon: Heart, title: 'Student-Centric Approach', description: 'Individual attention, mentoring, and pastoral care for every student.' },
  { icon: ShieldCheck, title: 'Integrity & Discipline', description: 'Building character through strong values, ethics, and a disciplined environment.' },
  { icon: Users, title: 'Inclusive Community', description: 'A welcoming campus that celebrates diversity and fosters mutual respect.' },
  { icon: Award, title: 'Pursuit of Excellence', description: 'Continuous improvement in academics, sports, arts, and all endeavours.' },
];

const milestones = [
  { year: '2015', title: 'Foundation Year', description: 'Prarthana PU Science College was established in Bagalkot with a vision to provide quality science education.' },
  { year: '2017', title: 'First Batch Graduates', description: 'Our first PU batch achieved outstanding results with 98% pass percentage in the board exam.' },
  { year: '2019', title: 'Integrated Coaching Program', description: 'Launched NEET, KCET, and JEE integrated coaching alongside regular PU curriculum.' },
  { year: '2021', title: 'Campus Expansion', description: 'Expanded campus with new laboratories, smart classrooms, and a modern library.' },
  { year: '2023', title: 'Record Achievements', description: 'Students secured top ranks in NEET, KCET, and JEE, placing the college among the best in Karnataka.' },
  { year: '2025', title: 'Excellence Continues', description: 'Continuing our legacy of excellence with state-of-the-art facilities and outstanding results.' },
];

export default function AboutPage() {
  const cms = useCMS();
  const about = cms.about;
  const visionMission = cms.visionMission;
  const config = cms.siteConfig;
  const storyImage = about?.image || aboutImages[0]?.src || '/images/about/prathanaclg-pht.png';

  if (about?.is_active === false) {
    return (
      <>
        <PageHero eyebrow="About Us" title="About College" subtitle="This page is currently unavailable." />
      </>
    );
  }

  return (
    <>
      <PageHero
        eyebrow="About Us"
        title={about?.pageTitle || 'Nurturing Minds, Building Futures'}
        subtitle={about?.subtitle || 'Discover the story, mission, and values that make Prarthana PU Science College a leader in science education.'}
      />

      {/* Story Section */}
      <section className="py-16 md:py-24" aria-labelledby="story-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary-50 text-primary-700 text-sm font-semibold mb-4">
                Our Story
              </span>
              <h2 id="story-title" className="text-3xl md:text-4xl font-bold text-secondary-900 mb-6">
                A Journey of Excellence Since {config.established}
              </h2>
              <div className="space-y-4 text-secondary-600 leading-relaxed">
                <p>{about?.story || about?.description || `Prarthana PU Science College was founded in ${config.established} with a singular vision: to provide world-class science education to students in Bagalkot and the surrounding regions.`}</p>
              </div>
            </motion.div>
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              className="relative"
            >
              <div className="rounded-3xl overflow-hidden shadow-xl">
                <img
                  src={getMediaUrl(storyImage)}
                  alt={about?.pageTitle || aboutImages[0].alt}
                  className="w-full h-[400px] md:h-[500px] object-cover"
                  loading="lazy"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-lg p-6 hidden md:block">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center">
                    <GraduationCap className="text-white" size={28} />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-secondary-900">10+</p>
                    <p className="text-sm text-secondary-600">Years of Excellence</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 md:py-24 bg-secondary-50" aria-labelledby="mission-vision-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Our Purpose"
            title="Mission & Vision"
            subtitle="Guiding principles that shape everything we do at Prarthana PU Science College."
          />
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="grid md:grid-cols-2 gap-8 mt-12"
          >
            <motion.div
              variants={fadeInUp}
              className="bg-white rounded-3xl p-8 md:p-10 shadow-soft"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center mb-6">
                <Target className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-secondary-900 mb-4">Our Mission</h3>
              <p className="text-secondary-600 leading-relaxed whitespace-pre-line">
                {visionMission?.mission || 'To provide quality science education that empowers students to excel academically, think critically, and pursue their dreams with confidence.'}
              </p>
            </motion.div>
            <motion.div
              variants={fadeInUp}
              className="bg-white rounded-3xl p-8 md:p-10 shadow-soft"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-accent flex items-center justify-center mb-6">
                <Eye className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-secondary-900 mb-4">Our Vision</h3>
              <p className="text-secondary-600 leading-relaxed whitespace-pre-line">
                {visionMission?.vision || 'To be the most trusted and sought-after pre-university science college in Karnataka, recognised for producing outstanding results in board and competitive examinations.'}
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 md:py-24" aria-labelledby="values-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="What We Stand For"
            title="Our Core Values"
            subtitle="The principles that guide our decisions, shape our culture, and define who we are."
          />
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12"
          >
            {coreValues.map((value) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={value.title}
                  variants={fadeInUp}
                  className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-glow transition-shadow duration-300"
                >
                  <div className="w-14 h-14 rounded-xl bg-primary-50 flex items-center justify-center mb-5">
                    <Icon className="text-primary-600" size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-secondary-900 mb-2">{value.title}</h3>
                  <p className="text-secondary-600 text-sm leading-relaxed">{value.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Milestones Timeline */}
      <section className="py-16 md:py-24 bg-secondary-50" aria-labelledby="milestones-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Our Journey"
            title="Milestones & Achievements"
            subtitle="Key moments that have shaped Prarthana PU Science College over the years."
          />
          <div className="relative mt-12 max-w-4xl mx-auto">
            {/* Vertical line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-primary-200 md:-translate-x-1/2" />
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              className="space-y-8"
            >
              {milestones.map((milestone, index) => (
                <motion.div
                  key={milestone.year}
                  variants={fadeInUp}
                  className={`relative flex items-start gap-6 ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* Dot */}
                  <div className="absolute left-4 md:left-1/2 w-8 h-8 rounded-full bg-gradient-primary border-4 border-white shadow-md md:-translate-x-1/2 z-10 flex items-center justify-center">
                    <Calendar className="text-white" size={14} />
                  </div>
                  {/* Content */}
                  <div className={`ml-16 md:ml-0 md:w-1/2 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                    <div className="bg-white rounded-2xl p-6 shadow-soft">
                      <span className="inline-block px-3 py-1 rounded-full bg-accent-50 text-accent-700 text-sm font-bold mb-3">
                        {milestone.year}
                      </span>
                      <h3 className="text-lg font-bold text-secondary-900 mb-2">{milestone.title}</h3>
                      <p className="text-secondary-600 text-sm leading-relaxed">{milestone.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-16 md:py-24" aria-labelledby="stats-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              { icon: GraduationCap, value: '2000+', label: 'Students Graduated' },
              { icon: Trophy, value: '500+', label: 'Top Rank Holders' },
              { icon: Users, value: '50+', label: 'Expert Faculty' },
              { icon: CheckCircle2, value: '98%', label: 'Pass Percentage' },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  variants={fadeInUp}
                  className="bg-white rounded-2xl p-6 text-center shadow-soft"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center mx-auto mb-4">
                    <Icon className="text-white" size={28} />
                  </div>
                  <p className="text-3xl md:text-4xl font-bold text-secondary-900 mb-1">{stat.value}</p>
                  <p className="text-sm text-secondary-600">{stat.label}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
