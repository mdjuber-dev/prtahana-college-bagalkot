/**
 * ============================================================================
 * VIDEO DATA CONFIGURATION
 * ============================================================================
 * HOW TO CHANGE VIDEOS:
 * 1. Place your video files inside: public/videos/
 *    Files: hero-video.mp4, campus-tour.mp4, lab-tour.mp4, annual-day.mp4, sports.mp4
 * 2. Update the video objects below with titles, video paths, or thumbnail image paths.
 * 3. NO REACT/COMPONENT CODE NEEDS TO BE TOUCHED.
 * ============================================================================
 */

export interface VideoData {
  id: number;
  title: string;
  video: string;
  src: string; // Alias for component compatibility
  thumbnail: string;
  poster: string; // Alias for component compatibility
  category: string;
  alt: string;
}

export const videos: VideoData[] = [
  {
    id: 1,
    title: 'Kiran opinion',
    video: '/videos/kiran_bgk.mp4',
    src: '/videos/kiran_bgk.mp4',
    thumbnail: '/iprathanaclg-pht.png',
    poster: '/prathanaclg-pht.png',
    category: 'Campus',
    alt: 'Kiran opinion',
  },
  {
    id: 2,
    title: 'yashoda opinion',
    video: '/videos/yashoda_bgk.mp4',
    src: '/videos/yashoda_bgk.mp4',
    thumbnail: '/prathanaclg-pht.png',
    poster: '/prathanaclg-pht.png',
    category: 'Hero',
    alt: 'yashoda opinion',
  },
  {
    id: 3,
    title: 'kannada sir opinion',
    video: '/videos/kannada_bgk.mp4',
    src: '/videos/kannada_bgk.mp4',
    thumbnail: '/prathanaclg-pht.png',
    poster: '/prathanaclg-pht.png',
    category: 'Laboratories',
    alt: 'kannada sir video at Prarthana PU College',
  },
  {
    id: 4,
    title: 'faculty review',
    video: '/videos/faculty.mp4',
    src: '/videos/faculty.mp4',
    thumbnail: '/images/events/prathanaclg-pht.jpg',
    poster: '/images/events/prathanaclg-pht.jpg',
    category: 'Events',
    alt: 'faculty review video at Prarthana PU Science College',
  },
];
