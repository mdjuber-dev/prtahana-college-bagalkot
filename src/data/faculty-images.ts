/**
 * ============================================================================
 * FACULTY IMAGES CONFIGURATION
 * ============================================================================
 * HOW TO CHANGE FACULTY IMAGES:
 * 1. Place faculty photos inside: public/images/faculty/
 *    Files: faculty-1.jpg through faculty-20.jpg
 * 2. Update faculty member names, designations, and departments below.
 * 3. NO REACT/COMPONENT CODE NEEDS TO BE TOUCHED.
 * ============================================================================
 */

export interface FacultyImage {
  id: number;
  image: string;
  src: string; // Alias for component compatibility
  photo: string; // Alias for faculty cards
  name: string;
  designation: string;
  qualification: string;
  department: string;
  experience: string;
  alt: string;
}

const facultyNames = [
  'Dr. Suresh Hiremath', 'Prof. Ramesh Kulkarni', 'Dr. Sunita Patil', 'Prof. Mahesh Joshi',
  'Dr. Rajesh Deshmukh', 'Prof. Anitha Rao', 'Dr. Veena Kulkarni', 'Prof. Praveen Yaragatti',
  'Dr. Sangeetha S', 'Prof. Anand Metri', 'Dr. Basavaraj Chittaragi', 'Prof. Lakshmi Salimath',
  'Dr. Gururaj Hukkeri', 'Prof. Pooja Mulgund', 'Dr. Santosh Nidashundi', 'Prof. Deepa Bagalkot',
  'Dr. Mallikarjun Galagali', 'Prof. Rekha Savadi', 'Dr. Vijay Badami', 'Prof. Sunita Kerur',
];

const departments = ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'Computer Science'];

export const facultyImages: FacultyImage[] = Array.from({ length: 20 }, (_, index) => {
  const num = index + 1;
  const department = departments[index % departments.length];
  const name = facultyNames[index];
  const imagePath = `/images/faculty/faculty-${num}.jpg`;

  return {
    id: num,
    image: imagePath,
    src: imagePath,
    photo: imagePath,
    name,
    designation: index === 0 ? 'Principal & Senior Faculty' : `Head of ${department} Department`,
    qualification: index % 2 === 0 ? 'Ph.D. in Science' : 'M.Sc., B.Ed.',
    department,
    experience: `${10 + (index % 12)} Years`,
    alt: `${name} - ${department} Faculty at Prarthana PU Science College`,
  };
});
