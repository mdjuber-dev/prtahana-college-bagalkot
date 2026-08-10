/*
# Extend admission_enquiries with reception + address-split + message fields

1. Modified Table
- `admission_enquiries` — adds reception/system fields and split address fields.

2. New Columns (address split — for cleaner Google Sheet columns)
- `parent_mobile` (text) — parent/guardian mobile number
- `city` (text) — city/town
- `district` (text) — district
- `state` (text) — state
- `pin_code` (text) — PIN code
- `message` (text) — optional free-text message from applicant

3. New Columns (reception / admin — auto-saved, blank on submission)
- `reception_notes` (text, nullable) — notes by reception staff
- `counsellor_name` (text, nullable) — counsellor assigned to the applicant

4. Security
- No RLS policy changes. Existing anon+authenticated INSERT + SELECT policies remain.

5. Notes
- All additions are additive (ALTER TABLE ADD COLUMN IF NOT EXISTS) — no data loss.
- These columns map 1:1 to the requested Google Sheet column order so reception
  staff see a clean, predictable spreadsheet.
*/

ALTER TABLE admission_enquiries
  ADD COLUMN IF NOT EXISTS parent_mobile text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS district text,
  ADD COLUMN IF NOT EXISTS state text,
  ADD COLUMN IF NOT EXISTS pin_code text,
  ADD COLUMN IF NOT EXISTS message text,
  ADD COLUMN IF NOT EXISTS reception_notes text,
  ADD COLUMN IF NOT EXISTS counsellor_name text;
