-- CRITICAL PRIVACY FIX: Strengthen consent_logs RLS policies
-- Remove overly permissive access to personal contact information

-- First, create function to log admin PII access
CREATE OR REPLACE FUNCTION public.log_admin_pii_access(
  table_name text,
  record_id text
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log PII access by admins for compliance
  INSERT INTO public.security_events (
    event_type,
    severity,
    user_id,
    details
  ) VALUES (
    'admin_pii_access',
    'high',
    auth.uid(),
    jsonb_build_object(
      'table', table_name,
      'record_id', record_id,
      'timestamp', now(),
      'justification', 'Administrative access to PII data'
    )
  );
  
  RETURN true;
END;
$$;

-- Drop existing policies that may be too permissive
DROP POLICY IF EXISTS "Users can view their own consent" ON public.consent_logs;
DROP POLICY IF EXISTS "Admins can view all consent logs" ON public.consent_logs;
DROP POLICY IF EXISTS "System can insert consent logs" ON public.consent_logs;

-- Create strict privacy-focused policies for consent_logs
-- Users can only view their own consent records
CREATE POLICY "Users can view own consent only"
ON public.consent_logs
FOR SELECT
USING (
  auth.uid() = user_id 
  OR (auth.uid() IS NOT NULL AND email = (SELECT email FROM auth.users WHERE id = auth.uid()))
);

-- Admins can view all consent logs but with mandatory audit trail
CREATE POLICY "Admins can view consent with audit"
ON public.consent_logs
FOR SELECT
USING (
  get_user_role(auth.uid()) = 'admin'::user_role
  AND log_admin_pii_access('consent_logs', id::text) = true
);

-- System can insert consent logs (for registration/consent collection)
CREATE POLICY "System can record consent"
ON public.consent_logs
FOR INSERT
WITH CHECK (true);

-- Create indexes for efficient consent lookups while protecting privacy
CREATE INDEX IF NOT EXISTS idx_consent_logs_user_type 
ON public.consent_logs (user_id, consent_type) 
WHERE consent_given = true;

CREATE INDEX IF NOT EXISTS idx_consent_logs_compliance 
ON public.consent_logs (consent_type, created_at, consent_given);

-- Add trigger function to audit consent modifications
CREATE OR REPLACE FUNCTION public.audit_consent_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log any changes to consent data (excluding PII from audit logs for privacy)
  INSERT INTO public.audit_logs (
    entity_type,
    entity_id,
    action,
    user_id,
    old_values,
    new_values
  ) VALUES (
    'consent_logs',
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    auth.uid(),
    CASE WHEN TG_OP != 'INSERT' THEN 
      jsonb_build_object(
        'consent_type', OLD.consent_type,
        'consent_given', OLD.consent_given,
        'created_at', OLD.created_at
      ) 
    ELSE NULL END,
    CASE WHEN TG_OP != 'DELETE' THEN 
      jsonb_build_object(
        'consent_type', NEW.consent_type,
        'consent_given', NEW.consent_given,
        'created_at', NEW.created_at
      ) 
    ELSE NULL END
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger for consent audit trail
DROP TRIGGER IF EXISTS audit_consent_changes_trigger ON public.consent_logs;
CREATE TRIGGER audit_consent_changes_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.consent_logs
  FOR EACH ROW EXECUTE FUNCTION public.audit_consent_changes();

-- Create function for enhanced session security validation
CREATE OR REPLACE FUNCTION public.validate_session_security(
  session_token text,
  user_agent text DEFAULT NULL,
  ip_address inet DEFAULT NULL
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  session_record record;
  suspicious_activity boolean := false;
BEGIN
  -- Get session details
  SELECT * INTO session_record
  FROM public.user_sessions
  WHERE session_token = validate_session_security.session_token
    AND is_active = true
    AND expires_at > now();
  
  -- Check if session exists and is valid
  IF NOT FOUND THEN
    -- Log invalid session attempt
    INSERT INTO public.security_events (
      event_type,
      severity,
      user_id,
      details
    ) VALUES (
      'invalid_session_access',
      'high',
      auth.uid(),
      jsonb_build_object(
        'session_token_hash', md5(session_token),
        'user_agent', user_agent,
        'ip_address', ip_address
      )
    );
    
    RETURN false;
  END IF;
  
  -- Update last activity
  UPDATE public.user_sessions
  SET last_activity = now()
  WHERE id = session_record.id;
  
  -- Check for suspicious activity patterns
  IF session_record.user_agent IS DISTINCT FROM user_agent OR 
     session_record.ip_address IS DISTINCT FROM ip_address THEN
    
    -- Log potential session hijacking
    INSERT INTO public.security_events (
      event_type,
      severity,
      user_id,
      details
    ) VALUES (
      'session_anomaly_detected',
      'critical',
      session_record.user_id,
      jsonb_build_object(
        'original_user_agent', session_record.user_agent,
        'new_user_agent', user_agent,
        'original_ip', session_record.ip_address,
        'new_ip', ip_address,
        'session_id', session_record.id
      )
    );
    
    -- Deactivate suspicious session
    UPDATE public.user_sessions
    SET is_active = false
    WHERE id = session_record.id;
    
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;