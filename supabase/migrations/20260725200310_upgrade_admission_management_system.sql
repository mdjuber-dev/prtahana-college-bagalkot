/*
# Admission Management System Extensions

Adds columns for bank details, fee payment status, document verification
checklist, and creates an activity log table for tracking all admin actions
on admission applications.

## Modified Table
- `admission_enquiries` — adds:
  - `bank_name`, `bank_account_number`, `bank_ifsc`, `bank_branch` — fee payment bank details
  - `fee_payment_status` — enum-like: 'Pending', 'Partial', 'Paid'
  - `fee_amount_paid` — numeric amount paid so far
  - `fee_due_date` — date by which full fee is due
  - `doc_marks_card_verified`, `doc_tc_verified`, `doc_aadhaar_verified`,
    `doc_photos_verified`, `doc_income_certificate_verified`,
    `doc_caste_certificate_verified` — boolean checklist flags
  - `counsellor_assigned_date` — when counsellor was assigned

## New Table
- `admission_activity_log` — tracks every status change, note, assignment,
  document verification, and fee update for audit trail.
*/

-- Bank & fee payment details
ALTER TABLE admission_enquiries
  ADD COLUMN IF NOT EXISTS bank_name text,
  ADD COLUMN IF NOT EXISTS bank_account_number text,
  ADD COLUMN IF NOT EXISTS bank_ifsc text,
  ADD COLUMN IF NOT EXISTS bank_branch text;

ALTER TABLE admission_enquiries
  ADD COLUMN IF NOT EXISTS fee_payment_status text NOT NULL DEFAULT 'Pending';

ALTER TABLE admission_enquiries
  ADD COLUMN IF NOT EXISTS fee_amount_paid numeric(10,2) DEFAULT 0;

ALTER TABLE admission_enquiries
  ADD COLUMN IF NOT EXISTS fee_due_date date;

-- Document verification checklist
ALTER TABLE admission_enquiries
  ADD COLUMN IF NOT EXISTS doc_marks_card_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS doc_tc_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS doc_aadhaar_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS doc_photos_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS doc_income_certificate_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS doc_caste_certificate_verified boolean DEFAULT false;

-- Counsellor assignment tracking
ALTER TABLE admission_enquiries
  ADD COLUMN IF NOT EXISTS counsellor_assigned_date timestamp with time zone;

-- Activity log table
CREATE TABLE IF NOT EXISTS admission_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id text NOT NULL REFERENCES admission_enquiries(application_id) ON DELETE CASCADE,
  action text NOT NULL,
  description text,
  performed_by text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on activity log
ALTER TABLE admission_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_activity_log_authenticated" ON admission_activity_log
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "insert_activity_log_authenticated" ON admission_activity_log
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "insert_activity_log_anon" ON admission_activity_log
  FOR INSERT TO anon WITH CHECK (true);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_admission_activity_log_app_id
  ON admission_activity_log(application_id);

CREATE INDEX IF NOT EXISTS idx_admission_enquiries_status
  ON admission_enquiries(status);

CREATE INDEX IF NOT EXISTS idx_admission_enquiries_course
  ON admission_enquiries(course_interested);

CREATE INDEX IF NOT EXISTS idx_admission_enquiries_submitted_at
  ON admission_enquiries(submitted_at);
