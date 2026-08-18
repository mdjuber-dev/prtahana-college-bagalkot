/**
 * ============================================================================
 * HERO IMAGES CONFIGURATION
 * ============================================================================
 * HOW TO CHANGE HERO IMAGES:
 * 1. Place your background hero images inside: public/images/hero/
 *    Files supported: prathanaclg-pht.png, prthanapu-pht.png
 * 2. To replace an image, replace the file in public/images/hero/ with the same name,
 *    or update the "image" path below to point to your new filename.
 * 3. NO REACT/COMPONENT CODE NEEDS TO BE TOUCHED TO UPDATE IMAGES.
 * ============================================================================
 */

export interface HeroImage {
  id: number;
  image: string;
  src: string; // Alias for component compatibility
  title: string;
  subtitle?: string;
  alt: string;
}

export const heroImages: HeroImage[] = [
  {
    id: 1,
    image: '/prathanaclg-pht.png',
    src: '/prathanaclg-pht.png',
    title: 'State-of-the-Art Science Campus',
    subtitle: 'Prarthana PU Science College, Bagalkot',
    alt: 'Prarthana PU Science College main campus hero view',
  },
  {
    id: 2,
    image: '/images/hero/prthanapu-pht.png',
    src: '/images/hero/prthanapu-pht.png',
    title: 'Integrated NEET, KCET & JEE Coaching',
    subtitle: 'Expert Guidance & Modern Facilities',
    alt: 'Students preparing for NEET, KCET & JEE exams',
  },
];
