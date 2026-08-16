import { Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import SectionTitle from '@/components/shared/section-title';
import MarqueeCarousel from '@/components/carousels/marquee-carousel';
import { achievers, type Achiever } from '@/lib/achievers-data';

function AchieverCard({ achiever }: { achiever: Achiever }) {
  return (
    <div className="w-72 shrink-0 mx-2 bg-white rounded-2xl p-5 card-shadow hover:shadow-premium transition-shadow duration-300">
      <div className="flex items-center gap-3 mb-3">
        <img
          src={achiever.photo}
          alt={`${achiever.name} - ${achiever.exam} topper`}
          className="w-12 h-12 rounded-full object-cover shrink-0"
          loading="lazy"
          decoding="async"
          width={48}
          height={48}
        />
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-secondary-900 truncate">{achiever.name}</h3>
          <p className="text-xs text-secondary-500">{achiever.course}</p>
        </div>
      </div>
      <div className="flex items-center justify-between text-sm">
        <div><p className="text-xs text-secondary-500">Score</p><p className="font-bold text-primary-700">{achiever.score}</p></div>
        <div className="text-right"><p className="text-xs text-secondary-500">Rank</p><p className="font-bold text-accent-600">{achiever.rank}</p></div>
        <div className="text-right"><p className="text-xs text-secondary-500">Year</p><p className="font-bold text-secondary-700">{achiever.year}</p></div>
      </div>
      <div className="mt-2 flex gap-0.5" aria-label="5 out of 5 stars">
        {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="text-accent-400" size={12} fill="currentColor" />)}
      </div>
    </div>
  );
}

export default function AchievementsShowcase() {
  return (
    <section className="py-16 md:py-24 bg-secondary-50 overflow-hidden" aria-labelledby="achievements-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle eyebrow="Our Toppers" title="Achievements Showcase" subtitle="Celebrating the success of our students in board and competitive examinations." />
      </div>
      <div className="mt-12 space-y-6">
        <div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-3">
            <h3 className="text-lg font-bold text-secondary-900 flex items-center gap-2">
              <span className="w-1 h-6 rounded-full bg-gradient-primary" />
              Our Star Achievers
            </h3>
          </div>
          <MarqueeCarousel speed={30}>
            {(achievers['ALL'] ?? []).map((achiever: Achiever) => (
              <AchieverCard key={achiever.id} achiever={achiever} />
            ))}
          </MarqueeCarousel>
        </div>
      </div>
      <div className="text-center mt-12">
        <Link to="/achievements" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-primary text-white font-semibold rounded-lg hover:shadow-glow transition-all">
          View All Achievements
        </Link>
      </div>
    </section>
  );
}
