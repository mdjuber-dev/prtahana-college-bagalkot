import { motion } from 'framer-motion';
import { Bus, Shield, Clock, MapPin, Phone, ChevronRight, Check } from 'lucide-react';
import PageHero from '@/components/shared/page-hero';
import SectionTitle from '@/components/shared/section-title';
import CTASection from '@/components/shared/cta-section';
import { useCMS } from '@/lib/cms-context';
import { getTelLink, getMapsLink } from '@/lib/communication';
import { fadeInUp, staggerContainer } from '@/lib/motion';
import { cn } from '@/lib/utils';

const features = [
  {
    icon: Bus,
    title: 'Transportation facility available',
    description: 'Dedicated transport service for students travelling to and from the college campus.',
  },
  {
    icon: Shield,
    title: 'Safe & supervised travel',
    description: 'Every journey is monitored with trained staff and safety protocols in place.',
  },
  {
    icon: Clock,
    title: 'Timely pickup & drop',
    description: 'Punctual schedules ensure students reach college and return home on time, every day.',
  },
  {
    icon: MapPin,
    title: 'Serves Bagalkot & nearby areas',
    description: 'Routes cover key points across Bagalkot town and surrounding suburban locations.',
  },
];

const highlights = [
  'Transport facility available for students',
  'Routes cover Bagalkot town and surrounding suburbs',
  'Separate hostel facility also available for boys and girls if daily commute is not preferred',
  'Vehicles operated by licensed drivers with safety measures',
];

export default function TransportPage() {
  const cms = useCMS();
  const siteConfig = cms.siteConfig;
  const transport = cms.transport;

  if (transport.is_active === false) {
    return (
      <>
        <PageHero eyebrow="Campus Facilities" title="Transport Facility" subtitle="Transport information is currently unavailable." />
      </>
    );
  }

  return (
    <>
      <PageHero
        eyebrow="Campus Facilities"
        title={transport.title || 'Transport Facility'}
        subtitle={transport.description || 'Safe and reliable transportation service for students commuting to and from Prarthana PU Science College.'}
      />

      {/* Available Info - Feature Cards */}
      <section className="py-16 md:py-24 bg-primary-50" aria-labelledby="transport-features-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Our Transport Service"
            title="Commuting Made Convenient"
            subtitle="A reliable transport network designed to give students and parents peace of mind every single day."
          />
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12"
          >
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  variants={fadeInUp}
                  className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-glow transition-shadow duration-300"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#0A1931] to-[#1A3D63] flex items-center justify-center mb-5">
                    <Icon className="text-white" size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-secondary-900 mb-2">{feature.title}</h3>
                  <p className="text-secondary-600 text-sm leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Transport Highlights */}
      <section className="py-16 md:py-24" aria-labelledby="transport-highlights-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Key Highlights"
            title="Transport Highlights"
            subtitle="Everything you need to know about the transport facility at Prarthana PU Science College."
          />
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="mt-12"
          >
            <div className="bg-white rounded-3xl shadow-soft overflow-hidden">
              <div className="bg-gradient-to-br from-[#0A1931] to-[#1A3D63] px-6 py-5 md:px-8 md:py-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                    <Bus className="text-white" size={22} />
                  </div>
                  <h3 id="transport-highlights-title" className="text-xl md:text-2xl font-bold text-white">
                    Transport Facility Overview
                  </h3>
                </div>
              </div>
              <div className="p-6 md:p-8">
                <ul className="grid sm:grid-cols-2 gap-4 md:gap-5">
                  {highlights.map((point, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary-50 flex items-center justify-center mt-0.5">
                        <Check className="text-primary-600" size={16} strokeWidth={3} />
                      </div>
                      <p className="text-secondary-700 leading-relaxed text-sm md:text-base">{point}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Enquiry CTA */}
      <section className="py-16 md:py-24 bg-primary-50" aria-labelledby="transport-enquiry-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="relative rounded-3xl bg-gradient-to-br from-[#0A1931] to-[#1A3D63] overflow-hidden p-8 md:p-12 lg:p-16"
          >
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-80 h-80 bg-accent-400 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary-400 rounded-full blur-3xl" />
            </div>
            <div className="relative grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-white text-sm font-semibold mb-4 backdrop-blur-sm">
                  Need More Information?
                </span>
                <h2 id="transport-enquiry-title" className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                  Transport Enquiry
                </h2>
                <p className="text-lg text-white/80 mb-8 max-w-xl leading-relaxed">
                  Have questions about pickup points, schedules, or availability? Our admission team is ready to help you with all transport-related queries.
                </p>
                <div className="flex items-start gap-3 text-white/80 text-sm">
                  <MapPin className="flex-shrink-0 mt-1" size={18} />
                  <div>
                    <p className="font-semibold text-white">College Campus</p>
                    <p>{siteConfig.address.full}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-xl">
                <h3 className="text-xl font-bold text-secondary-900 mb-6">Reach Out to Us</h3>
                <div className="space-y-4">
                  <a
                    href={getTelLink()}
                    className={cn(
                      'flex items-center justify-between gap-4 w-full px-5 py-4 rounded-xl font-semibold text-white transition-all duration-300 hover:shadow-lg',
                      'bg-gradient-to-r from-[#F97316] to-[#EA580C]'
                    )}
                    aria-label="Call the college for transport enquiry"
                  >
                    <span className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                        <Phone size={20} />
                      </div>
                      <div className="text-left">
                        <p className="text-xs text-white/80 font-medium">Call Now</p>
                        <p className="text-base">{siteConfig.phoneDisplay}</p>
                      </div>
                    </span>
                    <ChevronRight size={22} />
                  </a>
                  <a
                    href={`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent('Hi, I would like to know about the transport facility at Prarthana PU Science College.')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'flex items-center justify-between gap-4 w-full px-5 py-4 rounded-xl font-semibold text-white transition-all duration-300 hover:shadow-lg',
                      'bg-gradient-to-r from-[#25D366] to-[#128C7E]'
                    )}
                    aria-label="WhatsApp the college for transport enquiry"
                  >
                    <span className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <p className="text-xs text-white/80 font-medium">WhatsApp</p>
                        <p className="text-base">{siteConfig.phoneDisplay}</p>
                      </div>
                    </span>
                    <ChevronRight size={22} />
                  </a>
                  <a
                    href="/admission"
                    className={cn(
                      'flex items-center justify-between gap-4 w-full px-5 py-4 rounded-xl font-semibold text-white transition-all duration-300 hover:shadow-lg',
                      'bg-gradient-to-br from-[#0A1931] to-[#1A3D63]'
                    )}
                    aria-label="Visit admission page for more details"
                  >
                    <span className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                        <Shield size={20} />
                      </div>
                      <div className="text-left">
                        <p className="text-xs text-white/80 font-medium">Admission Enquiry</p>
                        <p className="text-base">Get Complete Details</p>
                      </div>
                    </span>
                    <ChevronRight size={22} />
                  </a>
                </div>
                <div className="mt-6 pt-6 border-t border-secondary-100">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-secondary-500 mb-1">Second Contact</p>
                      <p className="font-semibold text-secondary-900">{siteConfig.phone2Display || siteConfig.phoneDisplay}</p>
                    </div>
                    <a
                      href={getMapsLink()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700 hover:text-primary-800 transition-colors"
                    >
                      <MapPin size={16} /> View Campus
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
