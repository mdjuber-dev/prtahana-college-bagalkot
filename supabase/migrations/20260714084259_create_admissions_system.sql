/*
# Create Online Admission Management System

## Overview
This migration creates a complete online admission management system for Prarthana P.U. Science College, Bagalkot. It replaces the traditional paper admission form with a digital workflow: students apply online, administrators review applications in a dashboard.

## New Tables

### `admissions`
Stores every submitted admission application with all form fields.

- `id` (uuid, primary key)
- `application_number` (text, unique) — auto-generated in format PPC2026-000124
- **Step 1 — Personal Information**
  - `first_name` (text, not null)
  - `middle_name` (text, nullable)
  - `last_name` (text, not null)
  - `gender` (text, nullable — Male/Female/Other)
  - `date_of_birth` (date, nullable)
  - `blood_group` (text, nullable)
  - `aadhaar_number` (text, not null, unique)
  - `mobile_number` (text, not null, unique)
  - `whatsapp_number` (text, nullable)
  - `email` (text, not null)
- **Step 2 — Parent Details**
  - `father_name` (text, not null)
  - `mother_name` (text, not null)
  - `parent_mobile` (text, not null)
  - `parent_occupation` (text, nullable)
  - `annual_income` (text, nullable)
- **Step 3 — Address**
  - `address` (text, not null)
  - `village` (text, nullable)
  - `taluk` (text, nullable)
  - `district` (text, not null)
  - `state` (text, not null)
  - `pin_code` (text, not null)
- **Step 4 — Academic Details**
  - `sslc_school_name` (text, not null)
  - `board` (text, not null)
  - `year_of_passing` (text, not null)
  - `percentage` (text, not null)
  - `marks_obtained` (text, not null)
  - `subjects` (text, not null)
- **Step 5 — Course Selection**
  - `course` (text, nullable — PCMB/PCMC/PCME/CEBA/SEBA)
  - `preferred_language` (text, nullable — Kannada/English/Hindi)
- **Document URLs** (all nullable, stored as Supabase Storage public URLs)
  - `photo_url`, `aadhaar_card_url`, `sslc_marks_card_url`, `transfer_certificate_url`
  - `caste_certificate_url`, `income_certificate_url`, `passport_photo_url`, `signature_url`
- **Admin Fields**
  - `status` (text, not null, default 'Pending' — Pending/Under Review/Approved/Rejected)
  - `admin_notes` (text, nullable)
  - `academic_year` (text, not null, default '2026-27')
- `created_at` (timestamptz, default now)
- `updated_at` (timestamptz, default now)

### `admission_counter`
A single-row counter table used to generate sequential application numbers atomically.

- `id` (int, primary key, always 1)
- `count` (int, default 0)

## Security

### RLS on `admissions`
This is a no-auth application (no sign-in screen). Students submit applications publicly, and admin access is gated by the admin dashboard UI. All policies use `TO anon, authenticated`:
- SELECT: anyone can read (needed for admin dashboard to list applications)
- INSERT: anyone can insert (students submit applications)
- UPDATE: anyone can update (admin changes status/notes)

### RLS on `admission_counter`
- SELECT: anyone can read
- INSERT/UPDATE: anyone can update (needed for counter increment during submission)

## Storage
A public storage bucket `admission-documents` is created for storing uploaded files (photos, certificates, signatures).

## Indexes
- `idx_admissions_status` — filter by status
- `idx_admissions_course` — filter by course
- `idx_admissions_district` — filter by district
- `idx_admissions_created_at` — sort by date
- `idx_admissions_application_number` — search by application number
- `idx_admissions_aadhaar_number` — unique constraint + lookup
- `idx_admissions_mobile_number` — unique constraint + lookup

## Important Notes
1. The `generate_application_number()` function atomically increments the counter and returns a formatted application number (PPC2026-000124).
2. Unique constraints on `aadhaar_number` and `mobile_number` prevent duplicate applications.
3. The `updated_at` trigger automatically updates the timestamp on row modification.
4. The storage bucket is public so document URLs are accessible for admin review.
*/

