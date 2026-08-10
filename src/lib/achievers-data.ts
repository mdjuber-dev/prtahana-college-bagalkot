/**
 * Re-exporting achievers data from centralized achievement-images config file.
 * To change photos or topper info, modify src/data/achievement-images.ts or public/images/achievements/
 *
 * ACHIEVEMENT CATEGORIES:
 *   'ALL'   — Student topper cards (20 photos). Uses achievement-1.jpg ... achievement-20.jpg.
 *   'NEET'  — Large poster gallery.          Uses neet-1.jpg, neet-2.jpg, ...
 *   'KCET'  — Large poster gallery.          Uses kcet-1.jpg, kcet-2.jpg, ...
 *   'JEE'   — Large poster gallery.          Uses jee-1.jpg,  jee-2.jpg,  ...
 */
import {
  achievementImages,
  neetPosters,
  kcetPosters,
  jeePosters,
  type AchievementPoster as AchievementPosterType,
} from '@/data/achievement-images';
export type AchievementPoster = AchievementPosterType;

export type ExamType = 'ALL' | 'NEET' | 'KCET' | 'JEE';

export type AchievementCategoryKind = 'cards' | 'posters';

export interface Achiever {
  id: number;
  name: string;
  rank: string;
  score: string;
  exam: ExamType;
  year: string;
  course: string;
  photo: string;
}

export interface AchievementCategoryMeta {
  label: string;
  description: string;
  kind: AchievementCategoryKind;
}

export const examTabs: ExamType[] = ['ALL', 'NEET', 'KCET', 'JEE'];

export const examMeta: Record<ExamType, AchievementCategoryMeta> = {
  ALL: {
    label: 'ALL',
    description:
      'The complete collection of Prarthana PU Science College star achievers across all streams and examinations.',
    kind: 'cards',
  },
  NEET: {
    label: 'NEET',
    description:
      'NEET result posters celebrating our medical entrance selections and top ranks.',
    kind: 'posters',
  },
  KCET: {
    label: 'KCET',
    description:
      'KCET result posters highlighting Karnataka Common Entrance Test performances and engineering rank holders.',
    kind: 'posters',
  },
  JEE: {
    label: 'JEE',
    description:
      'JEE Main & Advanced result posters showcasing our engineering entrance successes.',
    kind: 'posters',
  },
};

function getAllAchievers(): Achiever[] {
  // Reuses the existing 20 student achievement images (achievement-1.jpg ... achievement-20.jpg)
  // and preserves the card metadata (names, courses, scores, ranks, years) exactly as before.
  return achievementImages.map((item, idx) => ({
    id: idx + 1,
    name: item.name,
    rank: item.rank,
    score: item.score,
    exam: 'ALL' as ExamType,
    year: item.year,
    course: item.course || 'PCMB',
    photo: item.photo,
  }));
}

// Cards (shown only in the ALL tab). NEET/KCET/JEE tabs use poster galleries instead.
export const achievers: Record<'ALL', Achiever[]> & Partial<Record<Exclude<ExamType, 'ALL'>, Achiever[]>> = {
  ALL: getAllAchievers(),
};

// Poster galleries (shown only in NEET/KCET/JEE tabs).
export const posterGalleries: Record<'NEET' | 'KCET' | 'JEE', AchievementPoster[]> = {
  NEET: neetPosters,
  KCET: kcetPosters,
  JEE: jeePosters,
};
