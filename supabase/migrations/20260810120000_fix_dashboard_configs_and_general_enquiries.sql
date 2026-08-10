-- Fix dashboard_configs missing columns used by Analytics admin
ALTER TABLE dashboard_configs
  ADD COLUMN IF NOT EXISTS description text DEFAULT '',
  ADD COLUMN IF NOT EXISTS display_order integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS is_default boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_dashboard_configs_display_order
  ON dashboard_configs(display_order ASC);

-- Extend general_enquiries for admin workflow (popup + contact enquiries)
ALTER TABLE general_enquiries
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'New',
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'Website',
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_general_enquiries_status ON general_enquiries(status);
CREATE INDEX IF NOT EXISTS idx_general_enquiries_submitted_at ON general_enquiries(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_general_enquiries_source ON general_enquiries(source);

-- Admin access to general_enquiries (popup enquiries separate from admissions)
DROP POLICY IF EXISTS "admin_read_general_enquiries" ON general_enquiries;
CREATE POLICY "admin_read_general_enquiries"
ON general_enquiries FOR SELECT
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "admin_update_general_enquiries" ON general_enquiries;
CREATE POLICY "admin_update_general_enquiries"
ON general_enquiries FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_delete_general_enquiries" ON general_enquiries;
CREATE POLICY "admin_delete_general_enquiries"
ON general_enquiries FOR DELETE
TO authenticated
USING (public.is_admin());

-- Tighten site_cms write policy to admin-only (preserve public read)
DROP POLICY IF EXISTS "auth_manage_site_cms" ON site_cms;
CREATE POLICY "auth_manage_site_cms"
ON site_cms FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Tighten dashboard_configs to admin-only
DROP POLICY IF EXISTS "auth_manage_dashboards" ON dashboard_configs;
CREATE POLICY "auth_manage_dashboards"
ON dashboard_configs FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());
