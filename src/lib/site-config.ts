export const siteConfig = {
  name: 'Prarthana PU Science College',
  shortName: 'Prarthana PU College',
  url: 'https://prarthanapusciencecollege.in',
  email: 'info@prarthanapusciencecollege.in',
  phone: '+919481138788',
  phoneDisplay: '+91 94811 38788',
  phone2: '+917975217020',
  phone2Display: '+91 79752 17020',
  whatsapp: '919481138788',
  address: {
    line1: 'Prarthana PU Science College',
    line2: 'Daddenaver Hospital Campus',
    line3: 'Near Rural Police Station',
    city: 'Bagalkote',
    state: 'Karnataka',
    pincode: '587101',
    full: 'Prarthana PU Science College, Daddenaver Hospital Campus, Near Rural Police Station, Bagalkote, Karnataka 587101',
  },
  mapsEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3838.5!2d75.7!3d16.18!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTbCsDEwJzQ4LjAiTiA3NcKwNDInMTIuMCJF!5e0!3m2!1sen!2sin!4v1700000000000',
  social: {
    facebook: 'https://facebook.com/prarthanapusciencecollege',
    instagram: 'https://instagram.com/prarthanapusciencecollege',
    youtube: 'https://youtube.com/@prarthanapusciencecollege',
  },
  established: 2015,
  logo: '/logo.png',
} as const;

export interface NavItem { label: string; path: string; }

export const navItems: NavItem[] = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Courses', path: '/courses' },
  { label: 'Achievements', path: '/achievements' },
  { label: 'Gallery', path: '/gallery' },
  { label: 'Fee Structure', path: '/fee-structure' },
  { label: 'Transport', path: '/transport' },
  { label: 'Careers', path: '/careers' },
  { label: 'Admission', path: '/admission' },
  { label: 'Contact', path: '/contact' },
];

export interface PageMeta { title: string; description: string; keywords: string; canonical: string; }

export const pageMeta: Record<string, PageMeta> = {
  '/': { title: 'Prarthana PU Science College Bagalkot | Best PU College for NEET, KCET & JEE Coaching', description: 'Prarthana PU Science College, Bagalkot — the best PU science college in Karnataka offering PCMB & PCMC with integrated NEET, KCET & JEE coaching. Admissions open 2026-27.', keywords: 'Prarthana PU Science College, PU College Bagalkot, Best PU College in Bagalkot, PCMB Bagalkot, PCMC Bagalkot', canonical: '/' },
  '/about': { title: 'About Prarthana PU Science College | Our Story, Mission & Vision | Bagalkot', description: 'Learn about Prarthana PU Science College in Bagalkot — our journey since 2015, mission to empower students through quality science education.', keywords: 'About Prarthana PU College, PU Science College Bagalkot history', canonical: '/about' },
  '/courses': { title: 'Courses at Prarthana PU Science College | PCMB & PCMC with NEET, KCET & JEE Coaching', description: 'Explore PCMB and PCMC courses at Prarthana PU Science College Bagalkot with integrated coaching for NEET, KCET & JEE. Choose your path with two carefully designed course combinations.', keywords: 'PCMB Bagalkot, PCMC Bagalkot, PU Science courses, NEET Coaching Bagalkot, JEE Coaching Bagalkot', canonical: '/courses' },
  '/achievements': { title: 'Achievements & Results | Prarthana PU Science College Bagalkot | NEET, KCET & JEE Toppers', description: 'Celebrate the achievements of Prarthana PU Science College students — NEET, KCET, JEE & PU board exam toppers.', keywords: 'Prarthana PU College results, NEET toppers Bagalkot, KCET toppers', canonical: '/achievements' },
  '/gallery': { title: 'Gallery | Prarthana PU Science College Campus Life | Bagalkot', description: 'View photos and videos of campus life at Prarthana PU Science College Bagalkot.', keywords: 'Prarthana PU College gallery, campus photos Bagalkot', canonical: '/gallery' },
  '/fee-structure': { title: 'Fee Structure 2026–27 | Prarthana PU Science College Bagalkot | PCMB & PCMC Fees', description: 'Check the transparent and affordable fee structure for PCMB and PCMC at Prarthana PU Science College Bagalkot with merit scholarships available.', keywords: 'Prarthana PU College fee structure, PU science college fees Bagalkot, PCMB fees, PCMC fees', canonical: '/fee-structure' },
  '/transport': { title: 'Transport Facility | Prarthana PU Science College Bagalkot', description: 'Transport facility information for Prarthana PU Science College students in and around Bagalkote.', keywords: 'Prarthana PU College transport, PU college bus facility Bagalkot', canonical: '/transport' },
  '/admission': { title: 'Admissions Open 2026-27 | Prarthana PU Science College Bagalkot | Apply Online', description: 'Apply online for admission to Prarthana PU Science College Bagalkot. Admissions open for 2026-27.', keywords: 'Prarthana PU College admission, PU admission 2026 Bagalkot', canonical: '/admission' },
  '/admission-success': { title: 'Admission Application Submitted | Prarthana PU Science College Bagalkot', description: 'Your admission application has been successfully submitted.', keywords: 'Prarthana PU College admission success', canonical: '/admission-success' },
  '/contact': { title: 'Contact Prarthana PU Science College | Bagalkot, Karnataka | Phone, Email & Map', description: 'Contact Prarthana PU Science College Bagalkot — call, email, or visit our campus. Save enquiries directly to our records.', keywords: 'Contact Prarthana PU College, PU college phone Bagalkot', canonical: '/contact' },
  '/careers': { title: 'Careers | Join Our Team | Prarthana PU Science College Bagalkot', description: 'View current career opportunities and apply to join Prarthana PU Science College Bagalkot.', keywords: 'Prarthana PU College careers, lecturer jobs Bagalkot, teaching jobs Bagalkot', canonical: '/careers' },
};
