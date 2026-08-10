import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play } from 'lucide-react';
import PageHero from '@/components/shared/page-hero';
import CTASection from '@/components/shared/cta-section';
import LazyImage from '@/components/gallery/lazy-image';
import Lightbox from '@/components/gallery/lightbox';
import { galleryImages as staticGalleryImages } from '@/data/gallery-images';
import { videos as staticGalleryVideos } from '@/data/video-data';
import { galleryCategories as staticGalleryCategories } from '@/lib/gallery-data';
import { useCMS } from '@/lib/cms-context';
import { fadeInUp, staggerContainer } from '@/lib/motion';
import { cn } from '@/lib/utils';

export default function GalleryPage() {
  const cms = useCMS();
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const galleryImages = cms.galleryImages?.length
    ? cms.galleryImages.map((g) => ({ id: Number(g.id) || 0, src: g.src, alt: g.alt, title: g.title, category: g.category, width: g.width, height: g.height }))
    : staticGalleryImages;

  const galleryVideos = cms.galleryVideos?.length
    ? cms.galleryVideos.map((v) => ({ id: Number(v.id) || 0, src: v.src, poster: v.poster, alt: v.alt, title: v.title, category: v.category }))
    : staticGalleryVideos;

  const galleryCategories = cms.galleryCategories?.length ? cms.galleryCategories : staticGalleryCategories;

  // Filter images by category (exclude "Videos" tab from image filtering)
  const filteredImages =
    activeCategory === 'All'
      ? galleryImages
      : galleryImages.filter((img) => img.category === activeCategory);

  const lightboxImages = filteredImages.map((img) => ({
    src: img.src,
    alt: img.alt,
    title: img.title,
  }));

  // Image category tabs
  const imageTabs = galleryCategories;

  return (
    <>
      <PageHero
        eyebrow="Campus Life"
        title="Gallery"
        subtitle="Explore photos and videos showcasing life at Prarthana PU Science College."
      />

      {/* Image Gallery */}
      <section className="py-16 md:py-24" aria-labelledby="gallery-images-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary-50 text-primary-700 text-sm font-semibold mb-4">
              Photo Gallery
            </span>
            <h2 id="gallery-images-title" className="text-3xl md:text-4xl lg:text-5xl font-bold text-secondary-900 mb-4">
              Our Campus in Pictures
            </h2>
            <p className="text-base md:text-lg text-secondary-600 max-w-2xl mx-auto">
              Browse through our collection of campus, laboratory, classroom, library, and event photos.
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-12" role="tablist" aria-label="Gallery categories">
            {imageTabs.map((category) => (
              <button
                key={category}
                role="tab"
                aria-selected={activeCategory === category}
                aria-label={`Filter gallery by ${category}`}
                onClick={() => setActiveCategory(category)}
                className={cn(
                  'px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-300',
                  activeCategory === category
                    ? 'bg-gradient-primary text-white shadow-glow'
                    : 'bg-white text-secondary-700 hover:bg-primary-50 hover:text-primary-700 shadow-soft'
                )}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Image Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
            >
              {filteredImages.map((image, index) => (
                <motion.div
                  key={image.id}
                  variants={fadeInUp}
                  className="relative rounded-2xl overflow-hidden shadow-soft hover:shadow-glow transition-shadow duration-300 cursor-pointer group"
                  onClick={() => setLightboxIndex(index)}
                  role="button"
                  tabIndex={0}
                  aria-label={`View ${image.title}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setLightboxIndex(index);
                    }
                  }}
                >
                  <LazyImage
                    src={image.src}
                    alt={image.alt}
                    title={image.title}
                    width={image.width}
                    height={image.height}
                    className="aspect-[4/3] group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-secondary-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <p className="text-white font-semibold text-sm">{image.title}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-16 md:py-24 bg-secondary-50" aria-labelledby="gallery-videos-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary-50 text-primary-700 text-sm font-semibold mb-4">
              Video Gallery
            </span>
            <h2 id="gallery-videos-title" className="text-3xl md:text-4xl lg:text-5xl font-bold text-secondary-900 mb-4">
              Watch Our Videos
            </h2>
            <p className="text-base md:text-lg text-secondary-600 max-w-2xl mx-auto">
              Take a visual tour of our campus, events, and student life.
            </p>
          </div>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="grid sm:grid-cols-2 gap-8"
          >
            {galleryVideos.map((video) => (
              <motion.div
                key={video.id}
                variants={fadeInUp}
                className="bg-white rounded-2xl overflow-hidden shadow-soft hover:shadow-glow transition-shadow duration-300"
              >
                <div className="relative aspect-video overflow-hidden group">
                  <video
                    src={video.src}
                    poster={video.poster}
                    controls
                    preload="none"
                    className="w-full h-full object-cover"
                    aria-label={video.alt}
                  >
                    <track kind="captions" />
                  </video>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:opacity-0 transition-opacity duration-300">
                    <div className="w-16 h-16 rounded-full bg-white/80 flex items-center justify-center">
                      <Play className="text-primary-600 ml-1" size={28} />
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-secondary-900">{video.title}</h3>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Lightbox */}
      <Lightbox
        images={lightboxImages}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
      />

      <CTASection
        title="Come Visit Our Campus"
        subtitle="Experience the Prarthana PU Science College difference in person. Schedule a campus tour today."
      />
    </>
  );
}
