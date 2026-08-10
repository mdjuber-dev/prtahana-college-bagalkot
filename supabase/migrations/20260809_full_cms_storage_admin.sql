-- Migration: Full CMS, Storage & Admin Chatbot Knowledge Support
-- Ensures storage buckets, RLS policies, and dynamic chatbot knowledge table exist.

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

-- 1. Ensure Storage Buckets exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('cms-media', 'cms-media', true, 10485760, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml']),
  ('cms-assets', 'cms-assets', true, 10485760, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'])
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Storage Policies for cms-media and cms-assets
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

-- 3. Dynamic Chatbot Knowledge Table
CREATE TABLE IF NOT EXISTS chatbot_knowledge (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic text NOT NULL,
  keywords text[] NOT NULL DEFAULT '{}',
  answer text NOT NULL,
  category text DEFAULT 'General',
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE chatbot_knowledge ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_chatbot_knowledge" ON chatbot_knowledge;
CREATE POLICY "public_read_chatbot_knowledge"
ON chatbot_knowledge FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "admin_manage_chatbot_knowledge" ON chatbot_knowledge;
CREATE POLICY "admin_manage_chatbot_knowledge"
ON chatbot_knowledge FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_chatbot_knowledge_topic ON chatbot_knowledge(topic);
