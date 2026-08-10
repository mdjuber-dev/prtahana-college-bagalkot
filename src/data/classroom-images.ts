/**
 * ============================================================================
 * CLASSROOM IMAGES CONFIGURATION
 * ============================================================================
 * HOW TO CHANGE CLASSROOM IMAGES:
 * 1. Place classroom photos inside: public/images/classrooms/
 *    Files: classroom-1.jpg through classroom-20.jpg
 * 2. Update titles or descriptions below as needed.
 * 3. NO REACT/COMPONENT CODE NEEDS TO BE TOUCHED.
 * ============================================================================
 */

export interface ClassroomImage {
  id: number;
  image: string;
  src: string; // Alias for component compatibility
  title: string;
  description: string;
  alt: string;
}

export const classroomImages: ClassroomImage[] = Array.from({ length: 20 }, (_, index) => {
  const num = index + 1;
  const titles = [
    'Smart Interactive Classroom 101',
    'Physics Lecture Theatre',
    'Chemistry Smart Classroom',
    'Mathematics Seminar Hall',
    'Biology Interactive Learning Room',
    'NEET Integrated Batch Classroom',
    'KCET Special Coaching Room',
    'JEE Advanced Practice Hall',
    'Digital Audio-Visual Room',
    'Group Discussion Classroom',
    'Modern Tiered Classroom',
    'PCMB Stream Lecture Room',
    'PCMC Tech Classroom',
    'Advanced Computer Science Room',
    'Spacious Ergonomic Classroom',
    'Doubt Clearing Desk & Classroom',
    'Revision & Test Examination Hall',
    'Competitive Exam Foundation Room',
    'Mentorship Discussion Room',
    'Interactive Projection Classroom',
  ];

  const imagePath = `/images/classrooms/classroom-${num}.jpg`;

  return {
    id: num,
    image: imagePath,
    src: imagePath,
    title: titles[index],
    description: `Modern classroom ${titles[index]} at Prarthana PU Science College, Bagalkot.`,
    alt: `Prarthana PU Science College - ${titles[index]}`,
  };
});
