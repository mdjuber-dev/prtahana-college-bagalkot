import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Award, TrendingUp, FileText } from 'lucide-react';
import PageHero from '@/components/shared/page-hero';
import CTASection from '@/components/shared/cta-section';
import Lightbox from '@/components/gallery/lightbox';
import {
  achievers as staticAchievers,
  examTabs,
  examMeta,
  posterGalleries as staticPosterGalleries,
  type ExamType,
  type AchievementPoster,
  type Achiever,
} from '@/lib/achievers-data';
import { useCMS } from '@/lib/cms-context';
import { fadeInUp, staggerContainer } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { getMediaUrl } from '@/lib/media-url';

const stats = [
  { icon: Trophy, value: '500+', label: 'Top Rank Holders' },
  { icon: Star, value: '98%', label: 'Pass Percentage' },
  { icon: Award, value: '150+', label: 'NEET Selections' },
  { icon: TrendingUp, value: '200+', label: 'KCET Ranks' },
];

type LightboxSource =
  | { type: 'cards'; index: number }
  | { type: 'posters'; index: number }
  | null;

export default function AchievementsPage() {
  const cms = useCMS();
  const [activeTab, setActiveTab] = useState<ExamType>('ALL');
  const [lightboxSource, setLightboxSource] = useState<LightboxSource>(null);

  const achievers = useMemo((): { ALL: Achiever[] } => ({
    ALL: cms.achievers.ALL?.length ? cms.achievers.ALL.map((a) => ({
      id: Number(a.id) || 0,
      name: a.name,
      rank: a.rank,
      score: a.score,
      exam: a.exam as ExamType,
      year: a.year,
      course: a.course,
      photo: a.photo,
    })) : staticAchievers.ALL,
  }), [cms.achievers.ALL]);

  const posterGalleries = useMemo(() => ({
    NEET: (cms.posterGalleries.NEET?.length ? cms.posterGalleries.NEET : staticPosterGalleries.NEET) as AchievementPoster[],
    KCET: (cms.posterGalleries.KCET?.length ? cms.posterGalleries.KCET : staticPosterGalleries.KCET) as AchievementPoster[],
    JEE: (cms.posterGalleries.JEE?.length ? cms.posterGalleries.JEE : staticPosterGalleries.JEE) as AchievementPoster[],
  }), [cms.posterGalleries]);

  const currentAchievers = activeTab === 'ALL' ? (achievers.ALL ?? []) : [];
  const currentPosters: AchievementPoster[] = useMemo(() => {
    if (activeTab === 'ALL') return [];
    return posterGalleries[activeTab as 'NEET' | 'KCET' | 'JEE'] ?? [];
  }, [activeTab]);

  // Unified lightbox images + index based on active source (cards vs posters).
  const { lightboxImages, lightboxIndex } = useMemo(() => {
    if (lightboxSource?.type === 'cards') {
      return {
        lightboxImages: currentAchievers.map((a: { photo: string; name: string; rank: string }) => ({
          src: a.photo,
          alt: a.name,
          title: `${a.name} — ${a.rank}`,
        })),
        lightboxIndex: lightboxSource.index,
      };
    }
    if (lightboxSource?.type === 'posters') {
      return {
        lightboxImages: currentPosters.map((p) => ({
          src: p.src,
          alt: p.alt,
          title: p.title,
        })),
        lightboxIndex: lightboxSource.index,
      };
    }
    return { lightboxImages: [], lightboxIndex: null };
  }, [lightboxSource, currentAchievers, currentPosters]);

  const activeMeta = examMeta[activeTab];
  const isCardsView = activeMeta.kind === 'cards';

  return (
    <>
      <PageHero
        eyebrow="Our Pride"
        title="Achievements & Results"
        subtitle="Celebrating the success of our students who have made us proud in board and competitive examinations."
      />

      {/* Stats Bar */}
      <section className="py-16 md:py-20" aria-labelledby="stats-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  variants={fadeInUp}
                  className="bg-white rounded-2xl p-6 text-center shadow-soft"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center mx-auto mb-4">
                    <Icon className="text-white" size={28} />
                  </div>
                  <p className="text-3xl md:text-4xl font-bold text-secondary-900 mb-1">
                    {stat.value}
                  </p>
                  <p className="text-sm text-secondary-600">{stat.label}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Tabbed Achievers / Posters Grid */}
      <section
        className="py-16 md:py-24 bg-secondary-50 relative overflow-hidden"
        aria-labelledby="achievers-title"
      >
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: 'url(/images/classrooms/classroom-1.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-10">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary-50 text-primary-700 text-sm font-semibold mb-4">
              {isCardsView ? 'Meet Our Toppers' : `${activeMeta.label} Result Posters`}
            </span>
            <h2
              id="achievers-title"
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-secondary-900 mb-4"
            >
              {isCardsView ? 'Our Star Achievers' : `${activeMeta.label} Achievements`}
            </h2>
            <p className="text-base md:text-lg text-secondary-600 max-w-2xl mx-auto">
              {activeMeta.description}
            </p>
          </div>

          {/* Tab Buttons */}
          <div
            className="flex flex-wrap justify-center gap-3 mb-12"
            role="tablist"
            aria-label="Achievement categories"
          >
            {examTabs.map((tab) => {
              const meta = examMeta[tab];
              return (
                <button
                  key={tab}
                  role="tab"
                  aria-selected={activeTab === tab}
                  aria-label={`Show ${meta.label} ${meta.kind === 'cards' ? 'student achievers' : 'posters'}`}
                  onClick={() => {
                    setActiveTab(tab);
                    setLightboxSource(null);
                  }}
                  className={cn(
                    'px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-300',
                    activeTab === tab
                      ? 'bg-gradient-primary text-white shadow-glow'
                      : 'bg-white text-secondary-700 hover:bg-primary-50 hover:text-primary-700 shadow-soft',
                  )}
                >
                  {meta.label}
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            {isCardsView ? (
              // ───────── ALL tab — 20 student cards ─────────
              <motion.div
                key={`cards-${activeTab}`}
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0 }}
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6"
              >
                {currentAchievers.map((achiever: Achiever, index: number) => (
                  <motion.div
                    key={`card-${activeTab}-${achiever.id}`}
                    variants={fadeInUp}
                    className="bg-white rounded-2xl overflow-hidden shadow-soft hover:shadow-glow transition-shadow duration-300 cursor-pointer group"
                    onClick={() =>
                      setLightboxSource({ type: 'cards', index })
                    }
                    role="button"
                    tabIndex={0}
                    aria-label={`View ${achiever.name}, ${achiever.rank}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setLightboxSource({ type: 'cards', index });
                      }
                    }}
                  >
                    <div className="relative aspect-square overflow-hidden">
                      <img
                        src={getMediaUrl(achiever.photo)}
                        alt={achiever.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-secondary-900/70 via-transparent to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <p className="text-white font-semibold text-sm">{achiever.score}</p>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-secondary-900 text-sm mb-1 truncate">
                        {achiever.name}
                      </h3>
                      <p className="text-xs text-secondary-500">
                        {achiever.course} · {achiever.year}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              // ───────── NEET / KCET / JEE tabs — Poster gallery ─────────
              <motion.div
                key={`posters-${activeTab}`}
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0 }}
              >
                {currentPosters.length === 0 ? (
                  <EmptyPosterState category={activeMeta.label} />
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {currentPosters.map((poster, index) => (
                      <motion.figure
                        key={`poster-${activeTab}-${poster.id}`}
                        variants={fadeInUp}
                        className="group relative cursor-pointer rounded-3xl bg-white border shadow-soft overflow-hidden hover:shadow-glow transition-all duration-300"
                        onClick={() =>
                          setLightboxSource({ type: 'posters', index })
                        }
                        role="button"
                        tabIndex={0}
                        aria-label={`Open poster: ${poster.title}`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setLightboxSource({ type: 'posters', index });
                          }
                        }}
                      >
                        {/* Poster frame — keeps full poster visible with object-contain.
                            Uses a 4:5 portrait aspect so vertical poster designs have
                            generous room without cropping important content. */}
                        <div className="relative w-full bg-secondary-50 aspect-[4/5] flex items-center justify-center p-4">
                          <img
                            src={getMediaUrl(poster.src)}
                            alt={poster.alt}
                            title={poster.title}
                            className="max-w-full max-h-full w-auto h-auto object-contain rounded-2xl transition-transform duration-500 group-hover:scale-[1.03]"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-black/5 pointer-events-none" />
                        </div>
                        <figcaption className="p-5 flex items-center justify-between gap-4 border-t bg-gradient-to-br from-white to-secondary-50">
                          <div className="min-w-0">
                            <p className="text-xs font-bold uppercase tracking-wider text-primary-700 mb-1">
                              {activeMeta.label} Poster
                            </p>
                            <h3 className="font-bold text-secondary-900 truncate">
                              {poster.title}
                            </h3>
                          </div>
                          <span className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-900/5 text-primary-800 text-[11px] font-bold ring-1 ring-inset ring-primary-900/10 group-hover:bg-primary-900 group-hover:text-white transition-colors">
                            <FileText size={12} /> View
                          </span>
                        </figcaption>
                      </motion.figure>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Shared Lightbox — reuses the existing reusable Lightbox component. */}
      <Lightbox
        images={lightboxImages}
        index={lightboxIndex}
        onClose={() => setLightboxSource(null)}
        onNavigate={(nextIndex) => {
          if (lightboxSource?.type === 'cards') {
            setLightboxSource({ type: 'cards', index: nextIndex });
          } else if (lightboxSource?.type === 'posters') {
            setLightboxSource({ type: 'posters', index: nextIndex });
          }
        }}
      />

      <CTASection
        title="Want to Be Our Next Topper?"
        subtitle="Join Prarthana PU Science College and let us help you achieve your dreams."
      />
    </>
  );
}

function EmptyPosterState({ category }: { category: string }) {
  return (
    <motion.div
      variants={fadeInUp}
      className="max-w-2xl mx-auto rounded-3xl border-2 border-dashed border-secondary-300 bg-white/60 backdrop-blur-sm p-10 md:p-14 text-center shadow-soft"
    >
      <div className="w-16 h-16 rounded-2xl bg-primary-50 border border-primary-200 flex items-center justify-center mx-auto mb-5">
        <FileText className="text-primary-700" size={28} />
      </div>
      <h3 className="text-xl md:text-2xl font-bold text-secondary-900 mb-2">
        No achievement posters available yet.
      </h3>
      <p className="text-sm md:text-base text-secondary-600 max-w-lg mx-auto leading-relaxed">
        {category} result posters will be displayed here once they are added to the
        achievement gallery. Please check back soon.
      </p>
    </motion.div>
  );
}
