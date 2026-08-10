import { Link } from 'react-router-dom';
import { Facebook, Instagram, Youtube, Phone, Mail, MapPin, Lock } from 'lucide-react';
import { useCMS } from '@/lib/cms-context';
import { getTelLink, getMapsLink } from '@/lib/communication';

export default function Footer() {
  const cms = useCMS();
  const config = cms.siteConfig;
  const items = cms.navItems;
  const footer = cms.footer;
  return (
    <footer className="bg-secondary-900 text-secondary-300" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Footer</h2>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-4" aria-label={`${config.name} home`}>
              <img src={config.logo} alt={`${config.name} logo`} className="w-12 h-12 object-contain" width={48} height={48} />
              <div>
                <span className="block text-base font-bold text-white leading-tight">{config.shortName?.split(' ')[0] || 'Prarthana'}</span>
                <span className="block text-sm text-secondary-400 leading-tight">{config.shortName?.split(' ').slice(1).join(' ') || 'Science College'}</span>
              </div>
            </Link>
            <p className="text-sm leading-relaxed mb-4">{footer.text || 'Empowering students through quality science education and integrated coaching for NEET, KCET & JEE in Bagalkot, Karnataka.'}</p>
            <div className="flex gap-3">
              <a href={config.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-10 h-10 rounded-full bg-secondary-800 flex items-center justify-center hover:bg-primary-600 transition-colors"><Facebook size={18} /></a>
              <a href={config.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-10 h-10 rounded-full bg-secondary-800 flex items-center justify-center hover:bg-primary-600 transition-colors"><Instagram size={18} /></a>
              <a href={config.social.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="w-10 h-10 rounded-full bg-secondary-800 flex items-center justify-center hover:bg-primary-600 transition-colors"><Youtube size={18} /></a>
            </div>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4 text-base">Quick Links</h3>
            <ul className="space-y-2">{items.map((item) => <li key={item.path}><Link to={item.path} className="text-sm hover:text-white transition-colors">{item.label}</Link></li>)}</ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4 text-base">Courses</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/courses" className="hover:text-white transition-colors">PCMB (Physics, Chemistry, Maths, Biology)</Link></li>
              <li><Link to="/courses" className="hover:text-white transition-colors">PCMC (Physics, Chemistry, Maths, Computer Science)</Link></li>
              <li><Link to="/achievements" className="hover:text-white transition-colors">NEET / KCET / JEE Coaching</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4 text-base">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2"><MapPin size={16} className="mt-0.5 shrink-0" /><a href={getMapsLink()} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">{config.address.full}</a></li>
              <li className="flex items-center gap-2"><Phone size={16} className="shrink-0" /><a href={getTelLink()} className="hover:text-white transition-colors">{config.phoneDisplay}</a></li>
              <li className="flex items-center gap-2"><Mail size={16} className="shrink-0" /><a href={`mailto:${config.email}`} className="hover:text-white transition-colors break-all">{config.email}</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-secondary-800 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} {config.name}. {footer.copyright || 'All rights reserved.'}</p>
          <div className="mt-2 flex items-center justify-center gap-3 text-secondary-500 text-xs">
            <span>Best PU Science College in Bagalkot, Karnataka</span>
            <span>•</span>
            <Link
              to="/admin/login"
              className="inline-flex items-center gap-1 hover:text-secondary-400 opacity-50 hover:opacity-90 transition-opacity"
              aria-label="Admin Login"
            >
              <Lock size={11} aria-hidden="true" />
              Admin Login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
