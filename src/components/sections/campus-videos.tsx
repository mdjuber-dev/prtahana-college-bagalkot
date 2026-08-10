import SectionTitle from '@/components/shared/section-title';
import VideoCarousel from '@/components/carousels/video-carousel';
import { videos } from '@/data/video-data';

export default function CampusVideos() {
  return (
    <section className="py-16 md:py-24 bg-secondary-50" aria-labelledby="campus-videos-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle eyebrow="Watch" title="Campus Videos" subtitle="Get a glimpse of life at Prarthana PU Science College through our video collection." />
        <div className="mt-12">
          <VideoCarousel videos={videos} interval={5000} />
        </div>
      </div>
    </section>
  );
}
