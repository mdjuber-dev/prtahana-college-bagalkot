-- Migration: Create gallery table for database-backed gallery images and videos
-- Compatible with both Supabase and direct PostgreSQL connections

CREATE TABLE IF NOT EXISTS public.gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  src text NOT NULL,
  alt text DEFAULT '',
  title text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'Campus',
  type text NOT NULL DEFAULT 'image',
  poster text DEFAULT '',
  width integer DEFAULT 800,
  height integer DEFAULT 600,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    DROP POLICY IF EXISTS "public_read_gallery" ON public.gallery;
    CREATE POLICY "public_read_gallery" ON public.gallery FOR SELECT TO anon, authenticated USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    DROP POLICY IF EXISTS "admin_manage_gallery" ON public.gallery;
    CREATE POLICY "admin_manage_gallery" ON public.gallery FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_gallery_sort_order ON public.gallery(sort_order);
