export type AnnouncementCategory =
  | 'General Announcement'
  | 'Event'
  | 'Admission'
  | 'Exam'
  | 'Holiday'
  | 'Achievement'
  | 'Notice'
  | 'Important';

export type AnnouncementStatus = 'draft' | 'published' | 'archived';

export interface Announcement {
  id: string;
  title: string;
  short_description: string;
  full_description?: string;
  category: AnnouncementCategory;
  event_date?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  event_time?: string | null;
  venue?: string | null;
  image_url?: string | null;
  attachment_url?: string | null;
  cta_text?: string | null;
  cta_url?: string | null;
  status: AnnouncementStatus;
  is_featured: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}
