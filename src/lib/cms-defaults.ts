import { siteConfig, navItems, pageMeta } from './site-config';
import { heroImages } from '@/data/hero-images';
import { galleryImages } from '@/data/gallery-images';
import { videos as galleryVideos } from '@/data/video-data';
import { achievementImages, neetPosters, kcetPosters, jeePosters } from '@/data/achievement-images';
import { feeCategories, scholarshipInfo, feeNotes } from './fee-structure-data';
import { galleryCategories } from './gallery-data';
import type { ExamType } from './achievers-data';

export interface CmsHeroSlide {
  id: string;
  src: string;
  image: string;
  title: string;
  subtitle?: string;
  alt: string;
  ctaText?: string;
  ctaLink?: string;
  is_active: boolean;
  display_order: number;
}

export interface CmsAchievementCard {
  id: string;
  name: string;
  rank: string;
  score: string;
  course: string;
  year: string;
  photo: string;
  is_active: boolean;
  display_order: number;
}

export interface CmsAchievementPoster {
  id: string;
  src: string;
  title: string;
  alt: string;
  year?: string;
  is_active: boolean;
  display_order: number;
}

export interface CmsGalleryItem {
  id: string;
  src: string;
  alt: string;
  title: string;
  description?: string;
  category: string;
  type: 'image' | 'video';
  poster?: string;
  width?: number;
  height?: number;
  is_active: boolean;
  display_order: number;
}

export interface CmsFeeRow {
  id: string;
  academicYear: string;
  course: string;
  feeTitle: string;
  amount: string;
  description?: string;
  installmentDetails?: string;
  notes?: string;
  is_active: boolean;
  display_order: number;
}

export interface CmsFacultyMember {
  id: string;
  name: string;
  designation: string;
  qualification: string;
  department: string;
  bio: string;
  photo: string;
  is_active: boolean;
  display_order: number;
}

export interface CmsNavItem {
  label: string;
  path: string;
  is_active: boolean;
  display_order: number;
}

export interface CmsPopupSettings {
  enabled: boolean;
  title: string;
  subtitle: string;
  logo: string;
  scrollTriggerPercent: number;
  courses: string[];
}

export interface CmsChatbotSettings {
  welcomeMessage: string;
}