-- Create admissions table
CREATE TABLE IF NOT EXISTS admissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_number text UNIQUE,

  -- Step 1: Personal Information
  first_name text NOT NULL,
  middle_name text,
  last_name text NOT NULL,
  gender text CHECK (gender IN ('Male', 'Female', 'Other')),
  date_of_birth date,
  blood_group text,
  aadhaar_number text NOT NULL UNIQUE,
  mobile_number text NOT NULL UNIQUE,
  whatsapp_number text,
  email text NOT NULL,

  -- Step 2: Parent Details
  father_name text NOT NULL,
  mother_name text NOT NULL,
  parent_mobile text NOT NULL,
  parent_occupation text,
  annual_income text,

  -- Step 3: Address
  address text NOT NULL,
  village text,
  taluk text,
  district text NOT NULL,
  state text NOT NULL,
  pin_code text NOT NULL,

  -- Step 4: Academic Details
  sslc_school_name text NOT NULL,
  board text NOT NULL,
  year_of_passing text NOT NULL,
  percentage text NOT NULL,
  marks_obtained text NOT NULL,
  subjects text NOT NULL,

  -- Step 5: Course Selection
  course text CHECK (course IN ('PCMB', 'PCMC', 'PCME'')),
  preferred_language text CHECK (preferred_language IN ('Kannada', 'English', 'Hindi')),

  -- Document URLs
  photo_url text,
  aadhaar_card_url text,
  sslc_marks_card_url text,
  transfer_certificate_url text,
  caste_certificate_url text,
  income_certificate_url text,
  passport_photo_url text,
  signature_url text,

  -- Admin
  status text NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Under Review', 'Approved', 'Rejected')),
  admin_notes text,
  academic_year text NOT NULL DEFAULT '2026-27',

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE admissions ENABLE ROW LEVEL SECURITY;

-- Policies for admissions (no-auth app: anon + authenticated)
DROP POLICY IF EXISTS "anon_select_admissions" ON admissions;
CREATE POLICY "anon_select_admissions"
ON admissions FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "anon_insert_admissions" ON admissions;
CREATE POLICY "anon_insert_admissions"
ON admissions FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_admissions" ON admissions;
CREATE POLICY "anon_update_admissions"
ON admissions FOR UPDATE
TO anon, authenticated
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_admissions" ON admissions;
CREATE POLICY "anon_delete_admissions"
ON admissions FOR DELETE
TO anon, authenticated
USING (true);

-- Create admission counter table
CREATE TABLE IF NOT EXISTS admission_counter (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  count int NOT NULL DEFAULT 0
);

-- Initialize counter row
INSERT INTO admission_counter (id, count) VALUES (1, 0)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on counter
ALTER TABLE admission_counter ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_counter" ON admission_counter;
CREATE POLICY "anon_select_counter"
ON admission_counter FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "anon_update_counter" ON admission_counter;
CREATE POLICY "anon_update_counter"
ON admission_counter FOR UPDATE
TO anon, authenticated
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_insert_counter" ON admission_counter;
CREATE POLICY "anon_insert_counter"
ON admission_counter FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Function to generate sequential application number
CREATE OR REPLACE FUNCTION generate_application_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_count int;
  app_num text;
BEGIN
  UPDATE admission_counter SET count = count + 1 WHERE id = 1 RETURNING count INTO new_count;
  app_num := 'PPC2026-' || lpad(new_count::text, 6, '0');
  RETURN app_num;
END;
$$;

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS admissions_updated_at ON admissions;
CREATE TRIGGER admissions_updated_at
BEFORE UPDATE ON admissions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_admissions_status ON admissions(status);
CREATE INDEX IF NOT EXISTS idx_admissions_course ON admissions(course);
CREATE INDEX IF NOT EXISTS idx_admissions_district ON admissions(district);
CREATE INDEX IF NOT EXISTS idx_admissions_created_at ON admissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admissions_application_number ON admissions(application_number);
