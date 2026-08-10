/**
 * ============================================================================
 * LAB IMAGES CONFIGURATION
 * ============================================================================
 * HOW TO CHANGE LAB IMAGES:
 * 1. Place lab images inside: public/images/labs/
 *    Files: lab-1.jpg through lab-20.jpg
 * 2. Update titles, lab categories, or descriptions below as needed.
 * 3. NO REACT/COMPONENT CODE NEEDS TO BE TOUCHED.
 * ============================================================================
 */

export interface LabImage {
  id: number;
  image: string;
  src: string; // Alias for component compatibility
  title: string;
  category: 'Physics' | 'Chemistry' | 'Biology' | 'Computer Science';
  description: string;
  alt: string;
}

export const labImages: LabImage[] = Array.from({ length: 20 }, (_, index) => {
  const num = index + 1;
  const categories: ('Physics' | 'Chemistry' | 'Biology' | 'Computer Science')[] = [
    'Physics', 'Chemistry', 'Biology', 'Computer Science'
  ];
  const category = categories[index % categories.length];
  const titles = [
    'Advanced Physics Optics Lab',
    'Organic Chemistry Reaction Lab',
    'Microbiology & Cytology Lab',
    'High Performance Computer Lab',
    'Electromagnetism Physics Station',
    'Analytical Chemistry Titration Desk',
    'Human Anatomy & Botany Specimen Lab',
    'AI & Data Science Computer Workstation',
    'Mechanics & Wave Motion Setup',
    'Chemical Spectrophotometry Unit',
    'Genetics & Biotechnology Microscope Lab',
    'Programming & Electronics Workstation',
    'Atomic & Nuclear Physics Setup',
    'Inorganic Synthesis Station',
    'Plant Physiology Observation Lab',
    'Cloud Computing & Coding Lab',
    'Semiconductor Physics Bench',
    'Biochemistry Analysis Station',
    'Zoology Specimen Exhibition Lab',
    'Cybersecurity & Networking Lab',
  ];

  const imagePath = `/images/labs/lab-${num}.jpg`;

  return {
    id: num,
    image: imagePath,
    src: imagePath,
    title: titles[index],
    category,
    description: `State-of-the-art ${category} laboratory facility at Prarthana PU Science College, Bagalkot.`,
    alt: `Prarthana PU Science College - ${titles[index]}`,
  };
});
