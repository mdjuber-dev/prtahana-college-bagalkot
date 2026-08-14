import { Component, type ErrorInfo, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { siteConfig } from '@/lib/site-config';
import { getMediaUrl } from '@/lib/media-url';

interface Props { children: ReactNode; }
interface State { hasError: boolean; }

const isDev = import.meta.env.DEV;

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (isDev) {
      console.error('Application error:', error, info);
    }
  }

  handleReload = () => window.location.reload();
  handleHome = () => { window.location.href = '/'; };
  handleReport = () => {
    const subject = encodeURIComponent('Website Error Report');
    const body = encodeURIComponent(
      `Error reported at: ${new Date().toISOString()}\nURL: ${window.location.href}\n\nPlease describe what happened:\n`,
    );
    window.location.href = `mailto:${siteConfig.email}?subject=${subject}&body=${body}`;
  };

  render() {
    if (this.state.hasError) {
      return (
        <section className="min-h-screen flex items-center justify-center px-4 py-20 bg-secondary-50" aria-labelledby="error-title">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-lg w-full text-center"
          >
            <img
              src={getMediaUrl(siteConfig.logo)}
              alt={`${siteConfig.name} logo`}
              className="w-14 h-14 mx-auto mb-6 object-contain"
              width={56}
              height={56}
            />
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-error-50 mb-6">
              <AlertTriangle className="text-error-500" size={40} />
            </div>
            <h1 id="error-title" className="text-2xl md:text-3xl font-bold text-secondary-900 mb-2">
              Something went wrong.
            </h1>
            <p className="text-secondary-500 text-sm mb-8">
              An unexpected error occurred. Please try reloading the page.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={this.handleReload}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-primary hover:shadow-glow transition-all"
              >
                <RefreshCw size={18} /> Reload Page
              </button>
              <a
                href="/"
                onClick={this.handleHome}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-secondary-700 bg-white border border-secondary-200 hover:bg-secondary-50 transition-all"
              >
                <Home size={18} /> Go Home
              </a>
              <button
                type="button"
                onClick={this.handleReport}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-secondary-700 bg-white border border-secondary-200 hover:bg-secondary-50 transition-all"
              >
                <Bug size={18} /> Report Error
              </button>
            </div>
          </motion.div>
        </section>
      );
    }

    return this.props.children;
  }
}
