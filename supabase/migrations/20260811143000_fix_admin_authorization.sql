-- Fix admin authorization for the existing Supabase Auth account.
-- This does not create an auth user. It provisions the already-created
-- auth.users row for admin@prarthanapusciencecollege.in into public.admin_users.

ALTER TABLE public.admin_users
  ADD COLUMN IF NOT EXISTS email text;

ALTER TABLE public.admin_users
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'admin';

ALTER TABLE public.admin_users
  ALTER COLUMN role SET DEFAULT 'admin';

UPDATE public.admin_users
SET role = 'admin'
WHERE role IS NULL OR role = '';

ALTER TABLE public.admin_users
  ALTER COLUMN role SET NOT NULL;

ALTER TABLE public.admin_users
  ALTER COLUMN user_id SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'admin_users_role_check'
      AND conrelid = 'public.admin_users'::regclass
  ) THEN
    ALTER TABLE public.admin_users
      ADD CONSTRAINT admin_users_role_check
      CHECK (role IN ('admin')) NOT VALID;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'admin_users_user_id_auth_users_fkey'
      AND conrelid = 'public.admin_users'::regclass
  ) THEN
    ALTER TABLE public.admin_users
      ADD CONSTRAINT admin_users_user_id_auth_users_fkey
      FOREIGN KEY (user_id)
      REFERENCES auth.users(id)
      ON DELETE CASCADE
      NOT VALID;
  END IF;
END $$;

WITH target_user AS (
  SELECT id, email
  FROM auth.users
  WHERE lower(email) = lower('admin@prarthanapusciencecollege.in')
  ORDER BY created_at ASC
  LIMIT 1
)
INSERT INTO public.admin_users (user_id, email, role)
SELECT id, email, 'admin'
FROM target_user
ON CONFLICT (user_id) DO UPDATE
SET email = EXCLUDED.email,
    role = 'admin';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM auth.users
    WHERE lower(email) = lower('admin@prarthanapusciencecollege.in')
  ) THEN
    RAISE EXCEPTION 'Supabase Auth user admin@prarthanapusciencecollege.in does not exist. Create the Auth user first, then rerun this migration.';
  END IF;
END $$;

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
      AND role = 'admin'
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM public;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_select_admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "anon_no_insert" ON public.admin_users;
DROP POLICY IF EXISTS "admin_users_select_self_or_admin" ON public.admin_users;
DROP POLICY IF EXISTS "admin_users_admin_manage" ON public.admin_users;

CREATE POLICY "admin_users_select_self_or_admin"
ON public.admin_users FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_admin());

REVOKE ALL ON public.admin_users FROM anon, authenticated;
GRANT SELECT ON public.admin_users TO authenticated;

-- Remove older permissive authenticated policies left behind by previous
-- deployments, then recreate admin-only CRUD policies for protected data.
DROP POLICY IF EXISTS "authenticated_read_admissions" ON public.admissions;
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

DROP POLICY IF EXISTS "authenticated_read_enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "admin_read_enquiries" ON public.enquiries;
CREATE POLICY "admin_read_enquiries"
ON public.enquiries FOR SELECT
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "admin_update_enquiries" ON public.enquiries;
CREATE POLICY "admin_update_enquiries"
ON public.enquiries FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_delete_enquiries" ON public.enquiries;
CREATE POLICY "admin_delete_enquiries"
ON public.enquiries FOR DELETE
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "auth_manage_site_cms" ON public.site_cms;
DROP POLICY IF EXISTS "authenticated_manage_site_cms" ON public.site_cms;
CREATE POLICY "auth_manage_site_cms"
ON public.site_cms FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "auth_manage_dashboards" ON public.dashboard_configs;
DROP POLICY IF EXISTS "authenticated_manage_dashboard_configs" ON public.dashboard_configs;
CREATE POLICY "auth_manage_dashboards"
ON public.dashboard_configs FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

NOTIFY pgrst, 'reload schema';
