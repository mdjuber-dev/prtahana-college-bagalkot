-- URGENT: Ensure public.general_enquiries exists for popup → admin → dashboard pipeline
-- Idempotent, non-destructive. Does NOT touch public.admissions.

-- ---------------------------------------------------------------------------
-- 1. Ensure is_admin() exists (required for admin RLS)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE user_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------------
-- 2. Create general_enquiries if missing
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.general_enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  mobile text NOT NULL,
  email text,
  course text NOT NULL DEFAULT '',
  message text,
  enquiry_type text NOT NULL DEFAULT 'Website Enquiry',
  source text NOT NULL DEFAULT 'Website',
  status text NOT NULL DEFAULT 'New',
  submitted_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Extend older partial schemas safely
ALTER TABLE public.general_enquiries
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS course text,
  ADD COLUMN IF NOT EXISTS message text,
  ADD COLUMN IF NOT EXISTS enquiry_type text,
  ADD COLUMN IF NOT EXISTS source text,
  ADD COLUMN IF NOT EXISTS status text,
  ADD COLUMN IF NOT EXISTS submitted_at timestamptz,
  ADD COLUMN IF NOT EXISTS created_at timestamptz,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz;

-- Backfill defaults for nullable legacy rows
UPDATE public.general_enquiries SET course = '' WHERE course IS NULL;
UPDATE public.general_enquiries SET enquiry_type = 'Website Enquiry' WHERE enquiry_type IS NULL;
UPDATE public.general_enquiries SET source = 'Website' WHERE source IS NULL;
UPDATE public.general_enquiries SET status = 'New' WHERE status IS NULL;
UPDATE public.general_enquiries SET submitted_at = COALESCE(submitted_at, created_at, now()) WHERE submitted_at IS NULL;
UPDATE public.general_enquiries SET created_at = COALESCE(created_at, now()) WHERE created_at IS NULL;
UPDATE public.general_enquiries SET updated_at = COALESCE(updated_at, created_at, now()) WHERE updated_at IS NULL;

-- ---------------------------------------------------------------------------
-- 3. Migrate existing records from legacy public.enquiries (if present)
--    Copies by id — no duplicates, no deletes on source table
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  has_status boolean;
  has_submitted_at boolean;
  has_created_at boolean;
  has_updated_at boolean;
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'enquiries'
  ) THEN
    SELECT
      EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='enquiries' AND column_name='status'),
      EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='enquiries' AND column_name='submitted_at'),
      EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='enquiries' AND column_name='created_at'),
      EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='enquiries' AND column_name='updated_at')
    INTO has_status, has_submitted_at, has_created_at, has_updated_at;

    EXECUTE format($fmt$
      INSERT INTO public.general_enquiries (id,name,mobile,email,course,message,enquiry_type,source,status,submitted_at,created_at,updated_at)
      SELECT
        e.id,
        e.name,
        e.mobile,
        e.email,
        COALESCE(e.course, ''),
        e.message,
        COALESCE(e.enquiry_type, 'Website Enquiry'),
        COALESCE(e.source, 'Website'),
        %s,
        %s,
        %s,
        %s
      FROM public.enquiries e
      WHERE NOT EXISTS (SELECT 1 FROM public.general_enquiries g WHERE g.id = e.id);
    $fmt$,
    -- status
    CASE WHEN has_status THEN 'COALESCE(e.status, ''New'')' ELSE '''New''' END,
    -- submitted_at
    CASE WHEN has_submitted_at THEN 'COALESCE(e.submitted_at, e.created_at, now())' WHEN has_created_at THEN 'COALESCE(e.created_at, now())' ELSE 'now()' END,
    -- created_at
    CASE WHEN has_created_at THEN 'COALESCE(e.created_at, now())' ELSE 'now()' END,
    -- updated_at
    CASE WHEN has_updated_at THEN 'COALESCE(e.updated_at, e.created_at, now())' WHEN has_created_at THEN 'COALESCE(e.created_at, now())' ELSE 'now()' END
    );
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 4. Indexes
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_general_enquiries_status
  ON public.general_enquiries(status);

CREATE INDEX IF NOT EXISTS idx_general_enquiries_submitted_at
  ON public.general_enquiries(submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_general_enquiries_created_at
  ON public.general_enquiries(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_general_enquiries_source
  ON public.general_enquiries(source);

CREATE INDEX IF NOT EXISTS idx_general_enquiries_mobile
  ON public.general_enquiries(mobile);

-- ---------------------------------------------------------------------------
-- 5. RLS — public INSERT only; admin SELECT/UPDATE/DELETE
-- ---------------------------------------------------------------------------
ALTER TABLE public.general_enquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_enquiry" ON public.general_enquiries;
CREATE POLICY "anon_insert_enquiry"
ON public.general_enquiries FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "admin_read_general_enquiries" ON public.general_enquiries;
CREATE POLICY "admin_read_general_enquiries"
ON public.general_enquiries FOR SELECT
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "admin_update_general_enquiries" ON public.general_enquiries;
CREATE POLICY "admin_update_general_enquiries"
ON public.general_enquiries FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_delete_general_enquiries" ON public.general_enquiries;
CREATE POLICY "admin_delete_general_enquiries"
ON public.general_enquiries FOR DELETE
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "admin_insert_general_enquiries" ON public.general_enquiries;
CREATE POLICY "admin_insert_general_enquiries"
ON public.general_enquiries FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

-- Grant API access to anon/authenticated roles (Supabase default, idempotent)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.general_enquiries TO authenticated;
GRANT INSERT ON public.general_enquiries TO anon;

-- ---------------------------------------------------------------------------
-- 6. Refresh PostgREST schema cache so REST API sees the table immediately
-- ---------------------------------------------------------------------------
NOTIFY pgrst, 'reload schema';
