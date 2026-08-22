import { createContext, useContext, type ReactNode, useState, useEffect, useMemo } from 'react';
import { pageMeta as staticPageMeta } from './site-config';
import { fetchSiteConfig } from './cms';
import { listChatbotKnowledge, listGalleryItems } from './neon-api';
import {
  buildDefaultSiteCmsPayload,
  mergeStoredCmsWithDefaults,
  activeSorted,
  type CmsHeroSlide,
  type CmsAchievementCard,
  type CmsAchievementPoster,
  type CmsGalleryItem,
  type CmsFeeRow,
  type CmsFacultyMember,
  type CmsNavItem,
  type CmsPopupSettings,
  type CmsChatbotSettings,
} from './cms-defaults';
import { achievers as staticAchievers, examTabs as staticExamTabs, examMeta as staticExamMeta, posterGalleries as staticPosterGalleries, type ExamType } from './achievers-data';
import { galleryImages as staticGalleryImages, galleryVideos as staticGalleryVideos, galleryCategories as staticGalleryCategories } from './gallery-data';
import { feeNotes as staticFeeNotes, scholarshipInfo as staticScholarships } from './fee-structure-data';

export interface CMSSiteConfig {
  name: string;
  shortName: string;
  url: string;
  email: string;
  phone: string;
  phoneDisplay: string;
  phone2?: string;
  phone2Display?: string;
  whatsapp: string;
  officeHours?: string;
  address: { line1: string; line2: string; line3?: string; city: string; state: string; pincode: string; full: string; };
  mapsEmbed: string;
  coordinates?: { lat: number; lng: number };
  mapsPlaceUrl?: string;
  mapsDirectionsUrl?: string;
  social: { facebook: string; instagram: string; youtube: string; };
  established: number;
  logo: string;
}

export interface CMSHeroImage { id: string; image?: string; src: string; alt: string; title: string; subtitle?: string; sort_order: number; }
export interface CMSGalleryImage { id: string; src: string; alt: string; title: string; category: string; width: number; height: number; sort_order: number; }
export interface CMSGalleryVideo { id: string; src: string; poster: string; alt: string; title: string; category: string; sort_order: number; }
export interface CMSAchiever { id: string; name: string; rank: string; score: string; exam: string; year: string; course: string; photo: string; is_featured: boolean; sort_order: number; }
export interface CMSFaculty { id: string; name: string; designation: string; qualification: string; department: string; photo: string; experience: string; bio: string; sort_order: number; }
export interface CMSCourse { id: string; code: string; name: string; description: string; subjects: string; duration: string; icon: string; features: string; sort_order: number; }
export interface CMSFee { id: string; course: string; category: string; amount: string; description: string; sort_order: number; }
export interface CMSTestimonial { id: string; name: string; role: string; content: string; photo: string; rating: number; sort_order: number; }
export interface CMSRecruiter { id: string; name: string; logo: string; sort_order: number; }
export interface CMSPlacement { id: string; student_name: string; company: string; package: string; year: string; photo: string; sort_order: number; }
export interface CMSFAQ { id: string; question: string; answer: string; category: string; sort_order: number; }
export interface CMSChatbotKnowledge { id: string; topic: string; keywords: string[]; answer: string; category: string; sort_order: number; }

export interface LeadershipProfile {
  name: string;
  designation: string;
  photo: string;
  message: string;
}

export interface CMSAbout {
  pageTitle: string;
  subtitle: string;
  description: string;
  story: string;
  image: string;
  is_active: boolean;
}

export interface CMSHostel {
  title: string;
  description: string;
  facilities: string;
  rules: string;
  contact: string;
  is_active: boolean;
}

export interface CMSTransport {
  title: string;
  description: string;
  routes: string;
  timings: string;
  contact: string;
  is_active: boolean;
}

