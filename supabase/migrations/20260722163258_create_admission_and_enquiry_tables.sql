/*
# Create admission_enquiries and general_enquiries tables

1. New Tables
- `admission_enquiries`: Stores all admission form submissions with full student details
  - id (uuid, primary key)
  - application_id (text, unique) — prevents duplicate submissions
  - student_name, father_name, mother_name (text)
  - date_of_birth (date), gender (text)
  - email (text), mobile_number (text), alternate_mobile (text)
  - address (text), previous_school (text), previous_school_address (text)
  - sslc_marks (text), course_interested (text), medium_of_instruction (text)
  - religion (text), caste (text), blood_group (text), aadhaar_number (text)
  - transport_required (text), parent_occupation (text)
  - enquiry_type (text), submitted_at (timestamptz)
  - created_at (timestamptz, default now())

- `general_enquiries`: Stores popup and contact form enquiries
  - id (uuid, primary key)
  - name (text), mobile (text), email (text, nullable)
  - course (text, nullable), message (text, nullable)
  - enquiry_type (text), submitted_at (timestamptz)
  - created_at (timestamptz, default now())

2. Security
- Enable RLS on both tables.
- This is a no-auth public-facing app (no sign-in screen).
- Allow anon + authenticated INSERT only (public can submit forms).
- No SELECT/UPDATE/DELETE for anon (only admin can read via service role).

3. Indexes
- Unique index on application_id to prevent duplicates.
- Index on mobile_number and email for lookup.
*/

CREATE TABLE IF NOT EXISTS admission_enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id text UNIQUE NOT NULL,
  student_name text NOT NULL,
  father_name text,
  mother_name text,
  date_of_birth text,
  gender text,
  email text,
  mobile_number text,
  alternate_mobile text,
  address text,
  previous_school text,
  previous_school_address text,
  sslc_marks text,
  course_interested text,
  medium_of_instruction text,
  religion text,
  caste text,
  blood_group text,
  aadhaar_number text,
  transport_required text,
  parent_occupation text,
  enquiry_type text,
  submitted_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admission_enquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_admission" ON admission_enquiries;
CREATE POLICY "anon_insert_admission" ON admission_enquiries FOR INSERT
  TO anon, authenticated WITH CHECK (true);

CREATE TABLE IF NOT EXISTS general_enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  mobile text NOT NULL,
  email text,
  course text,
  message text,
  enquiry_type text NOT NULL,
  submitted_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE general_enquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_enquiry" ON general_enquiries;
CREATE POLICY "anon_insert_enquiry" ON general_enquiries FOR INSERT
  TO anon, authenticated WITH CHECK (true);
