/**
 * ============================================================================
 * GALLERY IMAGES CONFIGURATION
 * ============================================================================
 * HOW TO CHANGE GALLERY IMAGES:
 * 1. Place gallery images inside: public/images/gallery/
 *    Files: gallery-1.jpg through gallery-20.jpg
 * 2. Update the entries in the array below to change titles, categories, or paths.
 * 3. NO REACT/COMPONENT CODE NEEDS TO BE TOUCHED.
 * ============================================================================
 */

export interface GalleryImage {
  id: number;
  image: string;
  src: string; // Alias for component compatibility
  alt: string;
  title: string;
  category: string;
  width: number;
  height: number;
}

export const galleryCategories = [
  'All',
  'Campus',
  'Laboratories',
  'Classrooms',
  'Library',
  'Events',
] as const;

export const galleryImages: GalleryImage[] = Array.from({ length: 20 }, (_, index) => {
  const num = index + 1;
  const categories = ['Campus', 'Laboratories', 'Classrooms', 'Library', 'Events'];
  const category = categories[index % categories.length];
  const titles = [
    'Main Campus Building',
    'Campus Entrance Gardens',
    'Biology Laboratory',
    'Chemistry Laboratory',
    'Physics Laboratory',
    'Smart Digital Classroom',
    'Lecture Hall Overview',
    'Computer Science Lab',
    'Central College Library',
    'Library Quiet Reading Area',
    'Annual Cultural Day',
    'Sports Meet Competition',
    'State Level Science Exhibition',
    'Student Cultural Performance',
    'Graduation Ceremony',
    'Green Walkway & Courtyard',
    'Campus Landscape Garden',
    'Multipurpose Seminar Hall',
    'Robotics & AI Innovation Lab',
    'Student Lounge & Discussion Area',
  ];

  const imagePath = `/images/gallery/gallery-${num}.jpg`;

  return {
    id: num,
    image: imagePath,
    src: imagePath,
    alt: `Prarthana PU Science College - ${titles[index]}`,
    title: titles[index],
    category,
    width: 800,
    height: 600,
  };
});
