/**
 * ============================================================================
 * LIBRARY IMAGES CONFIGURATION
 * ============================================================================
 * HOW TO CHANGE LIBRARY IMAGES:
 * 1. Place library photos inside: public/images/library/
 *    Files: library-1.jpg through library-20.jpg
 * 2. Update library section titles below.
 * 3. NO REACT/COMPONENT CODE NEEDS TO BE TOUCHED.
 * ============================================================================
 */

export interface LibraryImage {
  id: number;
  image: string;
  src: string; // Alias for component compatibility
  title: string;
  description: string;
  alt: string;
}

export const libraryImages: LibraryImage[] = Array.from({ length: 20 }, (_, index) => {
  const num = index + 1;
  const titles = [
    'Central Library Main Reading Hall',
    'Science Reference Book Section',
    'Digital E-Library & Computer Terminals',
    'Competitive Exam Corner (NEET/JEE/KCET)',
    'Quiet Individual Study Cubicles',
    'Periodicals & Scientific Journals Shelf',
    'Physics Research Collection',
    'Chemistry Advanced Reference Books',
    'Biology & Medical Entrance Library',
    'Mathematics & Engineering Reference Books',
    'Audio-Visual Learning Station',
    'Student Group Study Room',
    'Librarian Assistance Desk',
    'Book Circulation & Issue Counter',
    'New Arrivals Display Board',
    'National Geographic & Science Magazine Desk',
    'Digital Repository & E-Book Portal',
    'Silent Reading Zone',
    'Archives & Past Board Question Papers Desk',
    'Spacious Natural Light Reading Bay',
  ];

  const imagePath = `/images/library/library-${num}.jpg`;

  return {
    id: num,
    image: imagePath,
    src: imagePath,
    title: titles[index],
    description: `Library facility ${titles[index]} at Prarthana PU Science College, Bagalkot.`,
    alt: `Prarthana PU Science College - ${titles[index]}`,
  };
});
