-- Table to map Supabase auth users to admin role
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  email text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Only authenticated can SELECT to check admin membership
DROP POLICY IF EXISTS "auth_select_admin_users" ON admin_users;
CREATE POLICY "auth_select_admin_users" ON admin_users FOR SELECT
  TO authenticated
  USING (true);

-- Prevent public inserts/selects from anon
DROP POLICY IF EXISTS "anon_no_insert" ON admin_users;
CREATE POLICY "anon_no_insert" ON admin_users FOR INSERT
  TO authenticated
  WITH CHECK (false);

-- Admins must be provisioned via Supabase SQL or Console by a superuser
