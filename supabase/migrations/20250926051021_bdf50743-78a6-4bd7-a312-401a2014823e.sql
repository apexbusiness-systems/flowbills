-- Phase 2 Schema Extensions (Fixed JSONB casting)

-- Add policies table for approval rules
CREATE TABLE IF NOT EXISTS public.policies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  policy_name TEXT NOT NULL,
  policy_type TEXT NOT NULL,
  conditions JSONB NOT NULL,
  actions JSONB NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add fraud flags table
CREATE TABLE IF NOT EXISTS public.fraud_flags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  flag_type TEXT NOT NULL,
  risk_score INTEGER NOT NULL DEFAULT 0,
  details JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  resolved_by UUID,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Email templates table
CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_name TEXT NOT NULL UNIQUE,
  template_type TEXT NOT NULL,
  subject_template TEXT NOT NULL,
  body_template TEXT NOT NULL,
  variables JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enhance existing tables
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS bank_account TEXT;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS iban TEXT;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS swift_code TEXT;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending';

ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS raw_text TEXT;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS field_confidence_scores JSONB;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS ocr_metadata JSONB;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS approval_policy_id UUID;

-- Enable RLS
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_flags ENABLE ROW LEVEL SECURITY; 
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Insert default policies with proper JSONB casting
INSERT INTO public.policies (policy_name, policy_type, conditions, actions, priority) 
VALUES 
  ('High Value Approval', 'approval', '{"amount_threshold": 10000}', '{"require_approvals": 2}', 1),
  ('Fraud Detection', 'fraud', '{"check_duplicates": true}', '{"create_flag": true}', 2)
ON CONFLICT DO NOTHING;

-- Insert default email templates
INSERT INTO public.email_templates (template_name, template_type, subject_template, body_template) 
VALUES 
  ('approval_request', 'approval', 'Approval Required', 'Invoice requires your approval'),
  ('fraud_alert', 'fraud', 'Fraud Alert', 'Potential fraud detected')
ON CONFLICT DO NOTHING;