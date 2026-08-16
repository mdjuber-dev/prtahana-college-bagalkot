import { useState } from 'react';
import SectionTitle from '@/components/shared/section-title';
import GalleryCarousel from '@/components/carousels/gallery-carousel';
import Lightbox from '@/components/gallery/lightbox';
import GradientButton from '@/components/shared/gradient-button';
import { useCMS } from '@/lib/cms-context';

export default function CampusLife() {
  const cms = useCMS();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const previewImages = (cms.galleryImages || []).filter((g) => g.src && g.src.trim() !== '').slice(0, 12).map((g) => ({ src: g.src, alt: g.alt, title: g.title, width: g.width, height: g.height }));

  return (
    <section className="py-16 md:py-24" aria-labelledby="campus-life-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle eyebrow="Campus Life" title="Life at Prarthana" subtitle="Experience the vibrant campus life through our photo gallery." />
      </div>
      <div className="mt-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <GalleryCarousel images={previewImages} onImageClick={(i) => setLightboxIndex(i)} interval={3000} />
      </div>
      <div className="text-center mt-8">
        <GradientButton to="/gallery" variant="outline">View Full Gallery</GradientButton>
      </div>
      <Lightbox images={previewImages} index={lightboxIndex} onClose={() => setLightboxIndex(null)} onNavigate={setLightboxIndex} />
    </section>
  );
}
