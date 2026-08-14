import { motion } from 'framer-motion';
import { siteConfig } from '@/lib/site-config';
import { getMediaUrl } from '@/lib/media-url';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white" role="status" aria-label="Loading">
      <div className="text-center">
        <motion.img
          src={getMediaUrl(siteConfig.logo)}
          alt={`${siteConfig.name} logo`}
          className="w-20 h-20 md:w-24 md:h-24 mx-auto object-contain"
          width={96}
          height={96}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.p
          className="mt-4 text-secondary-600 font-heading font-semibold text-sm md:text-base"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          Prarthana PU Science College
        </motion.p>
      </div>
    </div>
  );
}
