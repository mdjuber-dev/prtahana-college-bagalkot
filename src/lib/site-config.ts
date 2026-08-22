export const siteConfig = {
  name: 'Prarthana PU Science College',
  shortName: 'Prarthana PU College',
  url: 'https://prarthanapucollegebagalkot.in',
  email: 'info@prarthanapucollegebagalkot.in',
  phone: '+919481138788',
  phoneDisplay: '+91 94811 38788',
  phone2: '+917975217020',
  phone2Display: '+91 79752 17020',
  whatsapp: '919481138788',
  address: {
    line1: 'Prarthana PU Science College',
    line2: '5MMV+2FG, Kaulpet',
    city: 'Bagalkot',
    state: 'Karnataka',
    pincode: '587101',
    full: 'Prarthana PU Science College, 5MMV+2FG, Kaulpet, Bagalkot, Karnataka 587101',
  },
  /** Official college coordinates (verified against the client-provided Google Maps place). */
  coordinates: {
    lat: 16.1790607,
    lng: 75.6906218,
  },
  /** Embedded map: centred on the campus at street-level zoom (never a world view). */
  mapsEmbed: 'https://maps.google.com/maps?q=16.1790607,75.6906218+(Prarthana+PU+Science+College+Bagalkot)&t=&z=17&ie=UTF8&iwloc=B&output=embed',
  /** Official Google Maps place page for the college (client-provided canonical link). */
  mapsPlaceUrl:
    'https://www.google.com/maps/place/Prarthana+P+U+Science+College+Bagalkot/@16.1790954,75.6905481,52m/data=!3m1!1e3!4m6!3m5!1s0x3bc778f3349a462f:0x27050572c74ff80a!8m2!3d16.1790607!4d75.6906218',
  /** Turn-by-turn directions to the campus. */
  mapsDirectionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=16.1790607%2C75.6906218&destination_place_id=ChIJL0aaNPN4xzsRCvhPx3IFBSc',
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

export interface PageMeta {
  title: string;
  description: string;
  keywords: string;
  canonical: string;
  noindex?: boolean;
  ogImage?: string;
  twitterImage?: string;
}

export const pageMeta: Record<string, PageMeta> = {
  '/': {
    title: 'Prarthana PU Science College Bagalkot | Admissions, Courses & College',
    description: 'Prarthana PU Science College in Bagalkot, Karnataka offers PU Science courses (PCMB, PCMC) with integrated NEET, KCET & JEE coaching. Admissions open 2026-27. Contact us for admissions, fee structure, campus facilities and more.',
    keywords: 'Prarthana PU Science College Bagalkot, PU Science College Bagalkot, PU College Bagalkot, NEET Coaching Bagalkot, KCET Coaching Bagalkot, JEE Coaching Bagalkot, PU Admissions 2026, Science courses Bagalkot',
    canonical: '/',
    ogImage: '/prathanaclg-pht.png',
    twitterImage: '/prathanaclg-pht.png',
  },
  '/about': {
    title: 'About Prarthana PU Science College | Our Story, Mission & Vision | Bagalkot',
    description: 'Learn about Prarthana PU Science College in Bagalkot — established in 2015, our mission to empower students through quality science education, experienced faculty and modern facilities.',
    keywords: 'About Prarthana PU College, PU Science College Bagalkot history, science college Bagalkot mission, Prarthana PU College Bagalkot',
    canonical: '/about',
    ogImage: '/prathanaclg-pht.png',
    twitterImage: '/prathanaclg-pht.png',
  },
  '/courses': {
    title: 'PU Science Courses in Bagalkot | PCMB & PCMC | Prarthana PU Science College',
    description: 'Explore PCMB and PCMC courses at Prarthana PU Science College Bagalkot with integrated coaching for NEET, KCET & JEE. Choose the right science stream for your career.',
    keywords: 'PCMB Bagalkot, PCMC Bagalkot, PU Science courses Bagalkot, NEET Coaching Bagalkot, JEE Coaching Bagalkot, KCET Coaching Bagalkot, science stream Bagalkot',
    canonical: '/courses',
    ogImage: '/prathanaclg-pht.png',
    twitterImage: '/prathanaclg-pht.png',
  },
  '/achievements': {
    title: 'Student Achievements & Results | Prarthana PU Science College Bagalkot',
    description: 'Celebrate the achievements of Prarthana PU Science College students — NEET, KCET, JEE and PU board exam toppers from Bagalkot.',
    keywords: 'Prarthana PU College results, NEET toppers Bagalkot, KCET toppers Bagalkot, JEE toppers Bagalkot, PU Science College achievements',
    canonical: '/achievements',
    ogImage: '/prathanaclg-pht.png',
    twitterImage: '/prathanaclg-pht.png',
  },
  '/gallery': {
    title: 'Campus Gallery | Prarthana PU Science College Bagalkot | Photos & Videos',
    description: 'View photos and videos of campus life, classrooms, laboratories, library and events at Prarthana PU Science College Bagalkot.',
    keywords: 'Prarthana PU College gallery, campus photos Bagalkot, PU Science College photos, Bagalkot college campus',
    canonical: '/gallery',
    ogImage: '/prathanaclg-pht.png',
    twitterImage: '/prathanaclg-pht.png',
  },
  '/fee-structure': {
    title: 'Fee Structure 2026-27 | Prarthana PU Science College Bagalkot | PCMB & PCMC',
    description: 'Check the transparent and affordable fee structure for PCMB and PCMC at Prarthana PU Science College Bagalkot. Merit scholarships and payment plans available.',
    keywords: 'Prarthana PU College fee structure, PU science college fees Bagalkot, PCMB fees Bagalkot, PCMC fees Bagalkot, college fees Bagalkot',
    canonical: '/fee-structure',
    ogImage: '/prathanaclg-pht.png',
    twitterImage: '/prathanaclg-pht.png',
  },
  '/transport': {
    title: 'Transport Facility | Prarthana PU Science College Bagalkot | Bus Routes',
    description: 'Transport facility information for Prarthana PU Science College students in and around Bagalkot. Safe, reliable and scheduled bus services.',
    keywords: 'Prarthana PU College transport, PU college bus facility Bagalkot, college transport Bagalkot',
    canonical: '/transport',
    ogImage: '/prathanaclg-pht.png',
    twitterImage: '/prathanaclg-pht.png',
  },
  '/admission': {
    title: 'Admissions Open 2026-27 | Prarthana PU Science College Bagalkot | Apply Online',
    description: 'Apply online for admission to Prarthana PU Science College Bagalkot. Admissions open for 2026-27 session for PCMB and PCMC courses. NEET, KCET & JEE integrated coaching.',
    keywords: 'Prarthana PU College admission, PU admission 2026 Bagalkot, science college admission Bagalkot, NEET coaching admission, KCET coaching admission',
    canonical: '/admission',
    ogImage: '/prathanaclg-pht.png',
    twitterImage: '/prathanaclg-pht.png',
  },
  '/admission-success': {
    title: 'Admission Application Submitted | Prarthana PU Science College Bagalkot',
    description: 'Your admission application to Prarthana PU Science College Bagalkot has been successfully submitted. We will contact you shortly.',
    keywords: 'Prarthana PU College admission success, PU Science College Bagalkot application submitted',
    canonical: '/admission-success',
    noindex: true,
    ogImage: '/prathanaclg-pht.png',
    twitterImage: '/prathanaclg-pht.png',
  },
  '/contact': {
    title: 'Contact Prarthana PU Science College | Bagalkot, Karnataka | Phone, Email & Map',
    description: 'Contact Prarthana PU Science College Bagalkot — call, email, or visit our campus at Kaulpet, Bagalkot. Send enquiries directly online.',
    keywords: 'Contact Prarthana PU College, PU college phone Bagalkot, Prarthana PU College email, Bagalkot college contact',
    canonical: '/contact',
    ogImage: '/prathanaclg-pht.png',
    twitterImage: '/prathanaclg-pht.png',
  },
  '/careers': {
    title: 'Career Opportunities | Join Our Team | Prarthana PU Science College',
    description: 'Explore career opportunities for teaching and administrative staff at Prarthana PU Science College Bagalkot. Apply online today.',
    keywords: 'teaching jobs Bagalkot, lecturer jobs Bagalkot, PU college recruitment Bagalkot, faculty jobs Prarthana College',
    canonical: '/careers',
    ogImage: '/prathanaclg-pht.png',
    twitterImage: '/prathanaclg-pht.png',
  },
  '/announcements': {
    title: 'Announcements & College Notices | Prarthana PU Science College Bagalkot',
    description: 'Stay updated with official announcements, admissions alerts, exam timetables, science exhibitions, holidays, and campus events at Prarthana PU Science College Bagalkot.',
    keywords: 'Prarthana PU College announcements, college notices Bagalkot, PU exams timetable, college events Bagalkot',
    canonical: '/announcements',
    ogImage: '/prathanaclg-pht.png',
    twitterImage: '/prathanaclg-pht.png',
  },
  '*': {
    title: 'Page Not Found | Prarthana PU Science College Bagalkot',
    description: 'The page you are looking for does not exist.',
    keywords: '',
    canonical: '/',
    noindex: true,
    ogImage: '/prathanaclg-pht.png',
    twitterImage: '/prathanaclg-pht.png',
  },
  '/admin/login': {
    title: 'Admin Login | Prarthana PU Science College',
    description: 'Admin login portal.',
    keywords: '',
    canonical: '/admin/login',
    noindex: true,
    ogImage: '/prathanaclg-pht.png',
    twitterImage: '/prathanaclg-pht.png',
  },
};
