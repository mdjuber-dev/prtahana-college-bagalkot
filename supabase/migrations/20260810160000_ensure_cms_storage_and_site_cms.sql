-- Ensure CMS storage bucket exists (single bucket: cms-assets)
-- Idempotent, non-destructive

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cms-assets',
  'cms-assets',
  true,
  20971520,
  ARRAY[
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml',
    'application/pdf',
    'video/mp4', 'video/webm'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = GREATEST(storage.buckets.file_size_limit, 20971520),
  allowed_mime_types = ARRAY[
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml',
    'application/pdf',
    'video/mp4', 'video/webm'
  ];

-- Legacy alias bucket (read-only fallback for existing URLs)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cms-media',
  'cms-media',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public Read Access for cms-media" ON storage.objects;
CREATE POLICY "Public Read Access for cms-media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id IN ('cms-media', 'cms-assets'));

DROP POLICY IF EXISTS "Admin Insert Access for cms-media" ON storage.objects;
CREATE POLICY "Admin Insert Access for cms-media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id IN ('cms-media', 'cms-assets') AND public.is_admin());

DROP POLICY IF EXISTS "Admin Update Access for cms-media" ON storage.objects;
CREATE POLICY "Admin Update Access for cms-media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id IN ('cms-media', 'cms-assets') AND public.is_admin())
WITH CHECK (bucket_id IN ('cms-media', 'cms-assets') AND public.is_admin());

DROP POLICY IF EXISTS "Admin Delete Access for cms-media" ON storage.objects;
CREATE POLICY "Admin Delete Access for cms-media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id IN ('cms-media', 'cms-assets') AND public.is_admin());

-- site_cms: auto-update updated_at column
CREATE OR REPLACE FUNCTION public.set_site_cms_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_site_cms_updated_at ON site_cms;
CREATE TRIGGER trg_site_cms_updated_at
  BEFORE UPDATE ON site_cms
  FOR EACH ROW
  EXECUTE FUNCTION public.set_site_cms_updated_at();

-- Ensure public can insert popup enquiries
DROP POLICY IF EXISTS "anon_insert_enquiry" ON general_enquiries;
CREATE POLICY "anon_insert_enquiry"
ON general_enquiries FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Authenticated admins can read site_cms (not only anon)
DROP POLICY IF EXISTS "admin_select_site_cms" ON site_cms;
CREATE POLICY "admin_select_site_cms"
ON site_cms FOR SELECT
TO authenticated
USING (public.is_admin());
