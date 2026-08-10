/*
# Extend admission_enquiries with new form + system fields

1. Modified Table
- `admission_enquiries` — adds new applicant fields and admin/system fields.

2. New Columns (applicant-provided)
- `nationality` (text) — student's nationality
- `mother_tongue` (text) — student's mother tongue
- `parent_email` (text) — parent/guardian email
- `emergency_contact` (text) — emergency contact number
- `annual_family_income` (text) — annual family income
- `sslc_board` (text) — SSLC examination board
- `passing_year` (text) — SSLC passing year
- `admission_source` (text) — how the applicant heard about the college
- `preferred_batch` (text) — preferred batch/section
- `hostel_required` (text) — Yes/No hostel requirement
- `photo_url` (text, nullable) — student photo (base64 data URL or storage URL)

3. New Columns (auto-generated / admin)
- `reference_code` (text) — random 6-8 char reference code
- `status` (text, default 'New') — application status
- `verified_by` (text, nullable) — admin who verified the application
- `remarks` (text, nullable) — admin remarks
- `follow_up_date` (date, nullable) — follow-up date

4. Security
- No RLS policy changes. Existing anon+authenticated INSERT policy remains.
- A SELECT policy is added so the success page / admin can read back a row by
  application_id (no-auth app: anon + authenticated read allowed).

5. Indexes
- Unique index on `reference_code` to prevent duplicate reference codes.
- Index on `status` for admin filtering.

6. Notes
- All additions are additive (ALTER TABLE ADD COLUMN IF NOT EXISTS) — no data loss.
- `status` defaults to 'New' so existing and new rows have a meaningful state.
*/

ALTER TABLE admission_enquiries
  ADD COLUMN IF NOT EXISTS nationality text,
  ADD COLUMN IF NOT EXISTS mother_tongue text,
  ADD COLUMN IF NOT EXISTS parent_email text,
  ADD COLUMN IF NOT EXISTS emergency_contact text,
  ADD COLUMN IF NOT EXISTS annual_family_income text,
  ADD COLUMN IF NOT EXISTS sslc_board text,
  ADD COLUMN IF NOT EXISTS passing_year text,
  ADD COLUMN IF NOT EXISTS admission_source text,
  ADD COLUMN IF NOT EXISTS preferred_batch text,
  ADD COLUMN IF NOT EXISTS hostel_required text,
  ADD COLUMN IF NOT EXISTS photo_url text,
  ADD COLUMN IF NOT EXISTS reference_code text,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'New',
  ADD COLUMN IF NOT EXISTS verified_by text,
  ADD COLUMN IF NOT EXISTS remarks text,
  ADD COLUMN IF NOT EXISTS follow_up_date date;

-- Backfill status for any pre-existing rows so they are not NULL
UPDATE admission_enquiries SET status = 'New' WHERE status IS NULL;

-- Unique reference code (prevents duplicates)
CREATE UNIQUE INDEX IF NOT EXISTS idx_admission_enquiries_reference_code
  ON admission_enquiries(reference_code) WHERE reference_code IS NOT NULL;

-- Admin status filter
CREATE INDEX IF NOT EXISTS idx_admission_enquiries_status
  ON admission_enquiries(status);

-- Allow anon + authenticated SELECT (no-auth app: success page reads back by application_id)
DROP POLICY IF EXISTS "anon_select_admission" ON admission_enquiries;
CREATE POLICY "anon_select_admission"
ON admission_enquiries FOR SELECT
TO anon, authenticated
USING (true);
