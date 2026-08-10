import { Phone, MessageCircle } from 'lucide-react';
import { getWhatsAppLink, getTelLink } from '@/lib/communication';

export default function FloatingActions() {
  return (
    <div
      className="fixed left-4 md:left-6 z-50 flex flex-col gap-3 bottom-20 md:bottom-6"
      aria-label="Quick contact actions"
    >
      <a
        href={getWhatsAppLink('Hello, I would like to know more about admissions at Prarthana PU Science College.')}
        target="_blank"
        rel="noopener noreferrer"
        className="relative w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        aria-label="Chat on WhatsApp"
      >
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-40" />
        <MessageCircle size={24} className="relative" />
      </a>
      <a
        href={getTelLink()}
        className="relative w-14 h-14 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        aria-label="Call us"
      >
        <span className="absolute inset-0 rounded-full bg-primary-600 animate-ping opacity-40" />
        <Phone size={24} className="relative" />
      </a>
    </div>
  );
}