export interface CMSData {
  siteConfig: CMSSiteConfig;
  navItems: { label: string; path: string }[];
  pageMeta: typeof staticPageMeta;
  hero: { title: string; subtitle: string; badge: string; };
  heroImages: CMSHeroImage[];
  about: CMSAbout;
  principalMessage: { name: string; message: string; photo: string; };
  visionMission: { vision: string; mission: string; values: string; };
  footer: { text: string; copyright: string; };
  navbar: { ctaText: string; ctaLink: string; };
  seo: { title: string; description: string; keywords: string; };
  banner: { enabled: boolean; text: string; link: string; };
  popup: CmsPopupSettings;
  admissionSettings: { session: string; open: boolean; deadline: string; };
  prospectus: { url: string; };
  brochure: { url: string; };
  pamphlet: { frontImage: string; backImage: string; pdfUrl?: string; is_active?: boolean; };
  leadership: { president: LeadershipProfile; principal: LeadershipProfile; };
  galleryImages: CMSGalleryImage[];
  galleryVideos: CMSGalleryVideo[];
  galleryCategories: readonly string[];
  achievers: Record<ExamType, CMSAchiever[]>;
  posterGalleries: Record<'NEET' | 'KCET' | 'JEE', { id: string; src: string; title: string; alt: string; year?: string }[]>;
  examTabs: ExamType[];
  examMeta: typeof staticExamMeta;
  faculty: CMSFaculty[];
  coursesConfig: { pcmbDesc: string; pcmbCareers: string; pcmcDesc: string; pcmcCareers: string; };
  fees: CMSFee[];
  feeRows: CmsFeeRow[];
  feeNotes: string[];
  scholarships: typeof staticScholarships;
  hostel: CMSHostel;
  transport: CMSTransport;
  testimonials: CMSTestimonial[];
  recruiters: CMSRecruiter[];
  placements: CMSPlacement[];
  faq: CMSFAQ[];
  chatbot: CmsChatbotSettings;
  chatbotKnowledge: CMSChatbotKnowledge[];
  loading: boolean;
  refresh: () => void;
}

const defaults = buildDefaultSiteCmsPayload();

const HERO_SLIDE_LIMIT = 2;

function buildAchieversRecord(all: CMSAchiever[]): Record<ExamType, CMSAchiever[]> {
  return { ALL: all, NEET: [], KCET: [], JEE: [] };
}

function mapFacultyMembers(members: CmsFacultyMember[]): CMSFaculty[] {
  return activeSorted(members).map((f, i) => ({
    id: f.id,
    name: f.name,
    designation: f.designation,
    qualification: f.qualification,
    department: f.department,
    photo: f.photo,
    experience: '',
    bio: f.bio,
    sort_order: f.display_order ?? i + 1,
  }));
}

function mapHeroSlides(slides: CmsHeroSlide[]): CMSHeroImage[] {
  return activeSorted(slides).slice(0, HERO_SLIDE_LIMIT).map((s) => ({
    id: s.id,
    src: s.src,
    image: s.image,
    alt: s.alt,
    title: s.title,
    subtitle: s.subtitle,
    sort_order: s.display_order,
  }));
}

function normalizeHeroImages(images: CMSHeroImage[]): CMSHeroImage[] {
  return images.slice(0, HERO_SLIDE_LIMIT);
}

function mapAchievementCards(cards: CmsAchievementCard[]): CMSAchiever[] {
  return activeSorted(cards).map((c) => ({
    id: c.id,
    name: c.name,
    rank: c.rank,
    score: c.score,
    exam: 'ALL',
    year: c.year,
    course: c.course,
    photo: c.photo,
    is_featured: false,
    sort_order: c.display_order,
  }));
}

function mapPosterGalleries(galleries: Record<'NEET' | 'KCET' | 'JEE', CmsAchievementPoster[]>) {
  return {
    NEET: activeSorted(galleries.NEET || []).map((p) => ({ id: p.id, src: p.src, title: p.title, alt: p.alt, year: p.year })),
    KCET: activeSorted(galleries.KCET || []).map((p) => ({ id: p.id, src: p.src, title: p.title, alt: p.alt, year: p.year })),
    JEE: activeSorted(galleries.JEE || []).map((p) => ({ id: p.id, src: p.src, title: p.title, alt: p.alt, year: p.year })),
  };
}

