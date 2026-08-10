/**
 * ============================================================================
 * ADMISSION IMAGES CONFIGURATION
 * ============================================================================
 * HOW TO CHANGE ADMISSION IMAGES:
 * 1. Place admission photos inside: public/images/admissions/
 *    Files: admission-1.jpg through admission-20.jpg
 * 2. Update admission banner titles and descriptions below.
 * 3. NO REACT/COMPONENT CODE NEEDS TO BE TOUCHED.
 * ============================================================================
 */

export interface AdmissionImage {
  id: number;
  image: string;
  src: string; // Alias for component compatibility
  title: string;
  description: string;
  alt: string;
}

export const admissionImages: AdmissionImage[] = Array.from({ length: 20 }, (_, index) => {
  const num = index + 1;
  const titles = [
    'Admissions Open 2026-27 Academic Session',
    'Integrated NEET & KCET Coaching Program',
    'PCMB Stream Science Admissions',
    'PCMC Computer Science Stream Admissions',
    'Merit & Integrated Coaching Admissions',
    'Student Counseling & Admission Guidance Desk',
    'Campus Visit & Parent Information Desk',
    'Scholarship & Merit Assessment Test Center',
    'Hostel & Boarding Admission Registration',
    'Transport Bus Pass Registration Counter',
    'Entrance Examination Orientation Desk',
    'Academic Counseling for Prospective Students',
    'Laboratory Facility Walkthrough Tour',
    'Library & E-Learning Resource Registration',
    'Sports & Extra-Curricular Orientation',
    'Special Doubt-Clearing Coaching Sessions',
    'Parent Testimonials & Trust Desk',
    'Fee Structure & Financial Aid Helpdesk',
    'Document Verification & Enrolment Desk',
    'Welcome Ceremony for New Batch Students',
  ];

  const imagePath = `/images/admissions/admission-${num}.jpg`;

  return {
    id: num,
    image: imagePath,
    src: imagePath,
    title: titles[index],
    description: `Admission guidance and registration for ${titles[index]} at Prarthana PU Science College, Bagalkot.`,
    alt: `Prarthana PU Science College Admission - ${titles[index]}`,
  };
});
