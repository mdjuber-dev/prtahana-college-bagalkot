import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import SectionTitle from '@/components/shared/section-title';
import GradientButton from '@/components/shared/gradient-button';
import { fadeInUp, slideInLeft, slideInRight } from '@/lib/motion';
import { aboutImages } from '@/data/about-images';
import { useCMS } from '@/lib/cms-context';

export default function AboutPreview() {
  const cms = useCMS();
  const about = cms.about;
  const imageSrc = about?.image || aboutImages[0]?.src || '/images/about/prathanaclg-pht.png';

  if (about?.is_active === false) return null;

  return (
    <section className="py-16 md:py-24 bg-secondary-50" aria-labelledby="about-preview-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left column */}
          <motion.div variants={slideInLeft} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}>
            <SectionTitle
              eyebrow="Welcome"
              title={about?.pageTitle || 'About Prarthana PU Science College'}
              subtitle={about?.subtitle || 'A premier institution dedicated to nurturing young minds through quality education, values, and excellence in science learning.'}
              center={false}
            />
            <div className="mt-6 space-y-4 text-secondary-600 leading-relaxed text-base md:text-lg">
              <p>{about?.description || 'Established in 2015, Prarthana PU Science College in Bagalkot has emerged as a trusted name in pre-university science education.'}</p>
              {about?.story && <p>{about.story}</p>}
            </div>
            <div className="mt-8">
              <GradientButton to="/about" size="lg" ariaLabel="Learn more about Prarthana PU Science College">
                Learn More
                <ArrowRight size={20} className="ml-2" aria-hidden="true" />
              </GradientButton>
            </div>
          </motion.div>

          {/* Right column */}
          <motion.div
            variants={slideInRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden card-shadow">
              <img
                src={imageSrc}
                alt={about?.pageTitle || aboutImages[0].alt}
                className="w-full h-72 sm:h-80 lg:h-96 object-cover"
                loading="lazy"
                decoding="async"
                width={800}
                height={600}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-900/40 to-transparent" />
            </div>
            {/* Decorative accent badge */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="absolute -bottom-5 -left-3 sm:-left-5 bg-white rounded-2xl px-5 py-4 card-shadow flex items-center gap-3"
            >
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-accent text-white">
                <span className="text-xl font-bold">10+</span>
              </div>
              <div>
                <p className="text-sm font-bold text-secondary-900">Years of</p>
                <p className="text-sm text-secondary-600">Excellence</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
