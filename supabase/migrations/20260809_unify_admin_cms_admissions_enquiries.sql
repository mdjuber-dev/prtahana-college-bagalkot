-- Unify the production data model around the requested public/admin flows.
-- Existing legacy tables are left in place for historical compatibility.

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

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_users_select_self_or_admin" ON admin_users;
CREATE POLICY "admin_users_select_self_or_admin"
ON admin_users FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "admin_users_admin_manage" ON admin_users;
CREATE POLICY "admin_users_admin_manage"
ON admin_users FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE TABLE IF NOT EXISTS admissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id text UNIQUE,
  reference_code text UNIQUE,
  student_name text,
  father_name text,
  mother_name text,
  date_of_birth text,
  gender text,
  email text,
  mobile_number text,
  alternate_mobile text,
  parent_mobile text,
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
  transport_required text,
  hostel_required text,
  parent_occupation text,
  parent_email text,
  emergency_contact text,
  annual_family_income text,
  admission_source text,
  message text,
  photo_url text,
  status text NOT NULL DEFAULT 'Submitted',
  sheet_sync_status text NOT NULL DEFAULT 'pending',
  sheet_sync_error text,
  submitted_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE admissions
  ADD COLUMN IF NOT EXISTS application_id text,
  ADD COLUMN IF NOT EXISTS reference_code text,
  ADD COLUMN IF NOT EXISTS student_name text,
  ADD COLUMN IF NOT EXISTS course_interested text,
  ADD COLUMN IF NOT EXISTS parent_mobile text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS pin_code text,
  ADD COLUMN IF NOT EXISTS sslc_board text,
  ADD COLUMN IF NOT EXISTS passing_year text,
  ADD COLUMN IF NOT EXISTS preferred_batch text,
  ADD COLUMN IF NOT EXISTS hostel_required text,
  ADD COLUMN IF NOT EXISTS parent_email text,
  ADD COLUMN IF NOT EXISTS emergency_contact text,
  ADD COLUMN IF NOT EXISTS annual_family_income text,
  ADD COLUMN IF NOT EXISTS admission_source text,
  ADD COLUMN IF NOT EXISTS message text,
  ADD COLUMN IF NOT EXISTS sheet_sync_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS sheet_sync_error text,
  ADD COLUMN IF NOT EXISTS submitted_at timestamptz DEFAULT now();

DO $$
DECLARE
  col_name text;
BEGIN
  FOREACH col_name IN ARRAY ARRAY[
    'first_name', 'last_name', 'aadhaar_number', 'mobile_number', 'email',
    'father_name', 'mother_name', 'parent_mobile', 'address', 'district',
    'state', 'pin_code', 'sslc_school_name', 'board', 'year_of_passing',
    'percentage', 'marks_obtained', 'subjects'
  ]
  LOOP
    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'admissions'
        AND column_name = col_name
    ) THEN
      EXECUTE format('ALTER TABLE admissions ALTER COLUMN %I DROP NOT NULL', col_name);
    END IF;
  END LOOP;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_admissions_application_id
  ON admissions(application_id)
  WHERE application_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_admissions_reference_code
  ON admissions(reference_code)
  WHERE reference_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_admissions_course_interested ON admissions(course_interested);
CREATE INDEX IF NOT EXISTS idx_admissions_submitted_at ON admissions(submitted_at DESC);

ALTER TABLE admissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_insert_admissions" ON admissions;
CREATE POLICY "public_insert_admissions"
ON admissions FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "admin_read_admissions" ON admissions;
CREATE POLICY "admin_read_admissions"
ON admissions FOR SELECT
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "admin_update_admissions" ON admissions;
CREATE POLICY "admin_update_admissions"
ON admissions FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_delete_admissions" ON admissions;
CREATE POLICY "admin_delete_admissions"
ON admissions FOR DELETE
TO authenticated
USING (public.is_admin());

CREATE TABLE IF NOT EXISTS enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  mobile text NOT NULL,
  email text,
  course text,
  message text,
  enquiry_type text NOT NULL DEFAULT 'Website Enquiry',
  status text NOT NULL DEFAULT 'New',
  source text NOT NULL DEFAULT 'Website',
  sheet_sync_status text NOT NULL DEFAULT 'pending',
  sheet_sync_error text,
  submitted_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_insert_enquiries" ON enquiries;
CREATE POLICY "public_insert_enquiries"
ON enquiries FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "admin_read_enquiries" ON enquiries;
CREATE POLICY "admin_read_enquiries"
ON enquiries FOR SELECT
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "admin_update_enquiries" ON enquiries;
CREATE POLICY "admin_update_enquiries"
ON enquiries FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_delete_enquiries" ON enquiries;
CREATE POLICY "admin_delete_enquiries"
ON enquiries FOR DELETE
TO authenticated
USING (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_enquiries_submitted_at ON enquiries(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries(status);
CREATE INDEX IF NOT EXISTS idx_enquiries_course ON enquiries(course);

DROP POLICY IF EXISTS "auth_manage_site_cms" ON site_cms;
CREATE POLICY "auth_manage_site_cms"
ON site_cms FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "auth_manage_dashboards" ON dashboard_configs;
CREATE POLICY "auth_manage_dashboards"
ON dashboard_configs FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

ALTER TABLE dashboard_configs
  ADD CONSTRAINT dashboard_configs_provider_check
  CHECK (provider IN ('Power BI', 'Tableau', 'Other')) NOT VALID;

ALTER TABLE dashboard_configs
  ADD CONSTRAINT dashboard_configs_status_check
  CHECK (status IN ('enabled', 'disabled')) NOT VALID;
