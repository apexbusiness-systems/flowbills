-- Fix critical security vulnerability in leads table
-- Remove overly permissive policy that allows all authenticated users to read leads
DROP POLICY IF EXISTS "Authenticated users can manage leads" ON public.leads;

-- Create restrictive policies for lead management
-- Only admins can read/manage leads data
CREATE POLICY "Admins can view all leads" 
ON public.leads 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update leads" 
ON public.leads 
FOR UPDATE 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete leads" 
ON public.leads 
FOR DELETE 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Keep the anonymous INSERT policy for legitimate website lead capture
-- (This policy already exists and is secure for its purpose)