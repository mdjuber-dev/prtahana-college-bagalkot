/**
 * ============================================================================
 * ABOUT SECTION IMAGES CONFIGURATION
 * ============================================================================
 * HOW TO CHANGE ABOUT IMAGES:
 * 1. Place about section images inside: public/images/about/
 *    Files: about-1.jpg, about-2.jpg, about-3.jpg, about-4.jpg, about-5.jpg
 * 2. Update titles or descriptions below as needed.
 * 3. NO REACT/COMPONENT CODE NEEDS TO BE TOUCHED.
 * ============================================================================
 */

export interface AboutImage {
  id: number;
  image: string;
  src: string; // Alias for component compatibility
  title: string;
  description: string;
  alt: string;
}

export const aboutImages: AboutImage[] = [
  {
    id: 1,
    image: '/prathanaclg-pht.png',
    src: '/prathanaclg-pht.png',
    title: 'Our Campus & Vision',
    description: 'Prarthana PU Science College campus building and green surroundings in Bagalkot.',
    alt: 'Prarthana PU Science College campus view',
  },
  {
    id: 2,
    image: '/images/about/about-2.jpg',
    src: '/images/about/about-2.jpg',
    title: 'Academic Environment',
    description: 'Dedicated faculty mentoring students in smart digital classrooms.',
    alt: 'Students learning in classroom at Prarthana PU Science College',
  },
  {
    id: 3,
    image: '/images/about/about-3.jpg',
    src: '/images/about/about-3.jpg',
    title: 'Science Laboratories',
    description: 'Equipped Physics, Chemistry and Biology laboratories for hands-on experimentation.',
    alt: 'Science laboratory practical session',
  },
  {
    id: 4,
    image: '/images/about/about-4.jpg',
    src: '/images/about/about-4.jpg',
    title: 'Library & Learning Hub',
    description: 'Vast collection of books, journals and digital resources for deep study.',
    alt: 'College central library and reading area',
  },
  {
    id: 5,
    image: '/images/about/about-5.jpg',
    src: '/images/about/about-5.jpg',
    title: 'Vibrant Campus Life',
    description: 'Cultural events, sports competitions and holistic student development activities.',
    alt: 'Campus sports and cultural event celebrations',
  },
];
