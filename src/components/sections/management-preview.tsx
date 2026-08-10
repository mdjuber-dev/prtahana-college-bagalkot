import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Quote, Award, GraduationCap, UserRound, BadgeCheck } from 'lucide-react';
import SectionTitle from '@/components/shared/section-title';
import { fadeInUp, staggerContainer } from '@/lib/motion';
import { useCMS, type LeadershipProfile } from '@/lib/cms-context';
import { cn } from '@/lib/utils';

const presidentFallback = {
  photo: '/management-1.jpg',
};
const principalFallback = {
  photo: '/management-2.jpg',
};

interface LeaderCardProps {
  role: 'president' | 'principal';
  profile: LeadershipProfile;
  fallbackPhoto: string;
}

function LeaderCard({ role, profile, fallbackPhoto }: LeaderCardProps) {
  const isPresident = role === 'president';
  const roleLabel = isPresident ? 'President / Chairman' : 'Principal';
  const roleBadge = isPresident ? 'Administration' : 'Academic Leadership';
  const nameDisplay = profile.name?.trim() || `[${roleLabel} Name — Update via Admin CMS]`;
  const hasName = !!profile.name?.trim();

  const [photoSrc, setPhotoSrc] = useState(profile.photo || fallbackPhoto);

  useEffect(() => {
    setPhotoSrc(profile.photo || fallbackPhoto);
  }, [profile.photo, fallbackPhoto]);

  return (
    <motion.div
      variants={fadeInUp}
      className="group relative h-full"
    >
      {/* Card */}
      <div className="relative h-full rounded-3xl overflow-hidden bg-white border border-secondary-200/80 card-shadow flex flex-col">
        {/* Gradient header */}
        <div
          className={`relative h-28 sm:h-32 ${isPresident
              ? 'bg-gradient-to-br from-primary-800 via-primary-700 to-primary-600'
              : 'bg-gradient-to-br from-accent-600 via-accent-500 to-orange-400'
            }`}
        >
          {/* Dots pattern */}
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                'radial-gradient(circle, white 1.2px, transparent 1.2px)',
              backgroundSize: '20px 20px',
            }}
            aria-hidden="true"
          />
          {/* Role badge */}
          <div className="absolute top-4 left-4 sm:top-5 sm:left-5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20">
            <Award size={12} className="text-white" />
            <span className="text-[11px] font-bold text-white tracking-wide uppercase">
              {roleBadge}
            </span>
          </div>
          {/* Decorative icon */}
          <div className="absolute bottom-4 right-4 sm:bottom-5 sm:right-5 opacity-20">
            {isPresident ? (
              <UserRound size={56} className="text-white" strokeWidth={1.5} />
            ) : (
              <GraduationCap size={56} className="text-white" strokeWidth={1.5} />
            )}
          </div>
        </div>

        {/* Photo */}
        <div className="relative px-5 sm:px-6 -mt-16 sm:-mt-20 flex justify-center sm:justify-start z-10">
          <div className="relative">
            <div
              className={cn(
                'w-32 h-32 sm:w-36 sm:h-36 rounded-3xl overflow-hidden ring-4 ring-white bg-gradient-to-br shadow-soft border border-secondary-200/60',
                isPresident ? 'from-primary-100 to-primary-200' : 'from-accent-100 to-accent-200'
              )}
            >
              <img
                src={photoSrc}
                alt={`${roleLabel} ${profile.name || 'Prarthana PU Science College'}`}
                onError={() => photoSrc !== fallbackPhoto && setPhotoSrc(fallbackPhoto)}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
            {/* Verified tick */}
            {hasName && (
              <div
                className={`absolute -bottom-1 -right-1 w-9 h-9 rounded-2xl ring-4 ring-white flex items-center justify-center ${isPresident ? 'bg-primary-600' : 'bg-accent-500'
                  }`}
              >
                <BadgeCheck className="text-white" size={18} />
              </div>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="px-5 sm:px-6 pt-5 pb-6 flex-1 flex flex-col">
          <div className="mb-3">
            <p
              className={cn(
                'text-[11px] font-extrabold uppercase tracking-widest mb-1.5',
                isPresident ? 'text-primary-600' : 'text-accent-600'
              )}
            >
              {roleLabel}
            </p>
            <h3
              className={cn(
                'text-xl sm:text-2xl font-extrabold leading-tight',
                hasName ? 'text-secondary-900' : 'text-secondary-400 italic'
              )}
            >
              {nameDisplay}
            </h3>
            <p className="mt-1 text-sm text-secondary-600 font-medium leading-snug">
              {profile.designation || `Prarthana PU Science College`}
            </p>
          </div>

          {/* Message */}
          <div className="relative mt-2 flex-1 flex flex-col">
            <Quote
              size={28}
              className={cn(
                'mb-2',
                isPresident ? 'text-primary-200' : 'text-accent-200'
              )}
              fill="currentColor"
              aria-hidden="true"
            />
            <p className="text-sm sm:text-[15px] leading-relaxed text-secondary-700">
              {profile.message?.trim() ||
                `This message is managed through the Admin CMS. Please update the ${roleLabel} message in the Leadership / Site Settings section of the Admin Panel.`}
            </p>
          </div>

          {/* Signature / bottom bar */}
          <div
            className={cn(
              'mt-5 pt-4 border-t flex items-center justify-between',
              isPresident ? 'border-primary-100' : 'border-accent-100'
            )}
          >
            <span className="text-xs text-secondary-500 font-medium">
              Prarthana PU Science College
            </span>
            <span
              className={cn(
                'inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full',
                isPresident
                  ? 'bg-primary-50 text-primary-700'
                  : 'bg-accent-50 text-accent-700'
              )}
            >
              Est. 2015 · Bagalkot
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function ManagementPreview() {
  const cms = useCMS();
  const president = cms.leadership?.president;
  const principal = cms.leadership?.principal;

  return (
    <section
      className="py-16 md:py-24 bg-gradient-to-b from-secondary-50 via-white to-secondary-50 relative overflow-hidden"
      aria-labelledby="leadership-title"
    >
      {/* Decorative glows */}
      <div className="absolute top-10 -left-20 w-80 h-80 rounded-full bg-primary-100/50 blur-3xl opacity-70 pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-10 -right-20 w-80 h-80 rounded-full bg-accent-100/50 blur-3xl opacity-70 pointer-events-none" aria-hidden="true" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <SectionTitle
          eyebrow="College Leadership"
          title="Meet Our President & Principal"
          subtitle="Guided by visionary leadership, our management team is dedicated to shaping the future of every student at Prarthana PU Science College."
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 max-w-6xl mx-auto items-stretch"
        >
          {president && (
            <LeaderCard
              role="president"
              profile={president}
              fallbackPhoto={presidentFallback.photo}
            />
          )}
          {principal && (
            <LeaderCard
              role="principal"
              profile={principal}
              fallbackPhoto={principalFallback.photo}
            />
          )}
        </motion.div>
      </div>
    </section>
  );
}
