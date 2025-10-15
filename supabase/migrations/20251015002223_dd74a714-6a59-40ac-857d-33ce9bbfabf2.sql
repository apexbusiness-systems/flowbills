-- P10: Support Tickets & Intervention System
CREATE TABLE public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number TEXT NOT NULL UNIQUE,
  call_log_id UUID REFERENCES public.support_call_logs(id),
  category TEXT NOT NULL, -- 'billing', 'einvoicing', 'platform_ocr', 'security', 'privacy'
  priority TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  status TEXT NOT NULL DEFAULT 'open', -- 'open', 'in_progress', 'resolved', 'closed'
  masked_org_context JSONB, -- Masked organization data for privacy
  request_id TEXT NOT NULL,
  customer_id UUID,
  assigned_to UUID,
  resolution_notes TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX idx_support_tickets_category ON public.support_tickets(category);
CREATE INDEX idx_support_tickets_assigned_to ON public.support_tickets(assigned_to);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and operators can view support tickets"
ON public.support_tickets FOR SELECT
TO authenticated
USING (get_user_role(auth.uid()) = ANY(ARRAY['admin'::user_role, 'operator'::user_role]));

CREATE POLICY "Admins and operators can manage support tickets"
ON public.support_tickets FOR ALL
TO authenticated
USING (get_user_role(auth.uid()) = ANY(ARRAY['admin'::user_role, 'operator'::user_role]))
WITH CHECK (get_user_role(auth.uid()) = ANY(ARRAY['admin'::user_role, 'operator'::user_role]));

-- P11: Support Playbooks System
CREATE TABLE public.support_playbooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playbook_name TEXT NOT NULL UNIQUE,
  playbook_type TEXT NOT NULL, -- 'identity_verification', 'dispute_flow', 'duplicate_rationale', 'schema_error_coaching'
  description TEXT,
  steps JSONB NOT NULL, -- Array of step objects with instructions
  estimated_duration_minutes INTEGER,
  sla_hours INTEGER, -- SLA for completion
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_support_playbooks_type ON public.support_playbooks(playbook_type);

ALTER TABLE public.support_playbooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view playbooks"
ON public.support_playbooks FOR SELECT
TO authenticated
USING (is_active = true);

CREATE POLICY "Admins can manage playbooks"
ON public.support_playbooks FOR ALL
TO authenticated
USING (get_user_role(auth.uid()) = 'admin'::user_role)
WITH CHECK (get_user_role(auth.uid()) = 'admin'::user_role);

-- P11: QA Scorecards
CREATE TABLE public.support_qa_scorecards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_log_id UUID REFERENCES public.support_call_logs(id),
  ticket_id UUID REFERENCES public.support_tickets(id),
  agent_email TEXT,
  reviewer_id UUID,
  reason_score INTEGER CHECK (reason_score >= 0 AND reason_score <= 10),
  fcr_achieved BOOLEAN, -- First Call Resolution
  aht_minutes INTEGER, -- Average Handle Time
  empathy_score INTEGER CHECK (empathy_score >= 0 AND empathy_score <= 10),
  policy_accuracy_score INTEGER CHECK (policy_accuracy_score >= 0 AND policy_accuracy_score <= 10),
  total_score INTEGER,
  feedback TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_support_qa_scorecards_agent ON public.support_qa_scorecards(agent_email);
CREATE INDEX idx_support_qa_scorecards_reviewed_at ON public.support_qa_scorecards(reviewed_at);

ALTER TABLE public.support_qa_scorecards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view QA scorecards"
ON public.support_qa_scorecards FOR SELECT
TO authenticated
USING (get_user_role(auth.uid()) = 'admin'::user_role);

CREATE POLICY "Admins can manage QA scorecards"
ON public.support_qa_scorecards FOR ALL
TO authenticated
USING (get_user_role(auth.uid()) = 'admin'::user_role)
WITH CHECK (get_user_role(auth.uid()) = 'admin'::user_role);

-- Link support tickets to HIL queue
ALTER TABLE public.review_queue
ADD COLUMN support_ticket_id UUID REFERENCES public.support_tickets(id);

-- Add SLA tracking to review queue
ALTER TABLE public.review_queue
ADD COLUMN sla_deadline TIMESTAMP WITH TIME ZONE;

-- Seed initial playbooks
INSERT INTO public.support_playbooks (playbook_name, playbook_type, description, steps, estimated_duration_minutes, sla_hours) VALUES
(
  'Identity Verification (OTP)',
  'identity_verification',
  'Verify customer identity using one-time password sent to registered email or phone',
  '[
    {"step": 1, "action": "Confirm customer name and company", "notes": "Ask for full legal name and company registration"},
    {"step": 2, "action": "Verify registered contact", "notes": "Confirm email or phone number on file"},
    {"step": 3, "action": "Send OTP", "notes": "Generate and send 6-digit code valid for 10 minutes"},
    {"step": 4, "action": "Validate OTP", "notes": "Customer provides code, verify within 3 attempts"},
    {"step": 5, "action": "Document verification", "notes": "Log verification in security_events table"}
  ]'::jsonb,
  10,
  1
),
(
  'Dispute Flow',
  'dispute_flow',
  'Handle billing or invoice disputes with proper escalation',
  '[
    {"step": 1, "action": "Gather dispute details", "notes": "Invoice number, amount, and specific concern"},
    {"step": 2, "action": "Review billing history", "notes": "Check billing_usage and billing_subscriptions tables"},
    {"step": 3, "action": "Validate calculation", "notes": "Use pricing.ts functions to verify charges"},
    {"step": 4, "action": "Determine resolution", "notes": "If <$500, resolve directly. If >$500, escalate to Finance"},
    {"step": 5, "action": "Document outcome", "notes": "Update ticket with resolution or escalation notes"}
  ]'::jsonb,
  15,
  4
),
(
  'Duplicate Rationale',
  'duplicate_rationale',
  'Explain duplicate detection and help resolve false positives',
  '[
    {"step": 1, "action": "Locate flagged invoice", "notes": "Query invoices table by invoice_number or id"},
    {"step": 2, "action": "Check duplicate_hash", "notes": "Find all invoices with same hash"},
    {"step": 3, "action": "Compare details", "notes": "Review vendor, amount, date, PO number for differences"},
    {"step": 4, "action": "Explain detection", "notes": "Walk through how duplicate was identified"},
    {"step": 5, "action": "Override if valid", "notes": "Clear fraud flag and update status to pending if legitimate"}
  ]'::jsonb,
  12,
  2
),
(
  'Schema Error Coaching',
  'schema_error_coaching',
  'Help customers fix e-invoicing validation errors',
  '[
    {"step": 1, "action": "Identify validation errors", "notes": "Check einvoice_documents.validation_results"},
    {"step": 2, "action": "Review country rules", "notes": "Query country_validations for specific failures"},
    {"step": 3, "action": "Explain error", "notes": "Translate technical error to customer-friendly language"},
    {"step": 4, "action": "Provide fix steps", "notes": "Reference country-specific documentation and examples"},
    {"step": 5, "action": "Test correction", "notes": "Offer to validate corrected document"}
  ]'::jsonb,
  20,
  4
);

-- Update trigger for support_tickets
CREATE TRIGGER update_support_tickets_updated_at
BEFORE UPDATE ON public.support_tickets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update trigger for support_playbooks
CREATE TRIGGER update_support_playbooks_updated_at
BEFORE UPDATE ON public.support_playbooks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();