function mapGalleryItems(items: CmsGalleryItem[]) {
  const active = activeSorted(items);
  const images: CMSGalleryImage[] = active
    .filter((i) => i.type === 'image')
    .map((g, idx) => ({
      id: g.id,
      src: g.src,
      alt: g.alt,
      title: g.title,
      category: g.category,
      width: g.width || 800,
      height: g.height || 600,
      sort_order: g.display_order || idx + 1,
    }));
  const videos: CMSGalleryVideo[] = active
    .filter((i) => i.type === 'video')
    .map((v, idx) => ({
      id: v.id,
      src: v.src,
      poster: v.poster || '',
      alt: v.alt,
      title: v.title,
      category: v.category,
      sort_order: v.display_order || idx + 1,
    }));
  return { images, videos };
}

function buildDefaultData(): Omit<CMSData, 'loading' | 'refresh'> {
  const heroSlides = (defaults.heroSlides as CmsHeroSlide[]) || [];
  const achievementCards = (defaults.achievementCards as CmsAchievementCard[]) || [];
  const posterGalleries = (defaults.posterGalleries as Record<'NEET' | 'KCET' | 'JEE', CmsAchievementPoster[]>) || { NEET: [], KCET: [], JEE: [] };
  const galleryItems = (defaults.galleryItems as CmsGalleryItem[]) || [];
  const { images, videos } = mapGalleryItems(galleryItems);

  return {
    siteConfig: defaults.siteConfig as unknown as CMSSiteConfig,
    navItems: (defaults.navItems as CmsNavItem[]).filter((n) => n.is_active !== false).sort((a, b) => a.display_order - b.display_order).map(({ label, path }) => ({ label, path })),
    pageMeta: staticPageMeta,
    hero: defaults.hero as CMSData['hero'],
    heroImages: normalizeHeroImages(mapHeroSlides(heroSlides)),
    about: defaults.about as CMSAbout,
    principalMessage: defaults.principalMessage as CMSData['principalMessage'],
    visionMission: defaults.visionMission as CMSData['visionMission'],
    footer: defaults.footer as CMSData['footer'],
    navbar: defaults.navbar as CMSData['navbar'],
    seo: defaults.seo as CMSData['seo'],
    banner: defaults.banner as CMSData['banner'],
    popup: defaults.popup as CmsPopupSettings,
    admissionSettings: defaults.admissionSettings as CMSData['admissionSettings'],
    prospectus: defaults.prospectus as CMSData['prospectus'],
    brochure: defaults.brochure as CMSData['brochure'],
    pamphlet: defaults.pamphlet as CMSData['pamphlet'],
    leadership: defaults.leadership as CMSData['leadership'],
    galleryImages: images.length ? images : staticGalleryImages.map((g) => ({ id: String(g.id), src: g.src, alt: g.alt, title: g.title, category: g.category, width: g.width, height: g.height, sort_order: g.id })),
    galleryVideos: videos.length ? videos : staticGalleryVideos.map((v) => ({ id: String(v.id), src: v.src, poster: v.poster, alt: v.alt, title: v.title, category: v.category, sort_order: v.id })),
    galleryCategories: (defaults.galleryCategories as string[])?.length ? defaults.galleryCategories as string[] : staticGalleryCategories,
    achievers: buildAchieversRecord(
      mapAchievementCards(achievementCards).length
        ? mapAchievementCards(achievementCards)
        : (staticAchievers.ALL ?? []).map((a) => ({
          id: String(a.id), name: a.name, rank: a.rank, score: a.score, exam: a.exam,
          year: a.year, course: a.course, photo: a.photo, is_featured: false, sort_order: a.id,
        })),
    ),
    posterGalleries: mapPosterGalleries(posterGalleries).NEET.length
      ? mapPosterGalleries(posterGalleries)
      : {
        NEET: staticPosterGalleries.NEET.map((p) => ({ id: String(p.id), src: p.src, title: p.title, alt: p.alt })),
        KCET: staticPosterGalleries.KCET.map((p) => ({ id: String(p.id), src: p.src, title: p.title, alt: p.alt })),
        JEE: staticPosterGalleries.JEE.map((p) => ({ id: String(p.id), src: p.src, title: p.title, alt: p.alt })),
      },
    examTabs: staticExamTabs,
    examMeta: staticExamMeta,
    faculty: mapFacultyMembers((defaults.faculty as CmsFacultyMember[]) || []),
    coursesConfig: defaults.coursesConfig as CMSData['coursesConfig'],
    fees: [],
    feeRows: (defaults.feeRows as CmsFeeRow[]) || [],
    feeNotes: (defaults.feeNotes as string[]) || staticFeeNotes,
    scholarships: (defaults.scholarships as typeof staticScholarships) || staticScholarships,
    hostel: defaults.hostel as CMSHostel,
    transport: defaults.transport as CMSTransport,
    testimonials: [],
    recruiters: [],
    placements: [],
    faq: [],
    chatbot: defaults.chatbot as CmsChatbotSettings,
    chatbotKnowledge: [],
  };
}

