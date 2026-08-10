/**
 * ============================================================================
 * ACHIEVEMENT IMAGES & POSTERS CONFIGURATION
 * ============================================================================
 *
 * TWO SEPARATE DATA SETS (DO NOT MIX):
 *
 *  1. achievementImages  — Used by the "ALL" tab. Contains 20 student topper
 *                          cards. DO NOT delete these or rename their files.
 *                          Files live in:
 *                              public/images/achievements/achievement-1.jpg
 *                              public/images/achievements/achievement-2.jpg
 *                              ...
 *                              public/images/achievements/achievement-20.jpg
 *
 *  2. Poster galleries   — Used by the NEET / KCET / JEE tabs.
 *                          These are LARGE POSTERS displayed 2-per-row on
 *                          desktop and 1-per-row on mobile. They are kept
 *                          fully separate from the 20 ALL-card images.
 *                          Place your poster files in:
 *                              public/images/achievements/neet-N.jpg
 *                              public/images/achievements/kcet-N.jpg
 *                              public/images/achievements/jee-N.jpg
 *                          and then add entries to the arrays below.
 *
 *                          Add as many posters as you like — the grid will
 *                          grow automatically. No hardcoded limits.
 *
 * NO REACT/COMPONENT CODE NEEDS TO BE TOUCHED WHEN UPDATING THIS FILE.
 * ============================================================================
 */

// ─── 1. Existing 20 student topper cards (ALL tab) ─────────────────────────
export interface AchievementImage {
  id: number;
  image: string;
  src: string;  // Alias for component compatibility
  photo: string; // Alias for achiever cards
  name: string;
  rank: string;
  score: string;
  exam: 'ALL' | 'NEET' | 'KCET' | 'JEE';
  year: string;
  course: string;
  alt: string;
  title: string;
}

const names = [
  'Akash Bajannavar', 'Tirupati G', 'Bhoomika Pujer', 'Ananya Joshi', 'Viramaditya N',
  'Manoj Dandagi', 'Anjali Madar', 'Divya Metri', 'Amrutha N', 'Kavya Jadhav',
  'Sarita Dasar', 'Malashree', 'Abhishek H.', 'Megha Dandagi', 'Veeresh Goudar',
  'Srushti Rotti', 'Vijayalaxmi K.', 'Viramaditya N', 'Soumaya Basaveshwar', 'Amogha Hiremata',
];

const examsForBackfill: ('NEET' | 'KCET' | 'ALL' | 'JEE')[] = ['NEET', 'KCET', 'ALL', 'JEE'];
const courses = ['PCMB', 'PCMC'];

export const achievementImages: AchievementImage[] = Array.from({ length: 20 }, (_, index) => {
  const num = index + 1;
  const exam = examsForBackfill[index % examsForBackfill.length];
  const name = names[index];
  const rank = `Rank ${num}`;
  const score = `${99 - (index % 5)}%`;
  const imagePath = `/images/achievements/achievement-${num}.jpg`;

  return {
    id: num,
    image: imagePath,
    src: imagePath,
    photo: imagePath,
    name,
    rank,
    score,
    exam,
    year: '2025',
    course: courses[index % courses.length],
    alt: `${name} - ${exam} Topper ${rank}`,
    title: `${name} (${rank} - ${exam})`,
  };
});

// ─── 2. Large poster galleries (NEET / KCET / JEE tabs) ────────────────────
export interface AchievementPoster {
  id: number;
  src: string;
  title: string;
  alt: string;
}

/**
 * NEET achievement posters.
 *
 * HOW TO ADD A POSTER:
 *  1. Drop a file at:  public/images/achievements/neet-3.jpg
 *  2. Append an entry:
 *       { id: 3, src: '/images/achievements/neet-3.jpg', title: 'NEET 2026 Rankers', alt: 'NEET 2026 Rankers poster' },
 *
 * The poster grid will pick it up automatically.
 */
export const neetPosters: AchievementPoster[] = [
  {
    id: 1,
    src: '/images/achievements/neet-1.jpg',
    title: 'NEET Achievements 2026',
    alt: 'NEET Achievements 2026 poster',
  },
  {
    id: 2,
    src: '/images/achievements/neet-2.jpg',
    title: 'NEET Selections 2026',
    alt: 'NEET Selections 2026 poster',
  },

  // Example entries (uncomment / modify as needed — file must exist on disk):
  // {
  //   id: 1,
  //   src: '/images/achievements/neet-1.jpg',
  //   title: 'NEET Achievements 2026',
  //   alt: 'NEET Achievements 2026 poster',
  // },
  // {
  //   id: 2,
  //   src: '/images/achievements/neet-2.jpg',
  //   title: 'NEET Selections 2026',
  //   alt: 'NEET Selections 2026 poster',
  // },
];

/**
 * KCET achievement posters.
 */
export const kcetPosters: AchievementPoster[] = [
  {
    id: 1,
    src: '/images/achievements/kcet-1.jpg',
    title: 'KCET Achievements 2026',
    alt: 'KCET Achievements 2026 poster',
  },
  {
    id: 2,
    src: '/images/achievements/kcet-2.jpg',
    title: 'KCET Engineering Ranks 2026',
    alt: 'KCET Engineering Ranks 2026 poster',
  },

  // Example entries:
  // {
  //   id: 1,
  //   src: '/images/achievements/kcet-1.jpg',
  //   title: 'KCET Achievements 2026',
  //   alt: 'KCET Achievements 2026 poster',
  // },
  // {
  //   id: 2,
  //   src: '/images/achievements/kcet-2.jpg',
  //   title: 'KCET Engineering Ranks 2026',
  //   alt: 'KCET Engineering Ranks 2026 poster',
  // },
];

/**
 * JEE achievement posters.
 */
export const jeePosters: AchievementPoster[] = [
  {
    id: 1,
    src: '/images/achievements/jee-1.jpg',
    title: 'JEE Achievements 2026',
    alt: 'JEE Achievements 2026 poster',
  },
    {
    id: 2,
    src: '/images/achievements/jee-2.jpg',
    title: 'JEE Achievements 2026',
    alt: 'JEE Achievements 2026 poster',
  },

  // Example entries:
  // {
  //   id: 1,
  //   src: '/images/achievements/jee-1.jpg',
  //   title: 'JEE Achievements 2026',
  //   alt: 'JEE Achievements 2026 poster',
  // },
  // {
  //   id: 2,
  //   src: '/images/achievements/jee-2.jpg',
  //   title: 'JEE Mains & Advanced 2026',
  //   alt: 'JEE Mains & Advanced 2026 poster',
  // },
];
