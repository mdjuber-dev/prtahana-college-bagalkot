import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, GraduationCap, Mail, Compass } from 'lucide-react';
import { siteConfig } from '@/lib/site-config';

export default function NotFoundPage() {
  return (
    <section className="min-h-screen flex items-center justify-center px-4 py-20 bg-secondary-50" aria-labelledby="not-found-title">
      <div className="max-w-lg w-full text-center">
        <motion.img
          src={siteConfig.logo}
          alt={`${siteConfig.name} logo`}
          className="w-16 h-16 mx-auto mb-8 object-contain"
          width={64}
          height={64}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary-50 mb-4">
            <Compass className="text-primary-600" size={40} />
          </div>
          <h1 id="not-found-title" className="text-6xl md:text-7xl font-bold text-primary-700 mb-2">404</h1>
          <p className="text-xl font-semibold text-secondary-900 mb-1">Page Not Found</p>
          <p className="text-secondary-500 text-sm">Sorry, the page you are looking for doesn't exist.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-primary hover:shadow-glow transition-all"
          >
            <Home size={18} /> Home
          </Link>
          <Link
            to="/admission"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-secondary-700 bg-white border border-secondary-200 hover:bg-secondary-50 transition-all"
          >
            <GraduationCap size={18} /> Admission
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-secondary-700 bg-white border border-secondary-200 hover:bg-secondary-50 transition-all"
          >
            <Mail size={18} /> Contact
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
