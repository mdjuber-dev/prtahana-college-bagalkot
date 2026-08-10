import { motion } from 'framer-motion';
import { ArrowRight, Phone, Mail } from 'lucide-react';
import GradientButton from './gradient-button';
import { siteConfig } from '@/lib/site-config';
import { getTelLink } from '@/lib/communication';

interface CTASectionProps { title?: string; subtitle?: string; }

export default function CTASection({ title, subtitle }: CTASectionProps) {
  return (
    <section className="py-16 md:py-24" aria-labelledby="cta-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl bg-gradient-hero overflow-hidden p-8 md:p-16 text-center"
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-80 h-80 bg-accent-400 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary-400 rounded-full blur-3xl" />
          </div>
          <div className="relative">
            <h2 id="cta-title" className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">{title || 'Ready to Begin Your Journey?'}</h2>
            <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto">{subtitle || 'Join Prarthana PU Science College and take the first step towards a successful career in science.'}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <GradientButton to="/admission" size="lg" variant="accent">Apply Now <ArrowRight className="ml-2 inline" size={20} /></GradientButton>
              <GradientButton href={getTelLink()} size="lg" variant="white"><Phone className="mr-2 inline" size={20} /> Call Us</GradientButton>
            </div>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center text-white/70 text-sm">
              <a href={getTelLink()} className="flex items-center justify-center hover:text-white transition-colors"><Phone size={16} className="mr-2" /> {siteConfig.phoneDisplay}</a>
              <a href={`mailto:${siteConfig.email}`} className="flex items-center justify-center hover:text-white transition-colors"><Mail size={16} className="mr-2" /> {siteConfig.email}</a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
