-- Safely repair public.admissions.updated_at without touching existing rows,
-- policies, table ownership, or any admission data.

ALTER TABLE public.admissions
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

DO $$
DECLARE
  backfill_expr text;
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'admissions'
      AND column_name = 'created_at'
  ) THEN
    backfill_expr := 'COALESCE(updated_at, created_at, now())';
  ELSIF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'admissions'
      AND column_name = 'submitted_at'
  ) THEN
    backfill_expr := 'COALESCE(updated_at, submitted_at, now())';
  ELSE
    backfill_expr := 'COALESCE(updated_at, now())';
  END IF;

  EXECUTE format(
    'UPDATE public.admissions SET updated_at = %s WHERE updated_at IS NULL',
    backfill_expr
  );
END $$;

CREATE OR REPLACE FUNCTION public.set_admissions_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_admissions_updated_at ON public.admissions;
CREATE TRIGGER trg_admissions_updated_at
  BEFORE UPDATE ON public.admissions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_admissions_updated_at();

NOTIFY pgrst, 'reload schema';
