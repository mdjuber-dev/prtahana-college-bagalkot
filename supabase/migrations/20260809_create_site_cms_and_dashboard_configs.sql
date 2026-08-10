-- Create a simple key/value CMS table for site-wide content
CREATE TABLE IF NOT EXISTS site_cms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_cms ENABLE ROW LEVEL SECURITY;

-- Allow public SELECT for site configuration so the public website can read content
DROP POLICY IF EXISTS "anon_select_site_config" ON site_cms;
CREATE POLICY "anon_select_site_config" ON site_cms FOR SELECT
  TO anon
  USING (key = 'site_config');

-- Allow authenticated users (admins) to INSERT/UPDATE/DELETE
DROP POLICY IF EXISTS "auth_manage_site_cms" ON site_cms;
CREATE POLICY "auth_manage_site_cms" ON site_cms FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Dashboard configurations (Power BI, Tableau etc.)
CREATE TABLE IF NOT EXISTS dashboard_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  provider text NOT NULL,
  embed_url text NOT NULL,
  status text NOT NULL DEFAULT 'disabled',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE dashboard_configs ENABLE ROW LEVEL SECURITY;

-- Only authenticated (admin) users may manage dashboard configs
DROP POLICY IF EXISTS "auth_manage_dashboards" ON dashboard_configs;
CREATE POLICY "auth_manage_dashboards" ON dashboard_configs FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
