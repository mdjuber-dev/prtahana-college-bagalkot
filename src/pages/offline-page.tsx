import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { WifiOff, RefreshCw } from 'lucide-react';
import { siteConfig } from '@/lib/site-config';
import { getMediaUrl } from '@/lib/media-url';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setRetrying(false);
      window.location.reload();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = useCallback(() => {
    setRetrying(true);
    if (navigator.onLine) {
      window.location.reload();
    } else {
      setTimeout(() => setRetrying(false), 2000);
    }
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-secondary-50 px-4" role="alertdialog" aria-labelledby="offline-title" aria-describedby="offline-desc">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full text-center"
      >
        <img
          src={getMediaUrl(siteConfig.logo)}
          alt={`${siteConfig.name} logo`}
          className="w-14 h-14 mx-auto mb-6 object-contain"
          width={56}
          height={56}
        />
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-error-50 mb-6">
          <WifiOff className="text-error-500" size={40} />
        </div>
        <h1 id="offline-title" className="text-2xl font-bold text-secondary-900 mb-2">
          No Internet Connection
        </h1>
        <p id="offline-desc" className="text-secondary-500 text-sm mb-8">
          Please check your internet connection and try again.
        </p>
        <button
          type="button"
          onClick={handleRetry}
          disabled={retrying}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-primary hover:shadow-glow transition-all disabled:opacity-60"
        >
          <RefreshCw size={18} className={retrying ? 'animate-spin' : ''} />
          {retrying ? 'Retrying...' : 'Retry'}
        </button>
      </motion.div>
    </div>
  );
}
