/**
 * Re-exporting gallery data from centralized data configuration files.
 * To add/change images or videos, modify the files in src/data/ instead of this file.
 */
import { galleryImages as dataGalleryImages, type GalleryImage as DataGalleryImage } from '@/data/gallery-images';
import { videos as dataVideos, type VideoData } from '@/data/video-data';
import { heroImages as dataHeroImages, type HeroImage } from '@/data/hero-images';

export type GalleryImage = DataGalleryImage;
export type GalleryVideo = VideoData;

export const galleryCategories = ['All', 'Campus', 'Laboratories', 'Classrooms', 'Library', 'Events', 'Videos'] as const;

export const galleryImages: GalleryImage[] = dataGalleryImages;
export const galleryVideos: GalleryVideo[] = dataVideos;
export const heroImages: HeroImage[] = dataHeroImages;
