/**
 * ============================================================================
 * CAMPUS IMAGES CONFIGURATION
 * ============================================================================
 * HOW TO CHANGE CAMPUS IMAGES:
 * 1. Place campus photos inside: public/images/campus/
 *    Files: campus-1.jpg through campus-20.jpg
 * 2. Update titles or descriptions below as needed.
 * 3. NO REACT/COMPONENT CODE NEEDS TO BE TOUCHED.
 * ============================================================================
 */

export interface CampusImage {
  id: number;
  image: string;
  src: string; // Alias for component compatibility
  title: string;
  description: string;
  alt: string;
}

export const campusImages: CampusImage[] = Array.from({ length: 20 }, (_, index) => {
  const num = index + 1;
  const titles = [
    'Main Academic Block',
    'Lush Green Campus Lawn',
    'Student Amphitheatre',
    'Administrative Block',
    'Central Courtyard',
    'Student Cafeteria',
    'Boys Hostel Facility',
    'Girls Hostel Facility',
    'College Sports Complex',
    'Outdoor Basketball Court',
    'Digital Auditorium',
    'Conference Hall',
    'Campus Botanical Garden',
    'Transport Bus Fleet',
    'Infirmary & First Aid Center',
    'Physics Research Block',
    'Chemistry Practical Center',
    'Biology Taxonomy Garden',
    'Computer Center Wing',
    'Open Air Study Pavilion',
  ];

  const imagePath = `/images/campus/campus-${num}.jpg`;

  return {
    id: num,
    image: imagePath,
    src: imagePath,
    title: titles[index],
    description: `State-of-the-art campus facility ${titles[index]} at Prarthana PU Science College, Bagalkot.`,
    alt: `Prarthana PU Science College - ${titles[index]}`,
  };
});
