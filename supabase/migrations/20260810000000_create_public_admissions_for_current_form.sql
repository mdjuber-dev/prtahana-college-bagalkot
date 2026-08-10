-- Create the current public admissions table expected by the Admission page.
-- This is intentionally separate from legacy admission_enquiries data.

CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  email text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_users_select_self_or_admin" ON public.admin_users;
CREATE POLICY "admin_users_select_self_or_admin"
ON public.admin_users FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM public.admin_users au
    WHERE au.user_id = auth.uid()
  )
);

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

CREATE TABLE IF NOT EXISTS public.admissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id text NOT NULL,
  reference_code text NOT NULL,
  student_name text NOT NULL,
  father_name text NOT NULL,
  mother_name text NOT NULL,
  date_of_birth text NOT NULL,
  gender text NOT NULL,
  email text NOT NULL,
  mobile_number text NOT NULL,
  alternate_mobile text,
  parent_mobile text NOT NULL,
  nationality text,
  mother_tongue text,
  address text NOT NULL,
  city text NOT NULL,
  district text NOT NULL,
  state text NOT NULL,
  pin_code text NOT NULL,
  previous_school text NOT NULL,
  previous_school_address text NOT NULL,
  sslc_marks text NOT NULL,
  sslc_board text NOT NULL,
  passing_year text NOT NULL,
  course_interested text NOT NULL,
  medium_of_instruction text NOT NULL,
  preferred_batch text NOT NULL,
  religion text NOT NULL,
  caste text NOT NULL,
  blood_group text NOT NULL,
  aadhaar_number text,
  transport_required text NOT NULL DEFAULT 'No',
  hostel_required text NOT NULL DEFAULT 'No',
  parent_occupation text NOT NULL,
  parent_email text NOT NULL,
  emergency_contact text NOT NULL,
  annual_family_income text,
  admission_source text NOT NULL,
  message text,
  photo_url text,
  enquiry_type text NOT NULL DEFAULT 'Admission Form',
  submitted_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'Submitted',
  verified_by text,
  remarks text,
  follow_up_date date,
  reception_notes text,
  counsellor_name text,
  counsellor_assigned_date timestamptz,
  pdf_path text,
  bank_name text,
  bank_account_number text,
  bank_ifsc text,
  bank_branch text,
  fee_payment_status text NOT NULL DEFAULT 'Pending',
  fee_amount_paid numeric(10,2) NOT NULL DEFAULT 0,
  fee_due_date date,
  doc_marks_card_verified boolean NOT NULL DEFAULT false,
  doc_tc_verified boolean NOT NULL DEFAULT false,
  doc_aadhaar_verified boolean NOT NULL DEFAULT false,
  doc_photos_verified boolean NOT NULL DEFAULT false,
  doc_income_certificate_verified boolean NOT NULL DEFAULT false,
  doc_caste_certificate_verified boolean NOT NULL DEFAULT false
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
  ADD COLUMN IF NOT EXISTS transport_required text NOT NULL DEFAULT 'No',
  ADD COLUMN IF NOT EXISTS hostel_required text NOT NULL DEFAULT 'No',
  ADD COLUMN IF NOT EXISTS parent_occupation text,
  ADD COLUMN IF NOT EXISTS parent_email text,
  ADD COLUMN IF NOT EXISTS emergency_contact text,
  ADD COLUMN IF NOT EXISTS annual_family_income text,
  ADD COLUMN IF NOT EXISTS admission_source text,
  ADD COLUMN IF NOT EXISTS message text,
  ADD COLUMN IF NOT EXISTS photo_url text,
  ADD COLUMN IF NOT EXISTS enquiry_type text NOT NULL DEFAULT 'Admission Form',
  ADD COLUMN IF NOT EXISTS submitted_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'Submitted',
  ADD COLUMN IF NOT EXISTS verified_by text,
  ADD COLUMN IF NOT EXISTS remarks text,
  ADD COLUMN IF NOT EXISTS follow_up_date date,
  ADD COLUMN IF NOT EXISTS reception_notes text,
  ADD COLUMN IF NOT EXISTS counsellor_name text,
  ADD COLUMN IF NOT EXISTS counsellor_assigned_date timestamptz,
  ADD COLUMN IF NOT EXISTS pdf_path text,
  ADD COLUMN IF NOT EXISTS bank_name text,
  ADD COLUMN IF NOT EXISTS bank_account_number text,
  ADD COLUMN IF NOT EXISTS bank_ifsc text,
  ADD COLUMN IF NOT EXISTS bank_branch text,
  ADD COLUMN IF NOT EXISTS fee_payment_status text NOT NULL DEFAULT 'Pending',
  ADD COLUMN IF NOT EXISTS fee_amount_paid numeric(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fee_due_date date,
  ADD COLUMN IF NOT EXISTS doc_marks_card_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS doc_tc_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS doc_aadhaar_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS doc_photos_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS doc_income_certificate_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS doc_caste_certificate_verified boolean NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS idx_admissions_application_id
  ON public.admissions(application_id)
  WHERE application_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_admissions_reference_code
  ON public.admissions(reference_code)
  WHERE reference_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_admissions_status ON public.admissions(status);
CREATE INDEX IF NOT EXISTS idx_admissions_course_interested ON public.admissions(course_interested);
CREATE INDEX IF NOT EXISTS idx_admissions_mobile_number ON public.admissions(mobile_number);
CREATE INDEX IF NOT EXISTS idx_admissions_created_at ON public.admissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admissions_submitted_at ON public.admissions(submitted_at DESC);

ALTER TABLE public.admissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_insert_admissions" ON public.admissions;
CREATE POLICY "public_insert_admissions"
ON public.admissions FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "admin_read_admissions" ON public.admissions;
CREATE POLICY "admin_read_admissions"
ON public.admissions FOR SELECT
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "admin_update_admissions" ON public.admissions;
CREATE POLICY "admin_update_admissions"
ON public.admissions FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_delete_admissions" ON public.admissions;
CREATE POLICY "admin_delete_admissions"
ON public.admissions FOR DELETE
TO authenticated
USING (public.is_admin());

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT INSERT ON public.admissions TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.admissions TO authenticated;

NOTIFY pgrst, 'reload schema';
