-- Allow PDF uploads in cms-assets bucket (pamphlets)
UPDATE storage.buckets
SET allowed_mime_types = ARRAY[
  'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml',
  'application/pdf'
]
WHERE id = 'cms-assets';

-- Ensure dashboard_configs has display_order (idempotent)
ALTER TABLE dashboard_configs
  ADD COLUMN IF NOT EXISTS description text DEFAULT '',
  ADD COLUMN IF NOT EXISTS display_order integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS is_default boolean NOT NULL DEFAULT false;

ALTER TABLE dashboard_configs
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_dashboard_configs_display_order
  ON dashboard_configs(display_order ASC);

-- Auto-update updated_at on dashboard_configs
CREATE OR REPLACE FUNCTION public.set_dashboard_configs_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_dashboard_configs_updated_at ON dashboard_configs;
CREATE TRIGGER trg_dashboard_configs_updated_at
  BEFORE UPDATE ON dashboard_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.set_dashboard_configs_updated_at();
