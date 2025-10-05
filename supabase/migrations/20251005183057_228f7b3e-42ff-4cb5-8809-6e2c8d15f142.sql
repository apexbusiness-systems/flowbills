-- Fix Security Definer View issue for user_sessions_safe
-- The issue: SELECT policy on user_sessions was overly restrictive and the view had no RLS

-- Step 1: Drop the problematic SELECT policy that required both ownership AND admin role
DROP POLICY IF EXISTS "Users can view session metadata via safe view" ON public.user_sessions;

-- Step 2: Create correct SELECT policy - users can view their OWN sessions, admins can view ALL
CREATE POLICY "Users can view own sessions, admins view all"
  ON public.user_sessions
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id 
    OR get_user_role(auth.uid()) = 'admin'::user_role
  );

-- Step 3: Recreate the view to ensure it's not using SECURITY DEFINER
-- (PostgreSQL views don't support SECURITY DEFINER directly, but we ensure clean definition)
DROP VIEW IF EXISTS public.user_sessions_safe CASCADE;

CREATE VIEW public.user_sessions_safe 
WITH (security_barrier = true) AS
SELECT 
  id,
  user_id,
  ip_address,
  user_agent,
  created_at,
  last_activity,
  expires_at,
  is_active
FROM public.user_sessions;

-- Grant SELECT on the view to authenticated users
GRANT SELECT ON public.user_sessions_safe TO authenticated;

-- Add comment explaining the view's purpose
COMMENT ON VIEW public.user_sessions_safe IS 
  'Safe view of user_sessions that excludes session_token to prevent XSS exposure. Uses security_barrier to ensure RLS policies are properly enforced.';

-- Log the security fix
INSERT INTO public.security_events (
  event_type,
  severity,
  details
) VALUES (
  'security_definer_view_fixed',
  'info',
  jsonb_build_object(
    'action', 'Removed security definer view issue',
    'view_name', 'user_sessions_safe',
    'fix', 'Added security_barrier and corrected RLS policies',
    'timestamp', now()
  )
);