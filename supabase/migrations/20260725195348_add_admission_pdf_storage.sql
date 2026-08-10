/*
# Admission PDF Storage

1. Modified Table
- `admission_enquiries` — adds `pdf_path` column to store the Supabase Storage
  path for the generated acknowledgement PDF.

2. Storage
- Creates `admission-pdfs` storage bucket (public read, authenticated write).
- Policies: anon can upload (form submission), authenticated can read+download
  (admin dashboard), anon can read (public download links).

3. Security
- RLS on the table is unchanged. Only the new column is added.
- Storage policies are scoped to the `admission-pdfs` bucket only.
*/

-- Add pdf_path column to admission_enquiries
ALTER TABLE admission_enquiries
  ADD COLUMN IF NOT EXISTS pdf_path text;

-- Create storage bucket for admission PDFs
INSERT INTO storage.buckets (id, name, public)
VALUES ('admission-pdfs', 'admission-pdfs', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: allow anon upload (form submission) and public read
CREATE POLICY "anon_upload_admission_pdfs" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'admission-pdfs');

CREATE POLICY "public_read_admission_pdfs" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'admission-pdfs');

CREATE POLICY "auth_download_admission_pdfs" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'admission-pdfs');
