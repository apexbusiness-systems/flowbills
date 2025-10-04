-- ============================================================================
-- CONSENT LOGS SECURITY FIX - Focused Implementation
-- ============================================================================

-- Step 1: Create validation function (simplified)
CREATE OR REPLACE FUNCTION public.validate_anonymous_consent(
  p_email text,
  p_phone text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Must provide at least email OR phone
  IF (p_email IS NULL OR p_email = '') AND (p_phone IS NULL OR p_phone = '') THEN
    RAISE EXCEPTION 'Anonymous consent must include email or phone number';
  END IF;
  
  -- Email format validation
  IF p_email IS NOT NULL AND p_email != '' THEN
    IF NOT (p_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$') THEN
      RAISE EXCEPTION 'Invalid email format';
    END IF;
  END IF;
  
  -- Phone format validation (basic)
  IF p_phone IS NOT NULL AND p_phone != '' THEN
    IF length(regexp_replace(p_phone, '[^0-9+]', '', 'g')) < 10 THEN
      RAISE EXCEPTION 'Invalid phone format. Must be at least 10 digits';
    END IF;
  END IF;
  
  RETURN true;
END;
$$;

-- Step 2: Update the anonymous consent policy
DROP POLICY IF EXISTS "Anonymous users can record consent" ON public.consent_logs;

CREATE POLICY "Anonymous users can record consent"
ON public.consent_logs
FOR INSERT
TO anon, authenticated
WITH CHECK (
  user_id IS NULL 
  AND validate_anonymous_consent(email, phone) = true
);

-- Step 3: Add database constraint for email/phone requirement
DO $$ 
BEGIN
  -- Drop constraint if it exists (idempotent)
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'check_email_or_phone_for_anonymous'
      AND table_name = 'consent_logs'
  ) THEN
    ALTER TABLE public.consent_logs DROP CONSTRAINT check_email_or_phone_for_anonymous;
  END IF;
  
  -- Add constraint
  ALTER TABLE public.consent_logs
    ADD CONSTRAINT check_email_or_phone_for_anonymous
    CHECK (
      user_id IS NOT NULL 
      OR (email IS NOT NULL AND email != '') 
      OR (phone IS NOT NULL AND phone != '')
    );
END $$;

-- Step 4: Add length constraints (idempotent)
DO $$ 
BEGIN
  -- Email length
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE constraint_name = 'check_email_length' AND table_name = 'consent_logs'
  ) THEN
    ALTER TABLE public.consent_logs
      ADD CONSTRAINT check_email_length
      CHECK (email IS NULL OR length(email) <= 255);
  END IF;
  
  -- Phone length
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE constraint_name = 'check_phone_length' AND table_name = 'consent_logs'
  ) THEN
    ALTER TABLE public.consent_logs
      ADD CONSTRAINT check_phone_length
      CHECK (phone IS NULL OR length(phone) <= 20);
  END IF;
END $$;

-- Step 5: Grant execute permissions
GRANT EXECUTE ON FUNCTION public.validate_anonymous_consent TO anon, authenticated;

-- Success message
DO $$ 
BEGIN
  RAISE NOTICE 'Consent logs security fix applied successfully';
END $$;