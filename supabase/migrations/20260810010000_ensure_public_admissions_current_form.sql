-- Ensure the current React admission form can insert into public.admissions.
-- Existing rows and legacy tables are preserved.

CREATE TABLE IF NOT EXISTS public.admissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id text,
  reference_code text,
  student_name text,
  father_name text,
  mother_name text,
  date_of_birth text,
  gender text,
  email text,
  mobile_number text,
  alternate_mobile text,
  parent_mobile text,
  nationality text,
  mother_tongue text,
  address text,
  city text,
  district text,
  state text,
  pin_code text,
  previous_school text,
  previous_school_address text,
  sslc_marks text,
  sslc_board text,
  passing_year text,
  course_interested text,
  medium_of_instruction text,
  preferred_batch text,
  religion text,
  caste text,
  blood_group text,
  aadhaar_number text,
  transport_required text DEFAULT 'No',
  hostel_required text DEFAULT 'No',
  parent_occupation text,
  parent_email text,
  emergency_contact text,
  annual_family_income text,
  admission_source text,
  message text,
  photo_url text,
  enquiry_type text DEFAULT 'Admission Form',
  submitted_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  status text DEFAULT 'Submitted'
);

ALTER TABLE public.admissions
  ADD COLUMN IF NOT EXISTS application_id text,
  ADD COLUMN IF NOT EXISTS reference_code text,
  ADD COLUMN IF NOT EXISTS student_name text,
  ADD COLUMN IF NOT EXISTS father_name text,
  ADD COLUMN IF NOT EXISTS mother_name text,
  ADD COLUMN IF NOT EXISTS date_of_birth text,
  ADD COLUMN IF NOT EXISTS gender text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS mobile_number text,
  ADD COLUMN IF NOT EXISTS alternate_mobile text,
  ADD COLUMN IF NOT EXISTS parent_mobile text,
  ADD COLUMN IF NOT EXISTS nationality text,
  ADD COLUMN IF NOT EXISTS mother_tongue text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS district text,
  ADD COLUMN IF NOT EXISTS state text,
  ADD COLUMN IF NOT EXISTS pin_code text,
  ADD COLUMN IF NOT EXISTS previous_school text,
  ADD COLUMN IF NOT EXISTS previous_school_address text,
  ADD COLUMN IF NOT EXISTS sslc_marks text,
  ADD COLUMN IF NOT EXISTS sslc_board text,
  ADD COLUMN IF NOT EXISTS passing_year text,
  ADD COLUMN IF NOT EXISTS course_interested text,
  ADD COLUMN IF NOT EXISTS medium_of_instruction text,
  ADD COLUMN IF NOT EXISTS preferred_batch text,
  ADD COLUMN IF NOT EXISTS religion text,
  ADD COLUMN IF NOT EXISTS caste text,
  ADD COLUMN IF NOT EXISTS blood_group text,
  ADD COLUMN IF NOT EXISTS aadhaar_number text,
  ADD COLUMN IF NOT EXISTS transport_required text DEFAULT 'No',
  ADD COLUMN IF NOT EXISTS hostel_required text DEFAULT 'No',
  ADD COLUMN IF NOT EXISTS parent_occupation text,
  ADD COLUMN IF NOT EXISTS parent_email text,
  ADD COLUMN IF NOT EXISTS emergency_contact text,
  ADD COLUMN IF NOT EXISTS annual_family_income text,
  ADD COLUMN IF NOT EXISTS admission_source text,
  ADD COLUMN IF NOT EXISTS message text,
  ADD COLUMN IF NOT EXISTS photo_url text,
  ADD COLUMN IF NOT EXISTS enquiry_type text DEFAULT 'Admission Form',
  ADD COLUMN IF NOT EXISTS submitted_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'Submitted';

CREATE UNIQUE INDEX IF NOT EXISTS idx_admissions_application_id
  ON public.admissions(application_id)
  WHERE application_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_admissions_reference_code
  ON public.admissions(reference_code)
  WHERE reference_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_admissions_course_interested
  ON public.admissions(course_interested);

CREATE INDEX IF NOT EXISTS idx_admissions_submitted_at
  ON public.admissions(submitted_at DESC);

ALTER TABLE public.admissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_insert_admissions" ON public.admissions;
CREATE POLICY "public_insert_admissions"
ON public.admissions FOR INSERT
TO anon, authenticated
WITH CHECK (true);

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT INSERT ON public.admissions TO anon, authenticated;

NOTIFY pgrst, 'reload schema';