const defaultData = buildDefaultData();

const CMSContext = createContext<CMSData>({
  ...defaultData,
  loading: false,
  refresh: () => { },
});

function mergeCmsOverrides(base: Omit<CMSData, 'loading' | 'refresh'>, overrides: Record<string, unknown>): Omit<CMSData, 'loading' | 'refresh'> {
  const merged = { ...base } as CMSData;

  const objectKeys = [
    'siteConfig', 'hero', 'about', 'principalMessage', 'visionMission',
    'footer', 'navbar', 'seo', 'banner', 'popup', 'admissionSettings',
    'prospectus', 'brochure', 'pamphlet', 'leadership', 'coursesConfig', 'hostel', 'transport', 'chatbot',
  ];
  objectKeys.forEach((key) => {
    if (overrides[key] && typeof overrides[key] === 'object' && !Array.isArray(overrides[key])) {
      merged[key as keyof CMSData] = { ...(merged[key as keyof CMSData] as object), ...(overrides[key] as Record<string, unknown>) } as never;
      if (key === 'leadership') {
        merged.leadership = {
          president: { ...defaultData.leadership.president, ...((overrides.leadership as any)?.president || {}) },
          principal: { ...defaultData.leadership.principal, ...((overrides.leadership as any)?.principal || {}) },
        };
      }
    }
  });

  if (Array.isArray(overrides.navItems)) {
    merged.navItems = activeSorted(overrides.navItems as CmsNavItem[]).map(({ label, path }) => ({ label, path }));
  }

  if (Array.isArray(overrides.heroSlides)) {
    merged.heroImages = normalizeHeroImages(mapHeroSlides(overrides.heroSlides as CmsHeroSlide[]));
  } else if (Array.isArray(overrides.heroImages)) {
    merged.heroImages = normalizeHeroImages((overrides.heroImages as CMSHeroImage[]).map((h, i) => ({
      id: h.id || String(i),
      src: h.src,
      image: h.image,
      alt: h.alt,
      title: h.title,
      sort_order: h.sort_order ?? i + 1,
    })));
  }

  if (Array.isArray(overrides.achievementCards)) {
    merged.achievers = buildAchieversRecord(mapAchievementCards(overrides.achievementCards as CmsAchievementCard[]));
  } else if (overrides.achievers && typeof overrides.achievers === 'object') {
    const incoming = overrides.achievers as Partial<Record<ExamType, CMSAchiever[]>>;
    merged.achievers = buildAchieversRecord(incoming.ALL ?? merged.achievers.ALL);
  }

  if (overrides.posterGalleries && typeof overrides.posterGalleries === 'object') {
    merged.posterGalleries = mapPosterGalleries(overrides.posterGalleries as Record<'NEET' | 'KCET' | 'JEE', CmsAchievementPoster[]>);
  }

  if (Array.isArray(overrides.galleryItems)) {
    const mapped = mapGalleryItems(overrides.galleryItems as CmsGalleryItem[]);
    merged.galleryImages = mapped.images;
    merged.galleryVideos = mapped.videos;
  } else {
    if (Array.isArray(overrides.galleryImages)) merged.galleryImages = overrides.galleryImages as CMSGalleryImage[];
    if (Array.isArray(overrides.galleryVideos)) merged.galleryVideos = overrides.galleryVideos as CMSGalleryVideo[];
  }

  if (Array.isArray(overrides.galleryCategories)) merged.galleryCategories = overrides.galleryCategories as string[];
  if (Array.isArray(overrides.feeRows)) merged.feeRows = overrides.feeRows as CmsFeeRow[];
  if (Array.isArray(overrides.feeNotes)) merged.feeNotes = overrides.feeNotes as string[];
  if (Array.isArray(overrides.scholarships)) merged.scholarships = overrides.scholarships as typeof staticScholarships;
  if (Array.isArray(overrides.faculty)) merged.faculty = mapFacultyMembers(overrides.faculty as CmsFacultyMember[]);
  if (Array.isArray(overrides.chatbotKnowledge)) {
    merged.chatbotKnowledge = (overrides.chatbotKnowledge as CMSChatbotKnowledge[]).map((k, i) => ({
      ...k,
      sort_order: k.sort_order ?? i + 1,
    }));
  }

  return merged;
}

