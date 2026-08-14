-- Careers / job application system.
-- Idempotent and non-destructive. Does not touch admissions, enquiries, CMS, or admin auth data.

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

CREATE TABLE IF NOT EXISTS public.career_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL,
  department text,
  employment_type text,
  location text,
  qualification text,
  experience_required text,
  salary_text text,
  vacancies integer DEFAULT 1,
  short_description text,
  description text,
  responsibilities text,
  required_qualifications text,
  preferred_qualifications text,
  benefits text,
  additional_information text,
  application_deadline date,
  status text NOT NULL DEFAULT 'inactive',
  is_featured boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 100,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT career_jobs_status_check CHECK (status IN ('active', 'inactive', 'closed'))
);

ALTER TABLE public.career_jobs
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS department text,
  ADD COLUMN IF NOT EXISTS employment_type text,
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS qualification text,
  ADD COLUMN IF NOT EXISTS experience_required text,
  ADD COLUMN IF NOT EXISTS salary_text text,
  ADD COLUMN IF NOT EXISTS vacancies integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS short_description text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS responsibilities text,
  ADD COLUMN IF NOT EXISTS required_qualifications text,
  ADD COLUMN IF NOT EXISTS preferred_qualifications text,
  ADD COLUMN IF NOT EXISTS benefits text,
  ADD COLUMN IF NOT EXISTS additional_information text,
  ADD COLUMN IF NOT EXISTS application_deadline date,
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'inactive',
  ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 100,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

CREATE UNIQUE INDEX IF NOT EXISTS idx_career_jobs_slug ON public.career_jobs(slug);
CREATE INDEX IF NOT EXISTS idx_career_jobs_status ON public.career_jobs(status);
CREATE INDEX IF NOT EXISTS idx_career_jobs_deadline ON public.career_jobs(application_deadline);
CREATE INDEX IF NOT EXISTS idx_career_jobs_display_order ON public.career_jobs(display_order, created_at DESC);

CREATE TABLE IF NOT EXISTS public.career_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_ref text NOT NULL UNIQUE,
  job_id uuid NOT NULL REFERENCES public.career_jobs(id) ON DELETE RESTRICT,
  full_name text NOT NULL,
  email text NOT NULL,
  mobile text NOT NULL,
  qualification text NOT NULL,
  subject_department text,
  years_experience text NOT NULL,
  current_organization text,
  linkedin_url text,
  portfolio_url text,
  cover_letter text NOT NULL,
  additional_information text,
  resume_path text NOT NULL,
  resume_file_name text NOT NULL,
  resume_file_size integer NOT NULL,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT career_applications_status_check CHECK (status IN ('new', 'reviewing', 'shortlisted', 'rejected', 'selected'))
);

ALTER TABLE public.career_applications
  ADD COLUMN IF NOT EXISTS application_ref text,
  ADD COLUMN IF NOT EXISTS job_id uuid,
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS mobile text,
  ADD COLUMN IF NOT EXISTS qualification text,
  ADD COLUMN IF NOT EXISTS subject_department text,
  ADD COLUMN IF NOT EXISTS years_experience text,
  ADD COLUMN IF NOT EXISTS current_organization text,
  ADD COLUMN IF NOT EXISTS linkedin_url text,
  ADD COLUMN IF NOT EXISTS portfolio_url text,
  ADD COLUMN IF NOT EXISTS cover_letter text,
  ADD COLUMN IF NOT EXISTS additional_information text,
  ADD COLUMN IF NOT EXISTS resume_path text,
  ADD COLUMN IF NOT EXISTS resume_file_name text,
  ADD COLUMN IF NOT EXISTS resume_file_size integer,
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

CREATE UNIQUE INDEX IF NOT EXISTS idx_career_applications_ref ON public.career_applications(application_ref);
CREATE INDEX IF NOT EXISTS idx_career_applications_job ON public.career_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_career_applications_status ON public.career_applications(status);
CREATE INDEX IF NOT EXISTS idx_career_applications_created_at ON public.career_applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_career_applications_email ON public.career_applications(email);

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'career-applications',
  'career-applications',
  false,
  10485760,
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
ON CONFLICT (id) DO UPDATE
SET public = false,
    file_size_limit = 10485760,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

ALTER TABLE public.career_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_active_career_jobs" ON public.career_jobs;
CREATE POLICY "public_read_active_career_jobs"
ON public.career_jobs FOR SELECT
TO anon, authenticated
USING (
  status = 'active'
  AND (application_deadline IS NULL OR application_deadline >= CURRENT_DATE)
);

DROP POLICY IF EXISTS "admin_manage_career_jobs" ON public.career_jobs;
CREATE POLICY "admin_manage_career_jobs"
ON public.career_jobs FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "public_insert_career_applications" ON public.career_applications;
CREATE POLICY "public_insert_career_applications"
ON public.career_applications FOR INSERT
TO anon, authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.career_jobs job
    WHERE job.id = career_applications.job_id
      AND job.status = 'active'
      AND (job.application_deadline IS NULL OR job.application_deadline >= CURRENT_DATE)
  )
);

DROP POLICY IF EXISTS "admin_read_career_applications" ON public.career_applications;
CREATE POLICY "admin_read_career_applications"
ON public.career_applications FOR SELECT
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "admin_update_career_applications" ON public.career_applications;
CREATE POLICY "admin_update_career_applications"
ON public.career_applications FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_delete_career_applications" ON public.career_applications;
CREATE POLICY "admin_delete_career_applications"
ON public.career_applications FOR DELETE
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "career_resume_public_upload" ON storage.objects;
CREATE POLICY "career_resume_public_upload"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'career-applications'
  AND name LIKE 'resumes/%'
);

DROP POLICY IF EXISTS "career_resume_admin_read" ON storage.objects;
CREATE POLICY "career_resume_admin_read"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'career-applications'
  AND public.is_admin()
);

DROP POLICY IF EXISTS "career_resume_admin_delete" ON storage.objects;
CREATE POLICY "career_resume_admin_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'career-applications'
  AND public.is_admin()
);

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.career_jobs TO anon, authenticated;
GRANT INSERT ON public.career_applications TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.career_jobs TO authenticated;
GRANT SELECT, UPDATE, DELETE ON public.career_applications TO authenticated;

NOTIFY pgrst, 'reload schema';
