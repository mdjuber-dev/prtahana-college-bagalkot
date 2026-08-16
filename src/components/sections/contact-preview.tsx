import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, ArrowRight } from 'lucide-react';
import SectionTitle from '@/components/shared/section-title';
import GradientButton from '@/components/shared/gradient-button';
import { slideInLeft, slideInRight } from '@/lib/motion';
import { siteConfig } from '@/lib/site-config';
import { getTelLink } from '@/lib/communication';

interface ContactItem {
  icon: typeof MapPin;
  label: string;
  value: string;
  href?: string;
}

const contactItems: ContactItem[] = [
  {
    icon: MapPin,
    label: 'Address',
    value: siteConfig.address.full,
    href: 'https://www.google.com/maps/place/Prarthana+P+U+Science+College+Bagalkot/@16.1825746,75.6936906,839m/data=!3m2!1e3!4b1!4m6!3m5!1s0x3bc778f3349a462f:0x27050572c74ff80a!8m2!3d16.1825746!4d75.6936906!16s%2Fg%2F11dxnsktfw?entry=ttu&g_ep=EgoyMDI2MDgxMi4wIKXMDSoASAFQAw%3D%3D',
  },
  {
    icon: Phone,
    label: 'Phone',
    value: siteConfig.phoneDisplay,
    href: getTelLink(),
  },
  {
    icon: Mail,
    label: 'Email',
    value: siteConfig.email,
    href: `mailto:${siteConfig.email}`,
  },
];

export default function ContactPreview() {
  return (
    <section className="py-16 md:py-24 bg-white" aria-labelledby="contact-preview-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="Get in Touch"
          title="Contact Us"
          subtitle="Have questions about admissions, courses, or anything else? We're here to help."
        />
        <div className="mt-12 grid lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
          {/* Contact info */}
          <motion.div
            variants={slideInLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="bg-gradient-primary rounded-2xl p-6 sm:p-8 lg:p-10 flex flex-col"
          >
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-6">Visit Our Campus</h3>
            <div className="space-y-5 flex-1">
              {contactItems.map((item) => {
                const Icon = item.icon;
                const content = (
                  <>
                    <div className="shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/15 text-white">
                      <Icon size={22} strokeWidth={2} aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-primary-100 font-medium mb-0.5">{item.label}</p>
                      <p className="text-white font-semibold text-sm sm:text-base break-words">{item.value}</p>
                    </div>
                  </>
                );
                return item.href ? (
                  <a
                    key={item.label}
                    href={item.href}
                    target={item.href.startsWith('http') ? '_blank' : undefined}
                    rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="flex items-start gap-4 hover:opacity-90 transition-opacity"
                    aria-label={`${item.label}: ${item.value}`}
                  >
                    {content}
                  </a>
                ) : (
                  <div key={item.label} className="flex items-start gap-4">
                    {content}
                  </div>
                );
              })}
              {/* Hours */}
              <div className="flex items-start gap-4">
                <div className="shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/15 text-white">
                  <Clock size={22} strokeWidth={2} aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm text-primary-100 font-medium mb-0.5">Office Hours</p>
                  <p className="text-white font-semibold text-sm sm:text-base">Mon – Sat: 9:00 AM – 5:00 PM</p>
                  <p className="text-primary-100 text-sm">Sunday: Closed</p>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <GradientButton to="/contact" variant="white" size="lg" ariaLabel="Go to contact page">
                Contact Us
                <ArrowRight size={20} className="ml-2" aria-hidden="true" />
              </GradientButton>
            </div>
          </motion.div>

          {/* Map */}
          <motion.div
            variants={slideInRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="rounded-2xl overflow-hidden card-shadow min-h-80 lg:min-h-full"
          >
            <iframe
              title="Prarthana PU Science College location map"
              src={siteConfig.mapsEmbed}
              className="w-full h-full min-h-80 lg:min-h-full"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