export function CMSProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(false);
  const [siteOverrides, setSiteOverrides] = useState<Record<string, unknown> | null>(null);
  const [dbChatbotKnowledge, setDbChatbotKnowledge] = useState<CMSChatbotKnowledge[]>([]);
  const [dbGalleryItems, setDbGalleryItems] = useState<any[]>([]);

  const refresh = async () => {
    setLoading(true);
    try {
      const [configResult, chatbotResult, galleryResult] = await Promise.all([
        fetchSiteConfig(),
        listChatbotKnowledge().then((data) => ({ data })).catch(() => ({ data: null })),
        listGalleryItems().then((data) => ({ data })).catch(() => ({ data: null })),
      ]);
      setSiteOverrides(configResult);
      if (chatbotResult.data) {
        setDbChatbotKnowledge(
          (chatbotResult.data as any[]).map((row, i) => ({
            id: row.id,
            topic: row.topic,
            keywords: row.keywords || [],
            answer: row.answer,
            category: row.category || 'General',
            sort_order: row.sort_order ?? i + 1,
          })),
        );
      }
      if (galleryResult.data) {
        setDbGalleryItems(galleryResult.data as any[]);
      }
    } catch (err) {
      console.error('CMSProvider refresh error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void refresh(); }, []);

  const mapDbGalleryItems = (items: any[]) => {
    const images: CMSGalleryImage[] = items
      .filter((i) => i.type === 'image' || !i.type)
      .map((g, idx) => ({
        id: g.id,
        src: g.src,
        alt: g.alt || '',
        title: g.title || '',
        category: g.category || 'Campus',
        width: g.width || 800,
        height: g.height || 600,
        sort_order: g.sort_order || idx + 1,
      }));
    const videos: CMSGalleryVideo[] = items
      .filter((i) => i.type === 'video')
      .map((v, idx) => ({
        id: v.id,
        src: v.src,
        poster: v.poster || '',
        alt: v.alt || '',
        title: v.title || '',
        category: v.category || 'Videos',
        sort_order: v.sort_order || idx + 1,
      }));
    return { images, videos };
  };

  const merged = useMemo(() => {
    const payload = siteOverrides ? mergeStoredCmsWithDefaults(siteOverrides) : null;
    const base = payload ? mergeCmsOverrides(defaultData, payload) : defaultData;

    let galleryImages = base.galleryImages;
    let galleryVideos = base.galleryVideos;

    if (dbGalleryItems.length) {
      const mapped = mapDbGalleryItems(dbGalleryItems);
      galleryImages = mapped.images;
      galleryVideos = mapped.videos;
    }

    const knowledge = dbChatbotKnowledge.length
      ? dbChatbotKnowledge
      : base.chatbotKnowledge;
    return { ...base, galleryImages, galleryVideos, chatbotKnowledge: knowledge };
  }, [siteOverrides, dbChatbotKnowledge, dbGalleryItems]);

  return (
    <CMSContext.Provider value={{ ...merged, loading, refresh }}>
      {children}
    </CMSContext.Provider>
  );
}

export function useCMS(): CMSData {
  return useContext(CMSContext);
}

export { buildDefaultSiteCmsPayload, mergeStoredCmsWithDefaults, activeSorted };
