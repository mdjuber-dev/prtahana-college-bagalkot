import { Play } from 'lucide-react';
import type { GalleryVideo } from '@/lib/gallery-data';
import { getMediaUrl } from '@/lib/media-url';

interface VideoCardProps { video: GalleryVideo; }

export default function VideoCard({ video }: VideoCardProps) {
  return (
    <div className="relative group rounded-2xl overflow-hidden card-shadow cursor-pointer" role="button" tabIndex={0} aria-label={`Play video: ${video.title}`}>
      <img src={getMediaUrl(video.src)} alt={video.alt} className="w-full aspect-video object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" decoding="async" />
      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform"><Play className="text-primary-700 ml-1" size={28} fill="currentColor" /></div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent"><h3 className="text-white font-semibold text-sm md:text-base">{video.title}</h3></div>
    </div>
  );
}