export function buildDefaultSiteCmsPayload(): Record<string, unknown> {
  const heroSlides: CmsHeroSlide[] = heroImages.map((h, i) => ({
    id: String(h.id),
    src: h.src,
    image: h.image,
    title: h.title,
    subtitle: h.subtitle,
    alt: h.alt,
    ctaText: 'Apply Now',
    ctaLink: '/admission',
    is_active: true,
    display_order: i + 1,
  }));

  const achievementCards: CmsAchievementCard[] = achievementImages.map((a, i) => ({
    id: String(a.id),
    name: a.name,
    rank: a.rank,
    score: a.score,
    course: a.course,
    year: a.year,
    photo: a.photo,
    is_active: true,
    display_order: i + 1,
  }));

  const mapPosters = (items: typeof neetPosters) =>
    items.map((p, i) => ({
      id: String(p.id),
      src: p.src,
      title: p.title,
      alt: p.alt,
      year: '2026',
      is_active: true,
      display_order: i + 1,
    }));

  const galleryItems: CmsGalleryItem[] = [
    ...galleryImages.map((g, i) => ({
      id: `img-${g.id}`,
      src: g.src,
      alt: g.alt,
      title: g.title,
      category: g.category,
      type: 'image' as const,
      width: g.width,
      height: g.height,
      is_active: true,
      display_order: i + 1,
    })),
    ...galleryVideos.map((v, i) => ({
      id: `vid-${v.id}`,
      src: v.src,
      alt: v.alt,
      title: v.title,
      category: v.category,
      type: 'video' as const,
      poster: v.poster,
      is_active: true,
      display_order: galleryImages.length + i + 1,
    })),
  ];

  let feeOrder = 1;
  const feeRows: CmsFeeRow[] = feeCategories.flatMap((cat) =>
    cat.items.flatMap((item) => [
      {
        id: `fee-pcmb-${feeOrder}`,
        academicYear: '2026-27',
        course: 'PCMB',
        feeTitle: `${cat.categoryName} — ${item.name}`,
        amount: `₹${item.pcmb.toLocaleString('en-IN')}`,
        description: cat.categoryName,
        is_active: true,
        display_order: feeOrder++,
      },
      {
        id: `fee-pcmc-${feeOrder}`,
        academicYear: '2026-27',
        course: 'PCMC',
        feeTitle: `${cat.categoryName} — ${item.name}`,
        amount: `₹${item.pcmc.toLocaleString('en-IN')}`,
        description: cat.categoryName,
        is_active: true,
        display_order: feeOrder++,
      },
    ]),
  );

  const cmsNavItems: CmsNavItem[] = navItems.map((n, i) => ({
    label: n.label,
    path: n.path,
    is_active: true,
    display_order: i + 1,
  }));

  return {
    siteConfig: { ...siteConfig },
    navItems: cmsNavItems,
    pageMeta: { ...pageMeta },
    hero: {
      title: 'Prarthana PU Science College',
      subtitle: 'Empowering students through quality science education',
      badge: 'Admissions Open 2026-27',
    },
    heroSlides,
    about: {
      pageTitle: 'Nurturing Minds, Building Futures',
      subtitle: 'Discover the story, mission, and values that make Prarthana PU Science College a leader in science education.',
      description: 'Prarthana PU Science College, Bagalkot has been a beacon of quality science education since 2015.',
      story: 'Founded in 2015, Prarthana PU Science College has grown into one of Bagalkot\'s most trusted institutions for PU science education.',
      image: '/images/about/about-1.jpg',
      is_active: true,
    },
    visionMission: {
      vision: 'To be the leading PU science college in Karnataka.',
      mission: 'To empower students through quality education and holistic development.',
      values: 'Excellence, Integrity, Innovation',
    },
    principalMessage: { name: 'Principal Name', message: 'Welcome to Prarthana PU Science College.', photo: '' },
    footer: {
      text: 'Empowering students through quality science education and integrated coaching for NEET, KCET & JEE in Bagalkot, Karnataka.',
      copyright: 'All rights reserved.',
    },
    navbar: {
      ctaText: 'Apply Now',
      ctaLink: '/admission',
    },
    seo: { title: 'Prarthana PU Science College', description: 'Best PU Science College in Bagalkot', keywords: 'PU College Bagalkot' },
    banner: { enabled: false, text: '', link: '' },
    popup: {
      enabled: true,
      title: 'Admission Enquiry',
      subtitle: 'Fill in your details and our team will contact you shortly.',
      logo: siteConfig.logo,
      scrollTriggerPercent: 35,
      courses: ['PCMB', 'PCMC'],
    } satisfies CmsPopupSettings,
    admissionSettings: { session: '2026-27', open: true, deadline: '' },
    prospectus: { url: '' },
    brochure: { url: '' },
    pamphlet: { frontImage: '/frontpagepamplet.jpeg', backImage: '', pdfUrl: '', is_active: true },
    leadership: {
      president: {
        name: 'Dr. Shrinivas Goudar',
        designation: 'President / Chairman',
        photo: '/principalpcb.jpg',
        message: 'It is with great pride and pleasure that I welcome you to Prarthana PU Science College.',
      },
      principal: {
        name: 'Vijayakumar N Kulkarni',
        designation: 'Principal, Prarthana PU Science College',
        photo: '/vijaykumar.jpeg',
        message: 'At Prarthana PU Science College, we believe that every student has the potential to achieve greatness.',
      },
    },
    coursesConfig: {
      pcmbDesc: 'Physics, Chemistry, Mathematics, Biology. Ideal for Medical & Engineering aspirants.',
      pcmbCareers: 'MBBS & Medical, Engineering, BSc Research, Biotechnology',
      pcmcDesc: 'Physics, Chemistry, Mathematics, Computer Science. Ideal for Engineering & Software Tech aspirants.',
      pcmcCareers: 'B.E. / B.Tech, BSc Computer Science, BCA, Data Science',
    },
    hostel: {
      title: 'Hostel Facilities',
      description: 'Separate hostels for Boys & Girls with 24/7 security, wardens, nutritious meals, study halls and high-speed Wi-Fi.',
      facilities: '24/7 Security, Hygienic Mess, Study Hall, Wi-Fi, Recreation',
      rules: 'Strict discipline, study hours, visitor policy as per college norms.',
      contact: siteConfig.phoneDisplay,
      is_active: true,
    },
    transport: {
      title: 'Transport Facility',
      description: 'College buses covering all major routes across Bagalkot city and surrounding areas with GPS tracking and experienced drivers.',
      routes: 'Bagalkot town and surrounding suburbs',
      timings: 'Morning pickup and evening drop as per college schedule',
      contact: siteConfig.phoneDisplay,
      is_active: true,
    },
    achievementCards,
    posterGalleries: {
      NEET: mapPosters(neetPosters),
      KCET: mapPosters(kcetPosters),
      JEE: mapPosters(jeePosters),
    } as Record<'NEET' | 'KCET' | 'JEE', CmsAchievementPoster[]>,
    galleryItems,
    galleryCategories: [...galleryCategories],
    feeRows,
    feeNotes: [...feeNotes],
    scholarships: [...scholarshipInfo],
    faculty: [] as CmsFacultyMember[],
    chatbot: {
      welcomeMessage: `👋 Welcome to ${siteConfig.shortName} Admission Assistant!\n\nI can help you with courses, fees, admissions, hostel, transport, NEET/KCET/JEE coaching and more.`,
    } satisfies CmsChatbotSettings,
    chatbotKnowledge: [] as { id: string; topic: string; keywords: string[]; answer: string; category: string; is_active: boolean; display_order: number }[],
  };
}

export function activeSorted<T extends { is_active?: boolean; display_order?: number }>(items: T[]): T[] {
  return [...items]
    .filter((item) => item.is_active !== false)
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

/** Merge Supabase CMS JSON with defaults — stored keys win; arrays replace defaults entirely. */
export function mergeStoredCmsWithDefaults(stored: Record<string, unknown> | null): Record<string, unknown> {
  const defaults = buildDefaultSiteCmsPayload();
  if (!stored) return defaults;

  const merged: Record<string, unknown> = { ...defaults };

  for (const key of Object.keys(stored)) {
    const storedVal = stored[key];
    const defaultVal = defaults[key];

    if (Array.isArray(storedVal)) {
      merged[key] = storedVal;
      continue;
    }

    if (key === 'leadership' && isPlainObject(storedVal)) {
      const baseLeadership = defaults.leadership as Record<string, Record<string, unknown>>;
      merged.leadership = {
        president: { ...baseLeadership.president, ...(storedVal.president as Record<string, unknown> || {}) },
        principal: { ...baseLeadership.principal, ...(storedVal.principal as Record<string, unknown> || {}) },
      };
      continue;
    }

    if (isPlainObject(storedVal) && isPlainObject(defaultVal)) {
      merged[key] = { ...defaultVal, ...storedVal };
      continue;
    }

    if (storedVal !== undefined && storedVal !== null) {
      merged[key] = storedVal;
    }
  }

  return merged;
}

export type { ExamType };
