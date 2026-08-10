import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import SectionTitle from '@/components/shared/section-title';
import { staggerContainer, fadeInUp } from '@/lib/motion';
import { achievementImages } from '@/data/achievement-images';

interface Testimonial {
  name: string;
  role: string;
  quote: string;
  rating: number;
  photo: string;
}

const testimonials: Testimonial[] = [
  {
    name: 'Akash Bajannavar',
    role: 'NEET 2024 Qualifier',
    quote:
      'Prarthana PU College gave me the perfect platform to chase my medical dream. The integrated coaching and dedicated teachers made all the difference in my NEET preparation.',
    rating: 5,
    photo: achievementImages[0].photo,
  },
  {
    name: 'Rahul Hegde',
    role: 'KCET Rank Holder 2023',
    quote:
      'The faculty at Prarthana goes above and beyond to ensure every concept is crystal clear. The small batch sizes meant I always got the personal attention I needed.',
    rating: 5,
    photo: achievementImages[1].photo,
  },
  {
    name: 'Sneha Joshi',
    role: 'Parent',
    quote:
      'As a parent, I am thrilled with the holistic development my daughter received here. Beyond academics, the college instills values and confidence that last a lifetime.',
    rating: 5,
    photo: achievementImages[2].photo,
  },
];

export default function Testimonials() {
  return (
    <section className="py-16 md:py-24 bg-secondary-50" aria-labelledby="testimonials-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="Testimonials"
          title="What Our Students & Parents Say"
          subtitle="Real stories from the Prarthana family — students who achieved their dreams and parents who trusted us."
        />
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="mt-12 grid md:grid-cols-3 gap-6"
        >
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.name}
              variants={fadeInUp}
              className="bg-white rounded-2xl p-6 sm:p-7 card-shadow hover:shadow-premium transition-shadow duration-300 flex flex-col"
            >
              {/* Quote icon */}
              <div className="mb-4">
                <Quote size={36} className="text-primary-100" fill="currentColor" aria-hidden="true" />
              </div>
              {/* Star rating */}
              <div
                className="flex gap-1 mb-4"
                aria-label={`${testimonial.rating} out of 5 stars`}
              >
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    className={i < testimonial.rating ? 'text-accent-400' : 'text-secondary-200'}
                    fill="currentColor"
                    aria-hidden="true"
                  />
                ))}
              </div>
              {/* Quote text */}
              <p className="text-sm sm:text-base text-secondary-700 leading-relaxed italic flex-1">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              {/* Author */}
              <div className="mt-6 flex items-center gap-3 pt-4 border-t border-secondary-100">
                <img
                  src={testimonial.photo}
                  alt={`${testimonial.name} - ${testimonial.role}`}
                  className="w-12 h-12 rounded-full object-cover shrink-0"
                  loading="lazy"
                  decoding="async"
                  width={48}
                  height={48}
                />
                <div>
                  <p className="font-bold text-secondary-900 text-sm sm:text-base">{testimonial.name}</p>
                  <p className="text-xs sm:text-sm text-secondary-500">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
